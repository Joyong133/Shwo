package kr.shwo.focuslock;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.hardware.display.DisplayManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.TypedValue;
import android.view.Display;
import android.view.Gravity;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * 터치 잠금의 핵심.
 *
 * 접근성 서비스만 띄울 수 있는 "접근성 오버레이" 창(상태바·내비게이션바보다 위)을 화면 전체에 투명하게 씌워
 * 모든 터치를 이 창이 받아서 버린다. 화면 내용은 그대로 보이므로 미러링 화면에는 아무 변화가 없다.
 *
 * 잠금이 걸리는 경우
 *  - 자동: 외부 화면(USB-C/HDMI 모니터, AR·VR 글래스, 스마트뷰·Miracast 무선 미러링)이 연결됨
 *  - 자동: (Android 15+) 이 휴대폰 화면이 화면 공유·녹화되고 있음
 *  - 수동: 앱 / 빠른 설정 타일에서 직접 잠금 (선택한 시간이 지나면 자동 해제)
 *
 * 잠금 중에 함께 막는 원격 입력 (VR 등에서 휴대폰을 조작할 때)
 *  - VR 컨트롤러 클릭·손 핀치가 휴대폰에 "터치"로 전달되는 경우 → 오버레이가 받아서 버림
 *  - 마우스 포인터 클릭·스크롤 → 오버레이가 받아서 버림
 *  - 키보드·게임패드·컨트롤러 버튼 (볼륨·전원 제외) → onKeyEvent 에서 버림
 *  - 게임패드·컨트롤러 스틱, 휠 (Android 14+) → setMotionEventSources 로 가로채서 버림
 *
 * 잠금이 풀리는 경우
 *  - 볼륨 아래 버튼 3번 빠르게 (2초 안에)
 *  - 두 손가락으로 화면을 3초 누르기 (설정에서 끌 수 있음)
 *  - 외부 화면 연결 해제 / 화면 공유 종료 (자동 잠금인 경우)
 *  - 수동 잠금 시간 종료, 또는 접근성 서비스 끄기
 */
public class TouchLockService extends AccessibilityService implements DisplayManager.DisplayListener {

    /** 같은 프로세스 안에서 액티비티·타일이 서비스에 접근하는 통로 */
    private static TouchLockService instance;
    private static final List<Runnable> listeners = new ArrayList<>();

    static TouchLockService get() { return instance; }
    static void addListener(Runnable r) { listeners.add(r); }
    static void removeListener(Runnable r) { listeners.remove(r); }

    private static final long VOLUME_WINDOW_MS = 2000;
    private static final int VOLUME_PRESSES = 3;
    private static final long TWO_FINGER_HOLD_MS = 3000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private WindowManager wm;
    private DisplayManager dm;

    private View overlay;          // 터치를 막는 전체 화면 창
    private View probe;            // (Android 15+) 화면 공유 감지용 1px 투명 창
    private Object recordingCallback;

    private boolean manualLock;    // 사용자가 직접 건 잠금
    private long manualUntil;      // 수동 잠금 종료 시각 (elapsedRealtime, 0 = 무제한)
    private boolean recording;     // 화면 공유·녹화 중
    private boolean suppressAuto;  // 사용자가 자동 잠금을 풀었음 → 연결이 바뀔 때까지 다시 잠그지 않음
    private boolean screenOn = true;
    private int lastExternalCount = -1;

    private final long[] volumePresses = new long[VOLUME_PRESSES];
    private int volumeIdx;

    private final Runnable manualTimeout = () -> {
        manualLock = false;
        manualUntil = 0;
        toast("집중 시간이 끝나 터치 잠금을 풀었습니다");
        update();
    };

    private final Runnable twoFingerUnlock = () -> unlockByUser("두 손가락 길게 누르기");

    private final BroadcastReceiver screenReceiver = new BroadcastReceiver() {
        @Override public void onReceive(Context context, Intent intent) {
            String a = intent.getAction();
            if (Intent.ACTION_SCREEN_OFF.equals(a)) {
                // 화면이 꺼지면 막을 걷어 둔다: 잠금화면(PIN 입력)을 막지 않기 위해.
                screenOn = false;
            } else if (Intent.ACTION_USER_PRESENT.equals(a)) {
                // 잠금화면을 푼 뒤에 막을 다시 씌운다.
                screenOn = true;
            } else if (Intent.ACTION_SCREEN_ON.equals(a)) {
                // 잠금화면이 없는 기기는 USER_PRESENT 가 오지 않을 수 있다.
                android.app.KeyguardManager km = getSystemService(android.app.KeyguardManager.class);
                if (km == null || !km.isKeyguardLocked()) screenOn = true;
            }
            update();
        }
    };

    // ───────────────────────── 서비스 생명주기 ─────────────────────────

    @Override
    protected void onServiceConnected() {
        instance = this;
        wm = getSystemService(WindowManager.class);
        dm = getSystemService(DisplayManager.class);
        dm.registerDisplayListener(this, handler);

        IntentFilter f = new IntentFilter();
        f.addAction(Intent.ACTION_SCREEN_OFF);
        f.addAction(Intent.ACTION_SCREEN_ON);
        f.addAction(Intent.ACTION_USER_PRESENT);
        registerReceiver(screenReceiver, f);

        setupRecordingDetection();
        RemoteApp.setControlCut(this, false); // 지난번에 꺼 둔 채 끝났다면 복구
        update();
    }

    @Override
    public void onDestroy() {
        teardown();
        super.onDestroy();
    }

    @Override
    public boolean onUnbind(Intent intent) {
        teardown();
        return super.onUnbind(intent);
    }

    private void teardown() {
        if (instance != this) return;
        handler.removeCallbacksAndMessages(null);
        try { dm.unregisterDisplayListener(this); } catch (Exception ignored) {}
        try { unregisterReceiver(screenReceiver); } catch (Exception ignored) {}
        removeRecordingDetection();
        removeOverlay();
        setRemoteMotionBlock(false);
        RemoteApp.setControlCut(this, false);
        instance = null;
        notifyListeners();
    }

    @Override public void onAccessibilityEvent(AccessibilityEvent event) {}
    @Override public void onInterrupt() {}

    // ───────────────────────── 외부 화면 감지 ─────────────────────────

    /** 휴대폰 본 화면 말고 켜져 있는 공개 디스플레이 = 외부 모니터·글래스·무선 미러링 */
    List<Display> externalDisplays() {
        List<Display> out = new ArrayList<>();
        if (dm == null) return out;
        for (Display d : dm.getDisplays()) {
            if (d.getDisplayId() == Display.DEFAULT_DISPLAY) continue;
            if ((d.getFlags() & Display.FLAG_PRIVATE) != 0) continue;
            if (d.getState() == Display.STATE_OFF) continue;
            out.add(d);
        }
        return out;
    }

    @Override public void onDisplayAdded(int displayId) { update(); }
    @Override public void onDisplayRemoved(int displayId) { update(); }
    @Override public void onDisplayChanged(int displayId) { update(); }

    // ───────────────────────── 화면 공유 감지 (Android 15+) ─────────────────────────

    private void setupRecordingDetection() {
        if (Build.VERSION.SDK_INT < 35) return;
        try {
            // 녹화 콜백은 "이 앱의 창"이 녹화에 보이는지 알려준다 → 눈에 안 띄는 1px 창을 하나 띄워 둔다.
            WindowManager.LayoutParams lp = new WindowManager.LayoutParams(1, 1,
                    WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                            | WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT);
            lp.gravity = Gravity.TOP | Gravity.START;
            probe = new View(this);
            wm.addView(probe, lp);
            Consumer<Integer> cb = state -> handler.post(() -> {
                recording = state == WindowManager.SCREEN_RECORDING_STATE_VISIBLE;
                update();
            });
            int initial = wm.addScreenRecordingCallback(getMainExecutor(), cb);
            recordingCallback = cb;
            recording = initial == WindowManager.SCREEN_RECORDING_STATE_VISIBLE;
        } catch (Throwable t) {
            // 권한/기기 미지원 → 외부 화면 감지만 사용
            removeRecordingDetection();
        }
    }

    @SuppressWarnings("unchecked")
    private void removeRecordingDetection() {
        if (Build.VERSION.SDK_INT >= 35 && recordingCallback != null) {
            try { wm.removeScreenRecordingCallback((Consumer<Integer>) recordingCallback); } catch (Throwable ignored) {}
        }
        recordingCallback = null;
        if (probe != null) {
            try { wm.removeView(probe); } catch (Exception ignored) {}
            probe = null;
        }
    }

    boolean recordingDetectionAvailable() { return recordingCallback != null; }
    boolean isRecording() { return recording; }

    // ───────────────────────── 잠금 상태 계산 ─────────────────────────

    boolean autoConditionActive() {
        boolean ext = Prefs.autoDisplay(this) && !externalDisplays().isEmpty();
        boolean rec = Prefs.autoRecording(this) && recording;
        return ext || rec || remoteAppActive();
    }

    /** Spatial Phone 등 원격 조작 앱이 연결 중 (상시 알림 감지) */
    boolean remoteAppActive() { return Prefs.autoTarget(this) && NotifWatcher.isTargetActive(); }

    boolean isLocked() { return manualLock || (autoConditionActive() && !suppressAuto); }
    boolean isManualLock() { return manualLock; }
    long manualRemainingMs() {
        return manualUntil == 0 ? 0 : Math.max(0, manualUntil - SystemClock.elapsedRealtime());
    }

    /** 모든 상태 변화 후 호출: 막을 씌울지 걷을지 결정 */
    void update() {
        if (instance != this) return;

        // 연결 상태가 바뀌면 "사용자가 풀어 둠" 기록을 지운다 (다음 연결 때 다시 자동 잠금)
        int ext = externalDisplays().size() + (recording ? 1 : 0) + (remoteAppActive() ? 1 : 0);
        if (ext != lastExternalCount) {
            if (lastExternalCount > 0 && ext == 0 && !manualLock && overlay != null) {
                toast("연결이 끊겨 터치 잠금을 풀었습니다");
            }
            if (ext == 0 || ext > Math.max(lastExternalCount, 0)) suppressAuto = false;
            lastExternalCount = ext;
        }

        if (isLocked() && screenOn) showOverlay(); else removeOverlay();
        setRemoteMotionBlock(overlay != null && Prefs.blockRemote(this));
        updateControlCut();
        notifyListeners();
    }

    // ───────────────────────── 원격 조작 앱의 조작 기능 잠시 끄기 (고급) ─────────────────────────

    private long cutAt;

    private void updateControlCut() {
        boolean want = overlay != null && Prefs.cutControl(this) && Prefs.blockRemote(this);
        boolean was = RemoteApp.isControlCut(this);
        if (want && !was) {
            RemoteApp.setControlCut(this, true);
            if (RemoteApp.isControlCut(this)) cutAt = SystemClock.elapsedRealtime();
        } else if (!want && was) {
            // 조작 기능을 끄자마자 그 앱의 연결이 끊겼다면 = 그 앱은 조작 기능 없이 연결을 유지하지 못함
            // → 계속 켰다 껐다 하지 않도록 이 기능을 끈다
            if (!manualLock && cutAt != 0 && SystemClock.elapsedRealtime() - cutAt < 5000) {
                Prefs.put(this, Prefs.CUT_CONTROL, false);
                toast("조작 기능을 끄면 연결이 끊겨서 '조작 기능 완전히 끄기'를 해제했습니다");
            }
            RemoteApp.setControlCut(this, false);
            cutAt = 0;
        }
    }

    // ───────────────────────── 수동 잠금 (앱·타일) ─────────────────────────

    void startManualLock(long delayMs) {
        handler.removeCallbacks(startManualRunnable);
        if (delayMs > 0) {
            handler.postDelayed(startManualRunnable, delayMs);
            toast((delayMs / 1000) + "초 뒤에 터치가 잠깁니다");
        } else {
            startManualRunnable.run();
        }
    }

    private final Runnable startManualRunnable = () -> {
        manualLock = true;
        int min = Prefs.minutes(this);
        handler.removeCallbacks(manualTimeout);
        if (min > 0) {
            manualUntil = SystemClock.elapsedRealtime() + min * 60_000L;
            handler.postDelayed(manualTimeout, min * 60_000L);
        } else {
            manualUntil = 0;
        }
        toast("터치 잠금 시작 · 해제: 볼륨 아래 버튼 3번");
        update();
    };

    /** 앱 화면의 "끄기" 버튼 등 — 사용자가 직접 끔 */
    void unlockByUser(String how) {
        handler.removeCallbacks(startManualRunnable);
        handler.removeCallbacks(manualTimeout);
        boolean wasLocked = isLocked();
        manualLock = false;
        manualUntil = 0;
        if (autoConditionActive()) suppressAuto = true;
        if (wasLocked) toast("터치 잠금 해제 (" + how + ")");
        update();
    }

    /** 자동 잠금을 풀어 둔 상태에서 다시 걸기 */
    void resumeAuto() {
        suppressAuto = false;
        update();
    }

    boolean isAutoSuppressed() { return suppressAuto && autoConditionActive(); }

    // ───────────────────────── 볼륨 버튼으로 해제 ─────────────────────────

    @Override
    protected boolean onKeyEvent(KeyEvent event) {
        if (overlay == null) return false;
        int code = event.getKeyCode();
        if (code == KeyEvent.KEYCODE_VOLUME_DOWN
                && event.getAction() == KeyEvent.ACTION_DOWN
                && event.getRepeatCount() == 0) {
            long now = SystemClock.uptimeMillis();
            volumePresses[volumeIdx % VOLUME_PRESSES] = now;
            volumeIdx++;
            long oldest = volumePresses[volumeIdx % VOLUME_PRESSES];
            if (volumeIdx >= VOLUME_PRESSES && now - oldest <= VOLUME_WINDOW_MS) {
                volumeIdx = 0;
                unlockByUser("볼륨 버튼");
            }
        }
        if (isPassThroughKey(code)) return false; // 볼륨·전원은 평소대로 동작
        // 그 밖의 키 = 원격(VR 컨트롤러·키보드·게임패드)이 보내는 입력 → 버림
        return Prefs.blockRemote(this);
    }

    private static boolean isPassThroughKey(int code) {
        switch (code) {
            case KeyEvent.KEYCODE_VOLUME_UP:
            case KeyEvent.KEYCODE_VOLUME_DOWN:
            case KeyEvent.KEYCODE_VOLUME_MUTE:
            case KeyEvent.KEYCODE_POWER:
            case KeyEvent.KEYCODE_SLEEP:
            case KeyEvent.KEYCODE_WAKEUP:
                return true;
            default:
                return false;
        }
    }

    // ───────────────────────── 원격 포인터·스틱 입력 차단 (Android 14+) ─────────────────────────

    /** 조이스틱(게임패드·VR 컨트롤러 스틱), 트랙볼, 휠 입력을 서비스가 가로채서 버린다 */
    private void setRemoteMotionBlock(boolean on) {
        if (Build.VERSION.SDK_INT < 34) return;
        try {
            AccessibilityServiceInfo info = getServiceInfo();
            if (info == null) return;
            int sources = on ? (InputDevice.SOURCE_JOYSTICK
                    | InputDevice.SOURCE_TRACKBALL
                    | InputDevice.SOURCE_ROTARY_ENCODER) : 0;
            if (info.getMotionEventSources() == sources) return;
            info.setMotionEventSources(sources);
            setServiceInfo(info);
        } catch (Throwable ignored) {}
    }

    @Override
    public void onMotionEvent(MotionEvent event) {
        // 잠금 중 가로챈 스틱·휠 입력: 아무 데도 전달하지 않는다
    }

    // ───────────────────────── 오버레이 ─────────────────────────

    private void showOverlay() {
        if (overlay != null) {
            refreshBadge();
            return;
        }
        FrameLayout root = new FrameLayout(this) {
            @Override public boolean dispatchTouchEvent(MotionEvent e) {
                handleTouch(e);
                return true; // 모든 터치를 삼킨다
            }
        };
        root.setBackgroundColor(Color.TRANSPARENT);

        TextView badge = new TextView(this);
        badge.setText("🔒 터치 잠금 중");
        badge.setTextColor(Color.WHITE);
        badge.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        int p = dp(6);
        badge.setPadding(p * 2, p, p * 2, p);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(0x99000000);
        bg.setCornerRadius(dp(20));
        badge.setBackground(bg);
        badge.setTag("badge");
        FrameLayout.LayoutParams blp = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.TOP | Gravity.CENTER_HORIZONTAL);
        blp.topMargin = dp(36);
        root.addView(badge, blp);

        WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE        // 키 입력(볼륨 등)은 막지 않음
                        | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                        | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.TOP | Gravity.START;
        if (Build.VERSION.SDK_INT >= 28) {
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        try {
            wm.addView(root, lp);
            overlay = root;
            refreshBadge();
        } catch (Exception e) {
            overlay = null;
        }
    }

    private void refreshBadge() {
        if (overlay == null) return;
        View badge = overlay.findViewWithTag("badge");
        if (badge != null) badge.setVisibility(Prefs.showBadge(this) ? View.VISIBLE : View.GONE);
    }

    private void removeOverlay() {
        handler.removeCallbacks(twoFingerUnlock);
        if (overlay == null) return;
        try { wm.removeView(overlay); } catch (Exception ignored) {}
        overlay = null;
    }

    /** 두 손가락으로 3초 누르고 있으면 해제 */
    private void handleTouch(MotionEvent e) {
        if (!Prefs.twoFinger(this)) return;
        switch (e.getActionMasked()) {
            case MotionEvent.ACTION_POINTER_DOWN:
                if (e.getPointerCount() == 2) handler.postDelayed(twoFingerUnlock, TWO_FINGER_HOLD_MS);
                else handler.removeCallbacks(twoFingerUnlock);
                break;
            case MotionEvent.ACTION_POINTER_UP:
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                handler.removeCallbacks(twoFingerUnlock);
                break;
            default:
                break;
        }
    }

    // ───────────────────────── 유틸 ─────────────────────────

    private void notifyListeners() {
        for (Runnable r : new ArrayList<>(listeners)) r.run();
        LockTileService.requestRefresh(this);
    }

    private void toast(String msg) {
        handler.post(() -> Toast.makeText(this, msg, Toast.LENGTH_SHORT).show());
    }

    private int dp(int v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }
}

package com.shwo.qpbridge;

import android.Manifest;
import android.accessibilityservice.AccessibilityService;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.BluetoothManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.Settings;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

/** 메타퀘스트: 휴대폰 화면 보기 + 조작. */
public class ViewerActivity extends Activity implements Hub.Listener, VideoDecoder.Callback {

    private static final int REQ_PERMS = 1;
    private static final int MAX_POINTS = 60;

    private final Handler main = new Handler(Looper.getMainLooper());
    private Hub hub;
    private SharedPreferences prefs;
    private VideoDecoder decoder;
    private boolean wasReady;
    private boolean hasVideo;
    private int quality;

    private AspectFrame videoFrame;
    private SurfaceView surface;
    private TextView overlay, linkStatus, latencyText, phoneStatus, logText;
    private Button findBtn, disconnectBtn;
    private LinearLayout peerList;
    private Button[] qualityBtns;
    private EditText textInput;

    // 터치 기록
    private final float[] xs = new float[MAX_POINTS], ys = new float[MAX_POINTS];
    private int nPoints;
    private long downTime;
    private float downX, downY, maxMove;

    // 스틱 스크롤
    private float hoverX = 0.5f, hoverY = 0.5f, scrollAccX, scrollAccY;
    private final Runnable flushScroll = this::sendScroll;

    private final Runnable pinger = new Runnable() {
        @Override
        public void run() {
            if (hub.isReady()) hub.send(Proto.PING, Proto.longBytes(SystemClock.elapsedRealtime()));
            main.postDelayed(this, 2000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_viewer);
        prefs = getSharedPreferences("qpbridge", MODE_PRIVATE);
        quality = prefs.getInt("quality", 1);

        videoFrame = findViewById(R.id.videoFrame);
        surface = findViewById(R.id.surface);
        overlay = findViewById(R.id.overlay);
        linkStatus = findViewById(R.id.linkStatus);
        latencyText = findViewById(R.id.latencyText);
        phoneStatus = findViewById(R.id.phoneStatus);
        logText = findViewById(R.id.logText);
        findBtn = findViewById(R.id.findBtn);
        disconnectBtn = findViewById(R.id.disconnectBtn);
        peerList = findViewById(R.id.peerList);
        textInput = findViewById(R.id.textInput);
        qualityBtns = new Button[]{findViewById(R.id.q0), findViewById(R.id.q1), findViewById(R.id.q2)};

        hub = Hub.get(this);
        decoder = new VideoDecoder(this);
        hub.addListener(this);
        hub.usb.start();

        surface.getHolder().addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder h) {
                decoder.setSurface(h.getSurface());
            }

            @Override
            public void surfaceChanged(SurfaceHolder h, int format, int width, int height) {}

            @Override
            public void surfaceDestroyed(SurfaceHolder h) {
                decoder.setSurface(null);
            }
        });
        setupTouch();

        findBtn.setOnClickListener(v -> {
            BleCentralLink ble = (BleCentralLink) hub.ble;
            if (ble.isScanning()) ble.stop();
            else startBluetooth();
        });
        disconnectBtn.setOnClickListener(v -> {
            hub.ble.disconnect();
            hub.usb.disconnect();
        });
        bindGlobal(R.id.backBtn, AccessibilityService.GLOBAL_ACTION_BACK);
        bindGlobal(R.id.homeBtn, AccessibilityService.GLOBAL_ACTION_HOME);
        bindGlobal(R.id.recentsBtn, AccessibilityService.GLOBAL_ACTION_RECENTS);
        bindGlobal(R.id.notifBtn, AccessibilityService.GLOBAL_ACTION_NOTIFICATIONS);
        findViewById(R.id.sendTextBtn).setOnClickListener(v -> sendText());
        findViewById(R.id.backspaceBtn).setOnClickListener(v -> hub.send(Proto.BACKSPACE));
        textInput.setOnEditorActionListener((v, actionId, e) -> {
            if (actionId == EditorInfo.IME_ACTION_SEND || actionId == EditorInfo.IME_ACTION_DONE) {
                sendText();
                return true;
            }
            return false;
        });
        for (int i = 0; i < 3; i++) {
            int level = i;
            qualityBtns[i].setOnClickListener(v -> setQuality(level));
        }

        StringBuilder sb = new StringBuilder();
        for (String s : hub.logLines()) sb.append(s).append('\n');
        logText.setText(sb);

        if (missingPermissions().isEmpty()) hub.wantBluetooth();
        else if (!missingPermissions().isEmpty()) requestPermissions(missingPermissions().toArray(new String[0]), REQ_PERMS);
        main.post(pinger);
        refresh();
    }

    @Override
    protected void onResume() {
        super.onResume();
        hub.usb.scan();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        hub.usb.scan();
    }

    @Override
    protected void onDestroy() {
        main.removeCallbacksAndMessages(null);
        hub.removeListener(this);
        decoder.reset();
        if (isFinishing()) hub.stopAll();
        super.onDestroy();
    }

    // ── 블루투스 ──

    private List<String> missingPermissions() {
        List<String> need = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= 31) {
            need.add(Manifest.permission.BLUETOOTH_SCAN);
            need.add(Manifest.permission.BLUETOOTH_CONNECT);
        } else {
            need.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        List<String> missing = new ArrayList<>();
        for (String p : need) if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) missing.add(p);
        return missing;
    }

    private boolean bluetoothOn() {
        BluetoothManager bm = (BluetoothManager) getSystemService(BLUETOOTH_SERVICE);
        return bm != null && bm.getAdapter() != null && bm.getAdapter().isEnabled();
    }

    private void startBluetooth() {
        List<String> missing = missingPermissions();
        if (!missing.isEmpty()) {
            requestPermissions(missing.toArray(new String[0]), REQ_PERMS);
            return;
        }
        if (!bluetoothOn()) {
            hub.wantBluetooth(); // 켜지는 대로 자동 시작
            hub.log("블루투스가 꺼져 있어요. 설정 → 기기 → 블루투스에서 켜 주세요. (USB 케이블만 쓸 거면 필요 없어요)");
            try {
                startActivity(new Intent(Settings.ACTION_BLUETOOTH_SETTINGS));
            } catch (Exception ignored) {
            }
            return;
        }
        hub.wantBluetooth();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode != REQ_PERMS) return;
        if (missingPermissions().isEmpty()) startBluetooth();
        else hub.log("'근처 기기' 권한이 없으면 블루투스로 연결할 수 없어요. (USB 케이블은 사용 가능)");
    }

    // ── 조작 보내기 ──

    private void bindGlobal(int id, int action) {
        findViewById(id).setOnClickListener(v -> hub.send(Proto.GLOBAL, new byte[]{(byte) action}));
    }

    private void sendText() {
        String t = textInput.getText().toString();
        if (t.isEmpty()) return;
        if (hub.send(Proto.TEXT, Proto.utf8(t))) textInput.setText("");
    }

    private void setQuality(int level) {
        quality = level;
        prefs.edit().putInt("quality", level).apply();
        hub.send(Proto.SET_QUALITY, new byte[]{(byte) level});
        refreshQuality();
    }

    @SuppressLint("ClickableViewAccessibility")
    private void setupTouch() {
        surface.setOnTouchListener((v, e) -> {
            float w = v.getWidth(), h = v.getHeight();
            if (w <= 0 || h <= 0) return true;
            float x = e.getX() / w, y = e.getY() / h;
            switch (e.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    downTime = e.getEventTime();
                    downX = e.getX();
                    downY = e.getY();
                    maxMove = 0;
                    nPoints = 0;
                    addPoint(x, y);
                    break;
                case MotionEvent.ACTION_MOVE:
                    maxMove = Math.max(maxMove, (float) Math.hypot(e.getX() - downX, e.getY() - downY));
                    if (nPoints > 0 && Math.hypot((x - xs[nPoints - 1]) * w, (y - ys[nPoints - 1]) * h) > 6) addPoint(x, y);
                    break;
                case MotionEvent.ACTION_UP: {
                    long dur = e.getEventTime() - downTime;
                    if (maxMove < 14) {
                        // 탭 또는 길게 누르기
                        int d = dur < 450 ? 60 : (int) Math.min(dur, 5000);
                        hub.send(Proto.GESTURE, Proto.gesture(d, xs, ys, 1));
                    } else {
                        addPoint(x, y);
                        int d = (int) Math.max(80, Math.min(dur, 5000));
                        hub.send(Proto.GESTURE, Proto.gesture(d, xs, ys, nPoints));
                    }
                    nPoints = 0;
                    break;
                }
                case MotionEvent.ACTION_CANCEL:
                    nPoints = 0;
                    break;
                default:
                    break;
            }
            return true;
        });
        // 컨트롤러 스틱 / 마우스 휠 → 스와이프
        surface.setOnGenericMotionListener((v, e) -> {
            float w = v.getWidth(), h = v.getHeight();
            if (w <= 0 || h <= 0) return false;
            if (e.getActionMasked() == MotionEvent.ACTION_HOVER_MOVE) {
                hoverX = e.getX() / w;
                hoverY = e.getY() / h;
                return true;
            }
            if (e.getActionMasked() == MotionEvent.ACTION_SCROLL) {
                hoverX = e.getX() / w;
                hoverY = e.getY() / h;
                scrollAccY += e.getAxisValue(MotionEvent.AXIS_VSCROLL);
                scrollAccX -= e.getAxisValue(MotionEvent.AXIS_HSCROLL);
                main.removeCallbacks(flushScroll);
                main.postDelayed(flushScroll, 120);
                return true;
            }
            return false;
        });
    }

    private void addPoint(float x, float y) {
        if (nPoints == MAX_POINTS) { // 점이 너무 많으면 하나 걸러 하나씩 줄임
            int k = 0;
            for (int i = 0; i < MAX_POINTS; i += 2) {
                xs[k] = xs[i];
                ys[k] = ys[i];
                k++;
            }
            nPoints = k;
        }
        xs[nPoints] = x;
        ys[nPoints] = y;
        nPoints++;
    }

    private void sendScroll() {
        float dy = Math.max(-0.45f, Math.min(0.45f, scrollAccY * 0.15f));
        float dx = Math.max(-0.45f, Math.min(0.45f, scrollAccX * 0.15f));
        scrollAccX = scrollAccY = 0;
        if (Math.abs(dx) < 0.01f && Math.abs(dy) < 0.01f) return;
        float sx = Math.max(0.05f, Math.min(0.95f, hoverX));
        float sy = Math.max(0.1f, Math.min(0.9f, hoverY));
        float[] px = {sx, sx + dx}, py = {sy, sy + dy};
        hub.send(Proto.GESTURE, Proto.gesture(250, px, py, 2));
    }

    // ── Hub.Listener ──

    @Override
    public void onHubState() {
        boolean ready = hub.isReady();
        if (ready && !wasReady) {
            hub.send(Proto.SET_QUALITY, new byte[]{(byte) quality});
            hub.send(Proto.REQUEST_KEYFRAME);
        }
        if (!ready && wasReady) {
            decoder.reset();
            hasVideo = false;
            phoneStatus.setVisibility(View.GONE);
            latencyText.setText("");
        }
        wasReady = ready;
        refresh();
    }

    @Override
    public void onMessage(byte type, byte[] p) {
        switch (type) {
            case Proto.VIDEO_CONFIG:
                decoder.onConfig(p);
                break;
            case Proto.VIDEO_FRAME:
                decoder.onFrame(p);
                break;
            case Proto.PONG: {
                long rtt = SystemClock.elapsedRealtime() - Proto.readLong(p);
                main.post(() -> latencyText.setText("왕복 지연 " + rtt + " ms"));
                break;
            }
            case Proto.STATUS: {
                String s = Proto.str(p);
                main.post(() -> {
                    phoneStatus.setText(s);
                    phoneStatus.setVisibility(s.isEmpty() ? View.GONE : View.VISIBLE);
                    if (!hasVideo && !s.isEmpty()) overlay.setText(s);
                });
                break;
            }
            default:
                break;
        }
    }

    @Override
    public void onLog(String line) {
        logText.append(line + "\n");
    }

    @Override
    public void onPeers(List<BleCentralLink.Peer> peers) {
        peerList.removeAllViews();
        peers.sort((a, b) -> Integer.compare(b.rssi, a.rssi));
        for (BleCentralLink.Peer p : peers) {
            Button b = new Button(this);
            String signal = p.rssi > -60 ? "강함" : p.rssi > -80 ? "보통" : "약함";
            b.setText("휴대폰 코드 " + (p.code != null ? p.code : "????") + " · 신호 " + signal);
            b.setAllCaps(false);
            b.setOnClickListener(v -> ((BleCentralLink) hub.ble).connect(p));
            peerList.addView(b, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
        }
    }

    // ── VideoDecoder.Callback ──

    @Override
    public void onVideoSize(int w, int h) {
        main.post(() -> videoFrame.setAspect(w / (float) h));
    }

    @Override
    public void onFirstFrame() {
        main.post(() -> {
            hasVideo = true;
            overlay.setVisibility(View.GONE);
        });
    }

    @Override
    public void onError(String message) {
        hub.log(message);
    }

    @Override
    public void requestKeyframe() {
        hub.send(Proto.REQUEST_KEYFRAME);
    }

    // ── 화면 ──

    private void refresh() {
        boolean ready = hub.isReady();
        linkStatus.setText((ready ? "● " : "○ ") + hub.describe());
        linkStatus.setTextColor(getColor(ready ? R.color.ok : R.color.text));
        BleCentralLink ble = (BleCentralLink) hub.ble;
        findBtn.setText(ble.isScanning() ? "찾기 중지" : "블루투스로 휴대폰 찾기");
        findBtn.setVisibility(ready ? View.GONE : View.VISIBLE);
        disconnectBtn.setVisibility(ready || ble.getState() == Link.CONNECTING ? View.VISIBLE : View.GONE);
        if (!hasVideo) {
            overlay.setVisibility(View.VISIBLE);
            if (!ready) overlay.setText("휴대폰과 연결하면 여기에 휴대폰 화면이 나와요.\n\nUSB-C 케이블로 연결하거나, 오른쪽에서 '블루투스로 휴대폰 찾기'를 누르세요.");
            else if (phoneStatus.getVisibility() != View.VISIBLE) overlay.setText("휴대폰 화면을 기다리는 중…");
        }
        refreshQuality();
    }

    private void refreshQuality() {
        for (int i = 0; i < 3; i++) qualityBtns[i].setAlpha(i == quality ? 1f : 0.45f);
    }
}

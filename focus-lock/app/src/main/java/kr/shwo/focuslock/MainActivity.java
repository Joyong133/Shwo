package kr.shwo.focuslock;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.Display;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;

import java.util.List;

/** 설정 · 상태 화면 */
public class MainActivity extends Activity {

    private static final int[] MINUTE_CHOICES = {0, 15, 30, 60, 120};

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable refresher = this::refresh;
    private final Runnable ticker = new Runnable() {
        @Override public void run() {
            refresh();
            handler.postDelayed(this, 1000);
        }
    };

    private TextView statusTitle, statusDetail, displayInfo;
    private LinearLayout statusCard, permCard;
    private Button lockNow, lockLater, unlock, resumeAuto;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTitle(R.string.app_name);

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        int pad = dp(16);
        col.setPadding(pad, pad, pad, pad * 2);

        // ── 권한 안내 ──
        permCard = card(col, 0xFFFFF3E0);
        text(permCard, "① 접근성 권한을 켜 주세요", 17, true);
        text(permCard, "터치를 막으려면 이 앱의 접근성 서비스가 필요합니다. "
                + "설정 → 접근성 → 설치된 앱(또는 다운로드한 앱) → '집중 터치잠금' 을 켜세요.\n\n"
                + "Android 13 이상에서 '제한된 설정' 이라며 회색으로 막혀 있으면: "
                + "아래 '앱 정보 열기' → 오른쪽 위 ⋮ → '제한된 설정 허용' 후 다시 시도하세요.", 14, false);
        LinearLayout permRow = row(permCard);
        button(permRow, "접근성 설정 열기", v ->
                startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)));
        button(permRow, "앱 정보 열기", v ->
                startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                        Uri.parse("package:" + getPackageName()))));

        // ── 현재 상태 ──
        statusCard = card(col, 0xFFE8EAF6);
        statusTitle = text(statusCard, "", 20, true);
        statusDetail = text(statusCard, "", 14, false);
        displayInfo = text(statusCard, "", 13, false);
        displayInfo.setTextColor(0xFF555555);
        LinearLayout ctl1 = row(statusCard);
        lockNow = button(ctl1, "지금 잠금", v -> {
            TouchLockService s = TouchLockService.get();
            if (s != null) s.startManualLock(0);
        });
        lockLater = button(ctl1, "10초 뒤 잠금", v -> {
            TouchLockService s = TouchLockService.get();
            if (s != null) s.startManualLock(10_000);
        });
        LinearLayout ctl2 = row(statusCard);
        unlock = button(ctl2, "잠금 끄기", v -> {
            TouchLockService s = TouchLockService.get();
            if (s != null) s.unlockByUser("앱");
        });
        resumeAuto = button(ctl2, "자동 잠금 다시 켜기", v -> {
            TouchLockService s = TouchLockService.get();
            if (s != null) s.resumeAuto();
        });

        // ── 자동 잠금 ──
        LinearLayout auto = card(col, 0xFFF5F5F5);
        text(auto, "자동 잠금", 17, true);
        toggle(auto, "외부 화면이 연결되면 잠금",
                "USB-C/HDMI 모니터, AR·VR 글래스, 스마트뷰·Miracast 같은 무선 미러링",
                Prefs.AUTO_DISPLAY, Prefs.autoDisplay(this));
        toggle(auto, "화면 공유·녹화 중이면 잠금 (Android 15 이상)",
                "앱으로 휴대폰 화면을 PC·VR 헤드셋에 공유(캐스트)할 때",
                Prefs.AUTO_RECORDING, Prefs.autoRecording(this));

        // ── 원격 입력 ──
        LinearLayout remote = card(col, 0xFFF5F5F5);
        text(remote, "원격 조작도 막기", 17, true);
        toggle(remote, "VR 컨트롤러·손·키보드·게임패드 입력 막기",
                "잠금 중에는 VR 등에서 휴대폰으로 보내는 클릭·핀치·버튼·스틱·키보드 입력도 휴대폰에 전달되지 않습니다. "
                        + "(볼륨·전원 버튼은 그대로 동작. 스틱 차단은 Android 14 이상)",
                Prefs.BLOCK_REMOTE, Prefs.blockRemote(this));

        // ── 수동 잠금 시간 ──
        LinearLayout timeCard = card(col, 0xFFF5F5F5);
        text(timeCard, "직접 잠글 때 유지 시간 (집중 시간)", 17, true);
        RadioGroup rg = new RadioGroup(this);
        rg.setOrientation(RadioGroup.VERTICAL);
        int cur = Prefs.minutes(this);
        for (int m : MINUTE_CHOICES) {
            RadioButton rb = new RadioButton(this);
            rb.setText(m == 0 ? "직접 끌 때까지" : m + "분");
            rb.setId(View.generateViewId());
            rb.setTag(m);
            rg.addView(rb);
            if (m == cur) rb.setChecked(true);
        }
        rg.setOnCheckedChangeListener((g, id) -> {
            RadioButton rb = g.findViewById(id);
            if (rb != null) Prefs.put(this, Prefs.MINUTES, (Integer) rb.getTag());
        });
        timeCard.addView(rg);

        // ── 해제 방법 ──
        LinearLayout opts = card(col, 0xFFF5F5F5);
        text(opts, "잠금 중 표시 · 해제 방법", 17, true);
        toggle(opts, "화면 위쪽에 '🔒 터치 잠금 중' 표시",
                "끄면 미러링 화면에 아무것도 나타나지 않습니다", Prefs.SHOW_BADGE, Prefs.showBadge(this));
        toggle(opts, "두 손가락으로 3초 누르면 해제",
                "VR 고글 안에서 화면이 눌릴 수 있다면 끄세요", Prefs.TWO_FINGER, Prefs.twoFinger(this));
        text(opts, "• 볼륨 아래 버튼을 2초 안에 3번 누르면 언제든 해제됩니다.\n"
                + "• 외부 화면·공유 연결을 끊으면 자동으로 해제됩니다.\n"
                + "• 화면을 끄면(전원 버튼) 잠금화면 PIN 입력은 막지 않고, 잠금화면을 푼 뒤 다시 잠깁니다.\n"
                + "• 빠른 설정(상단 메뉴)에 '터치 잠금' 타일을 추가하면 한 번에 잠글 수 있습니다.\n"
                + "• 제스처 내비게이션의 가장자리 스와이프(홈·뒤로)는 기기에 따라 막히지 않을 수 있습니다. "
                + "완전히 막으려면 3버튼 내비게이션을 쓰세요.", 14, false);

        ScrollView sv = new ScrollView(this);
        sv.addView(col);
        setContentView(sv);
    }

    @Override
    protected void onResume() {
        super.onResume();
        TouchLockService.addListener(refresher);
        handler.post(ticker);
    }

    @Override
    protected void onPause() {
        TouchLockService.removeListener(refresher);
        handler.removeCallbacks(ticker);
        super.onPause();
    }

    private void refresh() {
        TouchLockService s = TouchLockService.get();
        boolean enabled = s != null || isServiceEnabled();
        permCard.setVisibility(enabled ? View.GONE : View.VISIBLE);

        if (s == null) {
            statusTitle.setText(enabled ? "서비스 시작 중…" : "꺼져 있음");
            statusDetail.setText("접근성 권한을 켜면 동작합니다.");
            displayInfo.setText("");
            setButtons(false, false, false, false);
            tint(0xFFEEEEEE);
            return;
        }

        boolean locked = s.isLocked();
        List<Display> ext = s.externalDisplays();
        StringBuilder why = new StringBuilder();
        if (s.isManualLock()) {
            long rem = s.manualRemainingMs();
            why.append(rem > 0 ? "집중 시간 남음: " + fmt(rem) : "직접 잠금 (끌 때까지)");
        } else if (locked) {
            why.append(!ext.isEmpty() ? "외부 화면 연결로 자동 잠금" : "화면 공유 감지로 자동 잠금");
        } else if (s.isAutoSuppressed()) {
            why.append("연결 중이지만 잠금을 풀어 두었습니다");
        } else {
            why.append("외부 화면이 연결되면 자동으로 잠깁니다");
        }
        statusTitle.setText(locked ? "🔒 터치 잠금 중" : "🔓 터치 가능");
        statusDetail.setText(why);

        StringBuilder d = new StringBuilder("감지된 외부 화면: ");
        if (ext.isEmpty()) d.append("없음");
        else {
            for (int i = 0; i < ext.size(); i++) {
                if (i > 0) d.append(", ");
                d.append(ext.get(i).getName());
            }
        }
        d.append("\n화면 공유 감지: ");
        if (!s.recordingDetectionAvailable()) d.append(Build.VERSION.SDK_INT < 35 ? "Android 15 이상 필요" : "사용 불가");
        else d.append(s.isRecording() ? "공유 중" : "없음");
        displayInfo.setText(d);

        setButtons(!locked, !locked, locked, s.isAutoSuppressed());
        tint(locked ? 0xFFFFEBEE : 0xFFE8F5E9);
    }

    private void setButtons(boolean now, boolean later, boolean off, boolean resume) {
        lockNow.setEnabled(now);
        lockLater.setEnabled(later);
        unlock.setEnabled(off);
        resumeAuto.setVisibility(resume ? View.VISIBLE : View.GONE);
    }

    private boolean isServiceEnabled() {
        String list = Settings.Secure.getString(getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (list == null) return false;
        ComponentName me = new ComponentName(this, TouchLockService.class);
        TextUtils.SimpleStringSplitter sp = new TextUtils.SimpleStringSplitter(':');
        sp.setString(list);
        for (String item : sp) {
            ComponentName cn = ComponentName.unflattenFromString(item);
            if (me.equals(cn)) return true;
        }
        return false;
    }

    private static String fmt(long ms) {
        long sec = ms / 1000;
        return String.format("%d:%02d", sec / 60, sec % 60);
    }

    // ───────── 작은 UI 헬퍼 ─────────

    private void tint(int color) {
        ((GradientDrawable) statusCard.getBackground()).setColor(color);
    }

    private LinearLayout card(LinearLayout parent, int color) {
        LinearLayout c = new LinearLayout(this);
        c.setOrientation(LinearLayout.VERTICAL);
        int p = dp(14);
        c.setPadding(p, p, p, p);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(color);
        bg.setCornerRadius(dp(14));
        c.setBackground(bg);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.bottomMargin = dp(12);
        parent.addView(c, lp);
        return c;
    }

    private TextView text(LinearLayout parent, String s, int sp, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(bold ? Color.BLACK : 0xFF333333);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setPadding(0, dp(2), 0, dp(6));
        parent.addView(t);
        return t;
    }

    private LinearLayout row(LinearLayout parent) {
        LinearLayout r = new LinearLayout(this);
        r.setOrientation(LinearLayout.HORIZONTAL);
        parent.addView(r);
        return r;
    }

    private Button button(LinearLayout parent, String label, View.OnClickListener l) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setOnClickListener(l);
        parent.addView(b, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        return b;
    }

    private void toggle(LinearLayout parent, String title, String sub, String key, boolean value) {
        Switch sw = new Switch(this);
        sw.setText(title);
        sw.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        sw.setChecked(value);
        sw.setPadding(0, dp(6), 0, 0);
        sw.setOnCheckedChangeListener((CompoundButton b, boolean checked) -> {
            Prefs.put(this, key, checked);
            TouchLockService s = TouchLockService.get();
            if (s != null) s.update();
        });
        parent.addView(sw);
        TextView t = text(parent, sub, 12, false);
        t.setTextColor(0xFF777777);
    }

    private int dp(int v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }
}

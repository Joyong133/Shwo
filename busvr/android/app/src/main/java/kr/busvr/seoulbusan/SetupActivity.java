package kr.busvr.seoulbusan;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.provider.Settings;
import android.text.InputType;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

/**
 * One-time setup for the seat monitor, done entirely in the headset (no PC):
 * pair the bus app with the headset's own Wireless debugging. Afterwards the bus app starts the monitor helper by itself.
 * Shown as a 2D panel so the Settings panel with the pairing code can stay open beside it.
 */
public class SetupActivity extends Activity {
    private TextView status;
    private Button pairButton, backButton;
    private EditText code, hostPort;
    private volatile boolean busy;

    private TextView text(LinearLayout root, String s, float sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s); t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp); t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setPadding(0, dp(6), 0, dp(6));
        root.addView(t);
        return t;
    }

    private Button button(LinearLayout root, String s, View.OnClickListener l) {
        Button b = new Button(this);
        b.setText(s); b.setAllCaps(false); b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        b.setOnClickListener(l);
        root.addView(b);
        return b;
    }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density + 0.5f); }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        HelperStarter.writeScript(this);
        ScrollView sv = new ScrollView(this);
        sv.setBackgroundColor(Color.rgb(14, 22, 34));
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(28), dp(24), dp(28), dp(24));
        sv.addView(root);
        int fg = Color.WHITE, muted = Color.rgb(170, 186, 210), accent = Color.rgb(242, 184, 75);
        text(root, "좌석 모니터 설정 (처음 한 번만)", 24, fg, true);
        text(root, "헤드셋에 있는 APK를 버스 좌석 모니터에 띄우려면, 이 앱이 헤드셋의 '무선 디버깅'에 한 번 연결 허락을 받아야 합니다. "
                + "한 번 해 두면 다음부터는 버스 앱이 혼자 도우미를 켭니다. PC는 필요 없습니다.", 15, muted, false);
        text(root, HelperStarter.onWifi(this) ? "✓ Wi-Fi 연결됨" : "✗ Wi-Fi에 연결되어 있지 않습니다. 먼저 Wi-Fi를 켜 주세요.", 15,
                HelperStarter.onWifi(this) ? Color.rgb(88, 224, 106) : Color.rgb(255, 120, 90), true);

        text(root, "1. 무선 디버깅 켜기", 19, accent, true);
        text(root, "옆에 '무선 디버깅' 화면이 바로 열립니다. 맨 위 스위치를 켜고(이 네트워크에서 허용), "
                + "'페어링 코드로 기기 페어링'을 누르세요. 6자리 숫자가 나옵니다. 그 창은 닫지 마세요.", 15, fg, false);
        text(root, "무선 디버깅 화면 대신 개발자 옵션이 열리면 목록에서 '무선 디버깅'을 누르세요. "
                + "개발자 옵션도 없으면: 설정 > 휴대전화 정보 > 빌드 번호를 7번 누릅니다.", 13, muted, false);
        button(root, "무선 디버깅 화면 다시 열기", v -> openWirelessDebugging());

        text(root, "2. 6자리 코드 입력", 19, accent, true);
        code = new EditText(this);
        code.setHint("예: 123456");
        code.setInputType(InputType.TYPE_CLASS_NUMBER);
        code.setTextSize(TypedValue.COMPLEX_UNIT_SP, 24);
        code.setTextColor(fg); code.setHintTextColor(muted);
        code.setGravity(Gravity.CENTER);
        root.addView(code);
        text(root, "자동으로 못 찾으면, 페어링 창의 'IP 주소 및 포트'를 그대로 적으세요 (선택):", 13, muted, false);
        hostPort = new EditText(this);
        hostPort.setHint("예: 192.168.0.12:37451");
        hostPort.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        hostPort.setTextColor(fg); hostPort.setHintTextColor(muted);
        root.addView(hostPort);
        pairButton = button(root, "연결하기", v -> pair());

        text(root, "진행 상황", 15, muted, true);
        status = text(root, HelperStarter.isPaired(this) ? "이미 설정되어 있습니다. 다시 하려면 위 과정을 반복하세요." : "아직 설정되지 않았습니다.", 15, fg, false);

        text(root, "3. 버스로 돌아가기", 19, accent, true);
        backButton = button(root, "버스로 돌아가기", v -> backToBus());
        text(root, "무선 디버깅은 설정이 끝나면 꺼도 됩니다. 버스 앱이 도우미를 켤 때만 잠깐 켰다가 다시 끕니다.", 13, muted, false);
        setContentView(sv);
        if (b == null) sv.postDelayed(this::openWirelessDebugging, 600);
    }

    private boolean launch(Intent i) {
        try {
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_LAUNCH_ADJACENT | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
            startActivity(i);
            return true;
        } catch (ActivityNotFoundException | SecurityException e) {
            return false;
        }
    }

    /** Opens Settings > Developer options > Wireless debugging directly (Android 11+), else the closest screen. */
    private void openWirelessDebugging() {
        PackageManager pm = getPackageManager();
        // The Wireless debugging page has its own exported Settings activity (also used by the quick-settings tile).
        Intent direct = new Intent().setClassName("com.android.settings", "com.android.settings.Settings$WirelessDebuggingActivity");
        if (direct.resolveActivityInfo(pm, 0) != null && launch(direct)) return;
        log("무선 디버깅 화면을 바로 열 수 없어 개발자 옵션을 엽니다. 목록에서 '무선 디버깅'을 눌러 주세요.");
        if (launch(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS))) return;
        if (launch(new Intent(Settings.ACTION_DEVICE_INFO_SETTINGS))) { log("개발자 옵션이 꺼져 있습니다. '빌드 번호'를 7번 눌러 켠 뒤, 위 버튼을 다시 누르세요."); return; }
        if (!launch(new Intent(Settings.ACTION_SETTINGS))) log("설정 화면을 열 수 없습니다.");
    }

    private void log(final String s) {
        runOnUiThread(() -> status.setText(s));
    }

    private void pair() {
        if (busy) return;
        final String c = code.getText().toString().trim(), hp = hostPort.getText().toString().trim();
        if (!c.matches("\\d{6}")) { log("6자리 숫자 코드를 입력해 주세요."); return; }
        busy = true;
        pairButton.setEnabled(false);
        new Thread(() -> {
            boolean ok = HelperStarter.pair(this, c, hp.isEmpty() ? null : hp, this::log);
            if (ok) ok = HelperStarter.startHelper(this, this::log);
            final boolean done = ok;
            runOnUiThread(() -> {
                busy = false;
                pairButton.setEnabled(true);
                if (done) {
                    status.setText("완료! 좌석 모니터에서 APK를 쓸 수 있습니다. '버스로 돌아가기'를 누르세요.");
                    backButton.requestFocus();
                }
            });
        }, "seat-setup").start();
    }

    private void backToBus() {
        Intent i = new Intent(this, BusActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        startActivity(i);
        finish();
    }
}

package kr.alertblock;

import android.Manifest;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.List;

import rikka.shizuku.Shizuku;

public class MainActivity extends Activity {
    static final int NOTI_ID = 1;
    private static final String CHANNEL = "test_alert";
    private static final int REQ_SHIZUKU = 7;

    private final Handler ui = new Handler(Looper.getMainLooper());
    private TextView status, log;
    private Button btnPerm;

    private final Shizuku.OnRequestPermissionResultListener permListener = (code, result) -> ui.post(this::refresh);
    private final Shizuku.OnBinderReceivedListener binderListener = () -> ui.post(this::refresh);
    private final Shizuku.OnBinderDeadListener deadListener = () -> ui.post(this::refresh);

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        Shizuku.addRequestPermissionResultListener(permListener);
        Shizuku.addBinderReceivedListenerSticky(binderListener);
        Shizuku.addBinderDeadListener(deadListener);

        NotificationChannel ch = new NotificationChannel(CHANNEL, "테스트 재난 알림", NotificationManager.IMPORTANCE_HIGH);
        ch.setSound(null, null);
        getSystemService(NotificationManager.class).createNotificationChannel(ch);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        int pad = dp(18);
        root.setPadding(pad, dp(28), pad, pad);

        TextView h = new TextView(this);
        h.setText("재난문자 차단");
        h.setTextSize(26);
        h.setTypeface(Typeface.DEFAULT_BOLD);
        h.setTextColor(Color.rgb(20, 20, 20));
        root.addView(h);

        TextView desc = new TextView(this);
        desc.setText("휴대폰의 재난문자 표시 앱을 꺼서 위급·긴급 재난문자가 화면에 뜨지 않게 합니다. "
                + "일반 앱에는 이 권한이 없어서 Shizuku(무료, ADB 권한 대행 앱)가 필요합니다.\n"
                + "⚠ 차단 중에는 실제 지진·공습 등 경보도 받지 못합니다. 필요할 때 '차단 해제'를 누르세요.");
        desc.setTextSize(14);
        desc.setTextColor(Color.rgb(90, 90, 90));
        desc.setPadding(0, dp(6), 0, dp(14));
        root.addView(desc);

        status = new TextView(this);
        status.setTextSize(15);
        status.setTextColor(Color.rgb(30, 30, 30));
        status.setPadding(dp(14), dp(12), dp(14), dp(12));
        GradientDrawable card = new GradientDrawable();
        card.setColor(Color.rgb(242, 244, 247));
        card.setCornerRadius(dp(12));
        status.setBackground(card);
        root.addView(status);

        section(root, "1. 차단 / 해제");
        btnPerm = button(root, "Shizuku 권한 요청", Color.rgb(96, 125, 139), v -> requestShizuku());
        button(root, "재난문자 차단하기", Color.rgb(198, 40, 40), v -> apply(true));
        button(root, "차단 해제 (원래대로)", Color.rgb(46, 125, 50), v -> apply(false));
        button(root, "상태 새로고침", Color.rgb(120, 120, 120), v -> refresh());

        section(root, "2. 테스트 알림");
        button(root, "지금 테스트 알림 띄우기", Color.rgb(239, 108, 0), v -> startActivity(new Intent(this, TestAlertActivity.class)));
        button(root, "10초 후 테스트 (화면 꺼두고 확인)", Color.rgb(239, 108, 0), v -> scheduleTest());

        section(root, "3. Shizuku 없이 (PC + ADB)");
        button(root, "ADB 명령어 복사", Color.rgb(69, 90, 100), v -> copyAdb());
        button(root, "Shizuku 설치 페이지 열기", Color.rgb(69, 90, 100), v -> {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://shizuku.rikka.app/download/"))); }
            catch (Exception e) { toast("브라우저를 열 수 없습니다"); }
        });

        log = new TextView(this);
        log.setTextSize(12);
        log.setTypeface(Typeface.MONOSPACE);
        log.setTextColor(Color.rgb(80, 80, 80));
        log.setPadding(0, dp(14), 0, 0);
        root.addView(log);

        ScrollView sv = new ScrollView(this);
        sv.setBackgroundColor(Color.WHITE);
        sv.setFitsSystemWindows(true);
        sv.addView(root);
        setContentView(sv);
    }

    @Override
    protected void onResume() {
        super.onResume();
        refresh();
    }

    @Override
    protected void onDestroy() {
        Shizuku.removeRequestPermissionResultListener(permListener);
        Shizuku.removeBinderReceivedListener(binderListener);
        Shizuku.removeBinderDeadListener(deadListener);
        super.onDestroy();
    }

    private void refresh() {
        PackageManager pm = getPackageManager();
        List<String> pkgs = CbPackages.find(this);
        boolean running = Shell.shizukuRunning();
        boolean granted = running && Shell.shizukuGranted();
        StringBuilder sb = new StringBuilder();
        sb.append("Shizuku: ").append(!running ? "실행 안 됨 ✗" : granted ? "연결됨 ✓" : "권한 필요").append("\n\n");
        if (pkgs.isEmpty()) {
            sb.append("재난문자 앱을 찾지 못했습니다.");
        } else {
            boolean anyOn = false;
            for (String p : pkgs) {
                boolean on = CbPackages.isEnabled(pm, p);
                anyOn |= on;
                sb.append(on ? "🔔 켜짐   " : "🔕 차단됨 ").append(p).append('\n');
            }
            sb.append('\n').append(anyOn ? "현재 상태: 재난문자 수신됨" : "현재 상태: 재난문자 차단됨");
        }
        status.setText(sb.toString().trim());
        btnPerm.setVisibility(running && !granted ? Button.VISIBLE : Button.GONE);
    }

    private void requestShizuku() {
        if (!Shell.shizukuRunning()) { toast("Shizuku 앱을 먼저 실행(시작)해 주세요"); return; }
        if (Shizuku.isPreV11()) { toast("Shizuku 버전이 너무 낮습니다. 업데이트해 주세요"); return; }
        Shizuku.requestPermission(REQ_SHIZUKU);
    }

    private void apply(boolean block) {
        if (!Shell.shizukuRunning()) {
            toast("Shizuku가 실행 중이 아닙니다. 아래 3번(ADB) 방법을 쓰거나 Shizuku를 켜세요");
            return;
        }
        if (!Shell.shizukuGranted()) { requestShizuku(); return; }
        List<String> pkgs = CbPackages.find(this);
        if (pkgs.isEmpty()) { toast("대상 앱이 없습니다"); return; }
        log.setText("실행 중…");
        new Thread(() -> {
            StringBuilder sb = new StringBuilder();
            for (String p : pkgs) {
                String cmd = block ? "pm disable-user --user 0 " + p : "pm enable --user 0 " + p;
                Object[] r = Shell.run(cmd);
                sb.append("$ ").append(cmd).append('\n').append(r[1]).append("\n\n");
            }
            ui.post(() -> {
                log.setText(sb.toString().trim());
                refresh();
                toast(block ? "차단 완료" : "차단 해제 완료");
            });
        }).start();
    }

    private void scheduleTest() {
        toast("10초 후 테스트 알림이 울립니다");
        ui.postDelayed(() -> {
            Intent i = new Intent(this, TestAlertActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            PendingIntent pi = PendingIntent.getActivity(this, 0, i,
                    PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            Notification n = new Notification.Builder(this, CHANNEL)
                    .setSmallIcon(android.R.drawable.stat_sys_warning)
                    .setContentTitle("위급재난문자 (테스트)")
                    .setContentText("시험용 알림입니다. 실제 재난이 아닙니다.")
                    .setCategory(Notification.CATEGORY_ALARM)
                    .setContentIntent(pi)
                    .setFullScreenIntent(pi, true)
                    .setAutoCancel(true)
                    .build();
            getSystemService(NotificationManager.class).notify(NOTI_ID, n);
            // 화면이 켜져 있고 앱이 앞에 있으면 바로 띄움
            if (hasWindowFocus()) startActivity(i);
        }, 10_000);
    }

    private void copyAdb() {
        List<String> pkgs = CbPackages.find(this);
        StringBuilder sb = new StringBuilder("# 차단\n");
        for (String p : pkgs) sb.append("adb shell pm disable-user --user 0 ").append(p).append('\n');
        sb.append("\n# 차단 해제\n");
        for (String p : pkgs) sb.append("adb shell pm enable --user 0 ").append(p).append('\n');
        getSystemService(ClipboardManager.class).setPrimaryClip(ClipData.newPlainText("adb", sb));
        log.setText(sb.toString().trim());
        toast("복사됨");
    }

    private void section(LinearLayout root, String text) {
        TextView t = new TextView(this);
        t.setText(text);
        t.setTextSize(16);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setTextColor(Color.rgb(40, 40, 40));
        t.setPadding(0, dp(20), 0, dp(4));
        root.addView(t);
    }

    private Button button(LinearLayout root, String text, int color, android.view.View.OnClickListener l) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(Color.WHITE);
        btn.setAllCaps(false);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(color);
        bg.setCornerRadius(dp(10));
        btn.setBackground(bg);
        btn.setOnClickListener(l);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(50));
        lp.topMargin = dp(8);
        root.addView(btn, lp);
        return btn;
    }

    private void toast(String s) { Toast.makeText(this, s, Toast.LENGTH_SHORT).show(); }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density); }
}

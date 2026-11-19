package kr.alertblock;

import android.app.Activity;
import android.app.NotificationManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** 실제 재난문자와 비슷한 화면·경보음·진동을 앱 안에서만 흉내 내는 테스트 화면. */
public class TestAlertActivity extends Activity {
    private AudioTrack track;
    private Vibrator vibrator;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        setFinishOnTouchOutside(false);
        getSystemService(NotificationManager.class).cancel(MainActivity.NOTI_ID);

        int pad = dp(20);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(pad, pad, pad, pad);
        root.setBackgroundColor(Color.WHITE);

        TextView title = new TextView(this);
        title.setText("⚠ 위급재난문자 (테스트)");
        title.setTextColor(Color.rgb(198, 40, 40));
        title.setTextSize(22);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        root.addView(title);

        TextView body = new TextView(this);
        body.setText("[테스트] 이 메시지는 '재난문자 차단' 앱이 만든 시험용 알림입니다. "
                + "실제 재난 상황이 아니며 통신사·정부에서 보낸 문자가 아닙니다.\n\n"
                + "경보음과 진동이 울리는지 확인한 뒤 아래 확인 버튼을 누르세요.");
        body.setTextColor(Color.rgb(33, 33, 33));
        body.setTextSize(16);
        body.setPadding(0, dp(14), 0, dp(18));
        root.addView(body);

        Button ok = new Button(this);
        ok.setText("확인");
        ok.setOnClickListener(v -> finish());
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.gravity = Gravity.END;
        root.addView(ok, lp);
        setContentView(root);
        getWindow().setLayout((int) (getResources().getDisplayMetrics().widthPixels * 0.9),
                WindowManager.LayoutParams.WRAP_CONTENT);

        startSound();
        startVibration();
    }

    private void startSound() {
        // 재난경보 '주의 신호'와 같은 853Hz + 960Hz 복합음, 2초 울림 / 0.5초 쉼 반복
        int rate = 44100;
        int on = rate * 2, off = rate / 2, n = on + off;
        short[] buf = new short[n];
        for (int i = 0; i < on; i++) {
            double t = (double) i / rate;
            double env = Math.min(1.0, Math.min(i, on - i) / (rate * 0.01));
            double s = (Math.sin(2 * Math.PI * 853 * t) + Math.sin(2 * Math.PI * 960 * t)) * 0.5;
            buf[i] = (short) (s * env * 30000);
        }
        track = new AudioTrack.Builder()
                .setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
                .setAudioFormat(new AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(rate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                .setTransferMode(AudioTrack.MODE_STATIC)
                .setBufferSizeInBytes(n * 2)
                .build();
        track.write(buf, 0, n);
        track.setLoopPoints(0, n, -1);
        track.play();
    }

    private void startVibration() {
        vibrator = getSystemService(Vibrator.class);
        if (vibrator == null || !vibrator.hasVibrator()) return;
        long[] pattern = {0, 2000, 500};
        if (Build.VERSION.SDK_INT >= 26) vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
    }

    @Override
    protected void onDestroy() {
        if (track != null) { try { track.stop(); } catch (Exception ignored) {} track.release(); }
        if (vibrator != null) vibrator.cancel();
        super.onDestroy();
    }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density); }
}

package kr.shwo.focuslock;

import android.content.Context;
import android.content.SharedPreferences;

/** 앱 설정 (SharedPreferences) */
final class Prefs {
    static final String AUTO_DISPLAY = "auto_display";     // 외부 화면/무선 미러링 연결 시 자동 잠금
    static final String AUTO_RECORDING = "auto_recording"; // (Android 15+) 화면 공유·녹화 감지 시 자동 잠금
    static final String SHOW_BADGE = "show_badge";         // 잠금 중 화면 위쪽에 작은 자물쇠 표시
    static final String TWO_FINGER = "two_finger";         // 두 손가락 3초 누르기로 해제 허용
    static final String MINUTES = "minutes";               // 수동 잠금 유지 시간 (0 = 직접 끌 때까지)

    private Prefs() {}

    static SharedPreferences get(Context c) {
        return c.getSharedPreferences("focus_lock", Context.MODE_PRIVATE);
    }

    static boolean autoDisplay(Context c) { return get(c).getBoolean(AUTO_DISPLAY, true); }
    static boolean autoRecording(Context c) { return get(c).getBoolean(AUTO_RECORDING, true); }
    static boolean showBadge(Context c) { return get(c).getBoolean(SHOW_BADGE, true); }
    static boolean twoFinger(Context c) { return get(c).getBoolean(TWO_FINGER, true); }
    static int minutes(Context c) { return get(c).getInt(MINUTES, 0); }

    static void put(Context c, String key, boolean v) { get(c).edit().putBoolean(key, v).apply(); }
    static void put(Context c, String key, int v) { get(c).edit().putInt(key, v).apply(); }
}

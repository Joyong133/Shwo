package com.shwo.jpspeak;

import android.content.Context;
import android.content.SharedPreferences;

import java.time.LocalDate;

/** 문장별 최고 점수·통과 여부, 오늘 통과 수, 연속 학습일, 설정값을 저장한다. */
public final class Progress {
    private final SharedPreferences p;

    public Progress(Context ctx) {
        p = ctx.getSharedPreferences("progress", Context.MODE_PRIVATE);
    }

    public int best(String id) { return p.getInt("b_" + id, -1); }
    public int attempts(String id) { return p.getInt("a_" + id, 0); }
    public boolean passed(String id) { return p.getBoolean("p_" + id, false); }

    /** 한 번 말한 결과를 기록한다. 처음 통과한 문장이면 true. */
    public boolean record(String id, int percent, boolean pass) {
        boolean firstPass = pass && !passed(id);
        SharedPreferences.Editor e = p.edit();
        e.putInt("a_" + id, attempts(id) + 1);
        e.putInt("b_" + id, Math.max(best(id), percent));
        if (pass) {
            e.putBoolean("p_" + id, true);
            String today = LocalDate.now().toString();
            String last = p.getString("lastDay", "");
            if (!today.equals(last)) {
                String yesterday = LocalDate.now().minusDays(1).toString();
                e.putInt("streak", yesterday.equals(last) ? p.getInt("streak", 0) + 1 : 1);
                e.putString("lastDay", today);
                e.putInt("todayCount", 0);
            }
            int todayCount = today.equals(last) ? p.getInt("todayCount", 0) : 0;
            e.putInt("todayCount", todayCount + 1);
        }
        e.apply();
        return firstPass;
    }

    public int todayCount() {
        return LocalDate.now().toString().equals(p.getString("lastDay", "")) ? p.getInt("todayCount", 0) : 0;
    }

    /** 오늘이나 어제 공부했으면 연속일 수, 아니면 0. */
    public int streak() {
        String last = p.getString("lastDay", "");
        LocalDate now = LocalDate.now();
        if (last.equals(now.toString()) || last.equals(now.minusDays(1).toString())) return p.getInt("streak", 0);
        return 0;
    }

    public void resetAll() {
        int threshold = threshold();
        boolean auto = autoPlay(), furi = furigana(), meaning = meaning(), popup = usePopup();
        p.edit().clear().apply();
        setThreshold(threshold); setAutoPlay(auto); setFurigana(furi); setMeaning(meaning); setUsePopup(popup);
    }

    // ---- 설정 ----
    public int threshold() { return p.getInt("threshold", 80); }
    public void setThreshold(int v) { p.edit().putInt("threshold", v).apply(); }
    public boolean autoPlay() { return p.getBoolean("autoPlay", true); }
    public void setAutoPlay(boolean v) { p.edit().putBoolean("autoPlay", v).apply(); }
    public boolean furigana() { return p.getBoolean("furigana", true); }
    public void setFurigana(boolean v) { p.edit().putBoolean("furigana", v).apply(); }
    public boolean meaning() { return p.getBoolean("meaning", true); }
    public void setMeaning(boolean v) { p.edit().putBoolean("meaning", v).apply(); }
    public boolean usePopup() { return p.getBoolean("usePopup", false); }
    public void setUsePopup(boolean v) { p.edit().putBoolean("usePopup", v).apply(); }
}

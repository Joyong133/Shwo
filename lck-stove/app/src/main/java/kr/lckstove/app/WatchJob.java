package kr.lckstove.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/** 15분마다 Leaguepedia 로스터 변동을 확인하고 새 소식이 있으면 알림 */
public class WatchJob extends JobService {
    private static final int JOB_ID = 1001;
    private static final String CHANNEL = "moves";
    static final Pattern ACADEMY = Pattern.compile("(?i)academy|challengers|youth|rookies|trainee");
    static final String[] LCK = {"t1", "gen.g", "hanwha", "dplus", "kt rolster", "fearx", "nongshim",
            "freecs", "soopers", "brion", "drx"};

    static boolean isLck(String team) {
        if (team == null) return false;
        String t = team.toLowerCase();
        if (ACADEMY.matcher(t).find()) return false;
        if (t.equals("t1")) return true;
        for (String k : LCK) if (!k.equals("t1") && t.contains(k)) return true;
        return false;
    }

    static void schedule(Context c) {
        if (!MainActivity.prefs(c).getBoolean("notify", true)) return;
        JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js == null || js.getPendingJob(JOB_ID) != null) return;
        JobInfo info = new JobInfo.Builder(JOB_ID, new ComponentName(c, WatchJob.class))
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setPeriodic(15 * 60 * 1000L)
                .setPersisted(true)
                .build();
        js.schedule(info);
    }

    static void cancel(Context c) {
        JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js != null) js.cancel(JOB_ID);
    }

    @Override
    public boolean onStartJob(final JobParameters params) {
        new Thread(() -> {
            try { check(); } catch (Exception ignored) {}
            jobFinished(params, false);
        }).start();
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) { return true; }

    private void check() throws Exception {
        SharedPreferences p = MainActivity.prefs(this);
        String url = p.getString("watchUrl", null);
        if (url == null || !p.getBoolean("notify", true)) return;
        boolean lckOnly = p.getBoolean("lckOnly", true);
        JSONObject j = new JSONObject(Http.get(url));
        JSONArray rows = j.optJSONArray("cargoquery");
        if (rows == null) return;

        Set<String> seen = new HashSet<>(p.getStringSet("seen", new HashSet<>()));
        boolean firstRun = seen.isEmpty();
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < rows.length(); i++) {
            JSONObject r = rows.getJSONObject(i).optJSONObject("title");
            if (r == null) continue;
            String dt = r.optString("Dt", "");
            if (dt.length() > 10) dt = dt.substring(0, 10);
            String player = r.optString("Player", "");
            String dir = r.optString("Dir", "");
            String team = r.optString("Team", "");
            String key = player + "|" + dt + "|" + dir + "|" + team;
            if (seen.contains(key)) continue;
            seen.add(key);
            if (lckOnly && !isLck(team)) continue;
            String name = player.replaceAll("\\s*\\(.*\\)$", "");
            boolean join = dir.toLowerCase().contains("join");
            lines.add(name + " · " + team + (join ? " 합류" : " 이탈"));
        }
        p.edit().putStringSet("seen", seen).apply();
        if (firstRun || lines.isEmpty()) return;
        notifyMoves(lines);
    }

    private void notifyMoves(List<String> lines) {
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm == null) return;
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel(CHANNEL, "로스터 변동", NotificationManager.IMPORTANCE_DEFAULT));
            b = new Notification.Builder(this, CHANNEL);
        } else {
            b = new Notification.Builder(this);
        }
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.InboxStyle style = new Notification.InboxStyle();
        for (int i = 0; i < Math.min(6, lines.size()); i++) style.addLine(lines.get(i));
        if (lines.size() > 6) style.setSummaryText("외 " + (lines.size() - 6) + "건");
        String title = "LCK 스토브리그 새 소식 " + lines.size() + "건";
        b.setSmallIcon(R.drawable.ic_notify)
                .setContentTitle(title)
                .setContentText(lines.get(0))
                .setStyle(style)
                .setAutoCancel(true)
                .setContentIntent(pi);
        nm.notify((int) (System.currentTimeMillis() % 100000), b.build());
    }
}

package kr.busvr.seoulbusan;

import android.content.ContentResolver;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.InetAddress;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import io.github.muntashirakon.adb.AdbStream;
import io.github.muntashirakon.adb.android.AdbMdns;

/**
 * Starts the seat-monitor helper from inside the headset, without a PC:
 * the bus app connects to the headset's own adbd over Android's Wireless debugging (paired once),
 * runs start.sh as the shell user, and switches Wireless debugging off again afterwards.
 */
final class HelperStarter {
    static final String TAG = "BusVR";
    static final String PREFS = "seat_monitor";
    static final String KEY_PAIRED = "paired";
    static final String ADB_WIFI = "adb_wifi_enabled";

    interface Out { void line(String s); }

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }
    static boolean isPaired(Context c) { return prefs(c).getBoolean(KEY_PAIRED, false); }

    static boolean helperAlive() {
        IBinder b = SeatLink.helper;
        return b != null && b.isBinderAlive() && b.pingBinder();
    }

    static boolean onWifi(Context c) {
        try {
            ConnectivityManager cm = (ConnectivityManager) c.getSystemService(Context.CONNECTIVITY_SERVICE);
            for (Network n : cm.getAllNetworks()) {
                NetworkCapabilities nc = cm.getNetworkCapabilities(n);
                if (nc != null && nc.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) return true;
            }
        } catch (Exception ignored) { }
        return false;
    }

    static boolean canToggleWirelessDebugging(Context c) {
        return c.checkSelfPermission("android.permission.WRITE_SECURE_SETTINGS") == PackageManager.PERMISSION_GRANTED;
    }

    static void setWirelessDebugging(Context c, boolean on) {
        try {
            Settings.Global.putInt(c.getContentResolver(), ADB_WIFI, on ? 1 : 0);
        } catch (Exception e) {
            Log.w(TAG, "toggle wireless debugging", e);
        }
    }

    static boolean wirelessDebuggingOn(Context c) {
        try { return Settings.Global.getInt(c.getContentResolver(), ADB_WIFI, 0) == 1; } catch (Exception e) { return false; }
    }

    /** start.sh in the app's shared folder: the shell user can read it there. */
    static String writeScript(Context c) {
        try {
            File dir = c.getExternalFilesDir(null);
            if (dir == null) return null;
            String apk = c.getApplicationInfo().sourceDir;
            String sh = "#!/system/bin/sh\n"
                    + "# Seoul-Busan bus VR: seat-monitor helper (started by the app itself, or from a PC with:\n"
                    + "#   adb shell sh /sdcard/Android/data/" + c.getPackageName() + "/files/start.sh)\n"
                    + "APK=\"" + apk + "\"\n"
                    + "pkill -f busvr_seat_helper >/dev/null 2>&1\n"
                    + "if command -v setsid >/dev/null 2>&1; then RUN=setsid; else RUN=; fi\n"
                    + "CLASSPATH=\"$APK\" $RUN nohup app_process /system/bin --nice-name=busvr_seat_helper kr.busvr.seoulbusan.SeatHelper >/dev/null 2>&1 &\n"
                    + "sleep 2\n"
                    + "if pgrep -f busvr_seat_helper >/dev/null 2>&1; then echo 'OK: seat monitor helper is running'; else echo 'FAILED: helper did not start'; fi\n";
            File f = new File(dir, "start.sh");
            try (FileOutputStream out = new FileOutputStream(f)) { out.write(sh.getBytes("UTF-8")); }
            return "/sdcard/Android/data/" + c.getPackageName() + "/files/start.sh";
        } catch (Exception e) {
            Log.w(TAG, "start.sh", e);
            return null;
        }
    }

    static String shell(BusAdb adb, String cmd) throws Exception {
        AdbStream st = adb.openStream("shell:" + cmd);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (InputStream in = st.openInputStream()) {
            byte[] b = new byte[1024]; int n;
            while ((n = in.read(b)) > 0) out.write(b, 0, n);
        } catch (Exception ignored) {
            // the stream ends when the command finishes
        } finally {
            try { st.close(); } catch (Exception ignored) { }
        }
        return out.toString("UTF-8").trim();
    }

    /** Finds an adb service of the given type (adb-tls-pairing / adb-tls-connect) on this headset via mDNS. */
    static int[] discover(Context c, String type, long timeoutMs, AtomicReference<String> hostOut) throws InterruptedException {
        AtomicInteger port = new AtomicInteger(-1);
        CountDownLatch done = new CountDownLatch(1);
        AdbMdns m = new AdbMdns(c, type, (InetAddress host, int p) -> {
            if (host != null && p > 0) { hostOut.set(host.getHostAddress()); port.set(p); }
            done.countDown();
        });
        m.start();
        try { done.await(timeoutMs, TimeUnit.MILLISECONDS); } finally { m.stop(); }
        return new int[]{port.get()};
    }

    /** One-time pairing with the code shown in Settings > Wireless debugging > Pair device with pairing code. */
    static boolean pair(Context c, String code, String hostPort, Out out) {
        try {
            if (!onWifi(c)) { out.line("Wi-Fi에 연결되어 있지 않습니다. Wi-Fi를 먼저 켜 주세요."); return false; }
            String host = "127.0.0.1"; int port = -1;
            if (hostPort != null && hostPort.contains(":")) {
                String[] hp = hostPort.trim().split(":");
                host = hp[0].trim(); port = Integer.parseInt(hp[1].trim());
            } else if (hostPort != null && hostPort.trim().matches("\\d+")) {
                port = Integer.parseInt(hostPort.trim());
            }
            if (port <= 0) {
                out.line("페어링 창을 찾는 중…");
                AtomicReference<String> h = new AtomicReference<>(null);
                port = discover(c, AdbMdns.SERVICE_TYPE_TLS_PAIRING, 15000, h)[0];
                if (port <= 0) { out.line("페어링 창을 찾지 못했습니다. 설정에서 '페어링 코드로 기기 페어링' 창을 열어 둔 채로 다시 눌러 주세요. 창에 나온 IP 주소와 포트를 아래에 직접 적어도 됩니다."); return false; }
                if (h.get() != null) host = h.get();
            }
            out.line("페어링 중… (" + host + ":" + port + ")");
            boolean ok = BusAdb.get(c).pair(host, port, code.trim());
            if (!ok) { out.line("페어링에 실패했습니다. 코드를 다시 확인해 주세요."); return false; }
            prefs(c).edit().putBoolean(KEY_PAIRED, true).apply();
            out.line("페어링 완료.");
            return true;
        } catch (Exception e) {
            Log.w(TAG, "pair", e);
            out.line("페어링 오류: " + e.getMessage());
            return false;
        }
    }

    /** Connects to this headset's adbd and starts the helper. Turns Wireless debugging on just for this, when allowed to. */
    static synchronized boolean startHelper(Context c, Out out) {
        if (helperAlive()) { out.line("모니터 도우미가 이미 켜져 있습니다."); return true; }
        if (!isPaired(c)) { out.line("처음 한 번 설정이 필요합니다."); return false; }
        if (!onWifi(c)) { out.line("Wi-Fi에 연결되어 있지 않아 도우미를 켤 수 없습니다."); return false; }
        boolean toggle = canToggleWirelessDebugging(c), turnedOn = false;
        BusAdb adb = null;
        try {
            if (!wirelessDebuggingOn(c)) {
                if (!toggle) { out.line("설정에서 '무선 디버깅'을 켜 주세요. (자동으로 켜는 권한이 아직 없습니다)"); return false; }
                setWirelessDebugging(c, true); turnedOn = true;
                out.line("무선 디버깅을 잠시 켜는 중…");
                Thread.sleep(1500);
            }
            adb = BusAdb.get(c);
            out.line("헤드셋에 연결하는 중…");
            boolean connected = adb.isConnected();
            for (int attempt = 0; attempt < 3 && !connected; attempt++) {
                try { connected = adb.connectTls(c, 8000); } catch (Exception e) { Log.w(TAG, "connectTls", e); Thread.sleep(1500); }
            }
            if (!connected) { out.line("헤드셋의 무선 디버깅에 연결하지 못했습니다. 처음 설정을 다시 해 주세요."); return false; }
            if (!toggle) {
                String g = shell(adb, "pm grant " + c.getPackageName() + " android.permission.WRITE_SECURE_SETTINGS");
                Log.i(TAG, "grant WRITE_SECURE_SETTINGS: " + g);
            }
            String script = writeScript(c);
            if (script == null) { out.line("시작 스크립트를 만들지 못했습니다."); return false; }
            out.line("모니터 도우미를 켜는 중…");
            String r = shell(adb, "sh " + script);
            Log.i(TAG, "start.sh: " + r);
            for (int k = 0; k < 40 && !helperAlive(); k++) Thread.sleep(250);
            if (!helperAlive()) { out.line("도우미가 켜지지 않았습니다: " + r); return false; }
            out.line("모니터 도우미가 켜졌습니다.");
            return true;
        } catch (Exception e) {
            Log.w(TAG, "startHelper", e);
            out.line("도우미를 켜지 못했습니다: " + e.getMessage());
            return false;
        } finally {
            if (adb != null) { try { adb.disconnect(); } catch (Exception ignored) { } }
            if (turnedOn) {
                // Leave Wireless debugging off again, unless switching it off would take the helper with it.
                try {
                    setWirelessDebugging(c, false);
                    Thread.sleep(2500);
                    if (!helperAlive()) {
                        Log.w(TAG, "helper ended with Wireless debugging; keeping it on");
                        setWirelessDebugging(c, true);
                    }
                } catch (Exception ignored) { }
            }
        }
    }
}

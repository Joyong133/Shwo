package kr.alertblock;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.reflect.Method;

import rikka.shizuku.Shizuku;

/** Shizuku(ADB 권한)로 셸 명령 실행. */
final class Shell {
    private Shell() {}

    static boolean shizukuRunning() {
        try { return Shizuku.pingBinder(); } catch (Throwable t) { return false; }
    }

    static boolean shizukuGranted() {
        try {
            return !Shizuku.isPreV11() && Shizuku.checkSelfPermission() == android.content.pm.PackageManager.PERMISSION_GRANTED;
        } catch (Throwable t) { return false; }
    }

    /** @return [exitCode, output] */
    static Object[] run(String cmd) {
        try {
            Method m = Shizuku.class.getDeclaredMethod("newProcess", String[].class, String[].class, String.class);
            m.setAccessible(true);
            Process p = (Process) m.invoke(null, new String[]{"sh", "-c", cmd + " 2>&1"}, null, null);
            StringBuilder sb = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                String line;
                while ((line = r.readLine()) != null) sb.append(line).append('\n');
            }
            int code = p.waitFor();
            return new Object[]{code, sb.toString().trim()};
        } catch (Throwable t) {
            Throwable c = t.getCause() != null ? t.getCause() : t;
            return new Object[]{-1, c.toString()};
        }
    }
}

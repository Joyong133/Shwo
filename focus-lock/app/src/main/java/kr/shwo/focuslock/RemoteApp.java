package kr.shwo.focuslock;

import android.Manifest;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.accessibility.AccessibilityManager;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * 휴대폰을 VR 에서 원격 조작하는 앱 (기본: Meta Quest 용 "Spatial Phone" 의 휴대폰 동반 앱).
 *
 * Spatial Phone 은 휴대폰에서
 *  - 화면 캡처(MediaProjection, 상시 알림이 뜸)로 화면을 헤드셋에 보내고
 *  - 자기 접근성 서비스로 VR 컨트롤러·손 입력을 휴대폰 터치/뒤로/홈 동작으로 바꿔 넣는다.
 * 그래서
 *  - 연결 감지 = 그 앱의 상시 알림이 떠 있는지 (NotifWatcher)
 *  - 터치로 들어오는 조작 = 우리 오버레이가 막음
 *  - 뒤로·홈·글자 입력처럼 터치가 아닌 조작 = 잠금 중 그 앱의 접근성 서비스를 잠시 꺼서 막음 (고급, WRITE_SECURE_SETTINGS 필요)
 */
final class RemoteApp {
    private RemoteApp() {}

    static final class Candidate {
        final String pkg;
        final String label;
        Candidate(String pkg, String label) { this.pkg = pkg; this.label = label; }
    }

    /** 설치된 다른 앱의 접근성 서비스 목록 (원격 조작 앱 후보) */
    static List<Candidate> candidates(Context c) {
        List<Candidate> out = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        AccessibilityManager am = c.getSystemService(AccessibilityManager.class);
        if (am == null) return out;
        PackageManager pm = c.getPackageManager();
        for (AccessibilityServiceInfo info : am.getInstalledAccessibilityServiceList()) {
            ServiceInfo si = info.getResolveInfo().serviceInfo;
            if (si == null || si.packageName.equals(c.getPackageName()) || !seen.add(si.packageName)) continue;
            CharSequence label;
            try { label = pm.getApplicationLabel(pm.getApplicationInfo(si.packageName, 0)); }
            catch (Exception e) { label = si.packageName; }
            out.add(new Candidate(si.packageName, label.toString()));
        }
        return out;
    }

    /** 대상 앱 패키지: 사용자가 고른 앱, 없으면 이름에 "spatial" 이 들어간 앱 자동 선택 */
    static String targetPackage(Context c) {
        String chosen = Prefs.targetPkg(c);
        if (!TextUtils.isEmpty(chosen)) return chosen;
        for (Candidate cand : candidates(c)) {
            String s = (cand.pkg + " " + cand.label).toLowerCase(Locale.ROOT);
            if (s.contains("spatial")) return cand.pkg;
        }
        return null;
    }

    static String targetLabel(Context c) {
        String pkg = targetPackage(c);
        if (pkg == null) return null;
        PackageManager pm = c.getPackageManager();
        try { return pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString(); }
        catch (Exception e) { return pkg; }
    }

    // ───────── 조작 기능 잠시 끄기 (고급) ─────────

    static boolean canCutControl(Context c) {
        return c.checkSelfPermission(Manifest.permission.WRITE_SECURE_SETTINGS) == PackageManager.PERMISSION_GRANTED;
    }

    static String adbCommand(Context c) {
        return "adb shell pm grant " + c.getPackageName() + " android.permission.WRITE_SECURE_SETTINGS";
    }

    /**
     * cut=true: 대상 앱의 접근성 서비스를 목록에서 빼고 기억해 둔다.
     * cut=false: 기억해 둔 서비스를 다시 켠다.
     */
    static void setControlCut(Context c, boolean cut) {
        if (!canCutControl(c)) return;
        String saved = Prefs.savedServices(c);
        try {
            if (cut) {
                if (!TextUtils.isEmpty(saved)) return;      // 이미 끔
                String pkg = targetPackage(c);
                if (pkg == null) return;
                List<String> keep = new ArrayList<>(), removed = new ArrayList<>();
                for (String item : split(readEnabled(c))) {
                    ComponentName cn = ComponentName.unflattenFromString(item);
                    if (cn != null && cn.getPackageName().equals(pkg)) removed.add(item); else keep.add(item);
                }
                if (removed.isEmpty()) return;
                Prefs.putString(c, Prefs.SAVED_SERVICES, TextUtils.join(":", removed)); // 먼저 저장 (중간에 죽어도 복구 가능)
                writeEnabled(c, TextUtils.join(":", keep));
            } else {
                if (TextUtils.isEmpty(saved)) return;
                Set<String> all = new LinkedHashSet<>(split(readEnabled(c)));
                all.addAll(split(saved));
                writeEnabled(c, TextUtils.join(":", all));
                Prefs.putString(c, Prefs.SAVED_SERVICES, "");
            }
        } catch (Exception ignored) {}
    }

    static boolean isControlCut(Context c) { return !TextUtils.isEmpty(Prefs.savedServices(c)); }

    private static String readEnabled(Context c) {
        String s = Settings.Secure.getString(c.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        return s == null ? "" : s;
    }

    private static void writeEnabled(Context c, String value) {
        Settings.Secure.putString(c.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES, value);
        if (!value.isEmpty()) Settings.Secure.putString(c.getContentResolver(), Settings.Secure.ACCESSIBILITY_ENABLED, "1");
    }

    private static List<String> split(String s) {
        List<String> out = new ArrayList<>();
        for (String p : s.split(":")) if (!p.trim().isEmpty()) out.add(p.trim());
        return out;
    }
}

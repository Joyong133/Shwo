package kr.alertblock;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** 기기에 설치된 재난문자(Cell Broadcast) 표시 앱을 찾는다. */
final class CbPackages {
    private CbPackages() {}

    private static final String[] KNOWN = {
            "com.android.cellbroadcastreceiver",
            "com.android.cellbroadcastreceiver.module",
            "com.google.android.cellbroadcastreceiver",
            "com.samsung.android.cellbroadcastreceiver",
            "com.sec.android.app.cmas",
            "com.lge.cmas",
    };

    private static final String[] CB_ACTIONS = {
            "android.provider.action.SMS_EMERGENCY_CB_RECEIVED",
            "android.provider.Telephony.SMS_CB_RECEIVED",
            "android.provider.Telephony.SMS_EMERGENCY_CB_RECEIVED",
    };

    static List<String> find(Context ctx) {
        PackageManager pm = ctx.getPackageManager();
        Set<String> out = new LinkedHashSet<>();
        for (String p : KNOWN) if (installed(pm, p)) out.add(p);
        for (String action : CB_ACTIONS) {
            List<ResolveInfo> list = pm.queryBroadcastReceivers(new Intent(action),
                    PackageManager.MATCH_DISABLED_COMPONENTS | PackageManager.MATCH_DISABLED_UNTIL_USED_COMPONENTS);
            for (ResolveInfo ri : list) {
                String p = ri.activityInfo.packageName;
                // 서비스(모뎀→앱 전달) 모듈은 건드리지 않고 '표시하는 앱'만 대상
                if (!p.contains("cellbroadcastservice")) out.add(p);
            }
        }
        for (ApplicationInfo ai : pm.getInstalledApplications(PackageManager.MATCH_DISABLED_COMPONENTS)) {
            String p = ai.packageName;
            if ((p.contains("cellbroadcastreceiver") || p.endsWith(".cmas")) && !p.contains("overlay")) out.add(p);
        }
        out.remove(ctx.getPackageName());
        return new ArrayList<>(out);
    }

    static boolean installed(PackageManager pm, String p) {
        try {
            pm.getApplicationInfo(p, PackageManager.MATCH_DISABLED_COMPONENTS);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    static boolean isEnabled(PackageManager pm, String p) {
        try {
            int s = pm.getApplicationEnabledSetting(p);
            if (s == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT) {
                return pm.getApplicationInfo(p, PackageManager.MATCH_DISABLED_COMPONENTS).enabled;
            }
            return s == PackageManager.COMPONENT_ENABLED_STATE_ENABLED;
        } catch (Exception e) {
            return false;
        }
    }
}

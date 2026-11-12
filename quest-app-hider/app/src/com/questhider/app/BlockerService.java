package com.questhider.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.os.SystemClock;
import android.view.accessibility.AccessibilityEvent;

/**
 * No-ADB mode. When a blocked app's window comes to the front, close it
 * (Back + Home) and show the "blocked" screen instead.
 * The user turns this on once in the headset's accessibility settings.
 */
public class BlockerService extends AccessibilityService {

    private String lastPkg;
    private long lastTime;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return;
        CharSequence p = event.getPackageName();
        if (p == null) return;
        String pkg = p.toString();
        if (pkg.equals(getPackageName())) return;
        if (!Prefs.isBlocked(this, pkg)) return;

        long now = SystemClock.elapsedRealtime();
        if (pkg.equals(lastPkg) && now - lastTime < 800) return;
        lastPkg = pkg;
        lastTime = now;

        performGlobalAction(GLOBAL_ACTION_BACK);
        performGlobalAction(GLOBAL_ACTION_HOME);

        Intent i = new Intent(this, BlockedActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        i.putExtra(BlockedActivity.EXTRA_PKG, pkg);
        try {
            startActivity(i);
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onInterrupt() {
    }
}

package com.questhider.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.accessibility.AccessibilityEvent;

/**
 * No-ADB mode. When a blocked app (e.g. the Quest Browser) comes to the
 * front, close it and show the "blocked" screen.
 *
 * On Quest, 2D apps float as separate panels, so a single Back/Home does not
 * remove the panel. We instead:
 *   - fire on both window-state and windows-changed events,
 *   - send Back several times (backs out of / closes the app),
 *   - then Home + our blocked screen,
 *   - and re-fire immediately whenever the blocked app returns to the front.
 */
public class BlockerService extends AccessibilityService {

    private final Handler handler = new Handler(Looper.getMainLooper());
    private long lastFire;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        int type = event.getEventType();
        if (type != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                && type != AccessibilityEvent.TYPE_WINDOWS_CHANGED) {
            return;
        }
        CharSequence p = event.getPackageName();
        if (p == null) return;
        final String pkg = p.toString();
        if (pkg.equals(getPackageName())) return;
        if (!Prefs.isBlocked(this, pkg)) return;

        // Throttle only slightly so a still-foreground app keeps getting kicked.
        long now = SystemClock.elapsedRealtime();
        if (now - lastFire < 250) return;
        lastFire = now;

        kick(pkg);
    }

    private void kick(final String pkg) {
        // Back a few times: navigates out of and closes the app.
        performGlobalAction(GLOBAL_ACTION_BACK);
        handler.postDelayed(new BackTask(), 120);
        handler.postDelayed(new BackTask(), 260);
        handler.postDelayed(new BackTask(), 420);

        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                performGlobalAction(GLOBAL_ACTION_HOME);
                Intent i = new Intent(BlockerService.this, BlockedActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_NO_ANIMATION);
                i.putExtra(BlockedActivity.EXTRA_PKG, pkg);
                try {
                    startActivity(i);
                } catch (Exception ignored) {
                }
            }
        }, 540);
    }

    private final class BackTask implements Runnable {
        @Override
        public void run() {
            performGlobalAction(GLOBAL_ACTION_BACK);
        }
    }

    @Override
    public void onInterrupt() {
    }
}

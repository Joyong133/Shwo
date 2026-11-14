package com.shwo.keepscreenon;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.provider.Settings;
import android.service.quicksettings.TileService;
import android.content.ComponentName;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;

/**
 * Foreground service that keeps the display on until the user stops it.
 *
 * Primary mechanism: a 1x1, fully transparent, non-touchable overlay window with
 * FLAG_KEEP_SCREEN_ON. The window manager keeps the display awake for as long as any
 * visible window carries that flag, regardless of which app is in front.
 *
 * Fallback: a SCREEN_BRIGHT_WAKE_LOCK (deprecated, but still honoured on many devices),
 * used when the "display over other apps" permission has not been granted.
 */
public class KeepAwakeService extends Service {

    public static final String ACTION_START = "com.shwo.keepscreenon.START";
    public static final String ACTION_STOP = "com.shwo.keepscreenon.STOP";

    private static final String CHANNEL_ID = "keep_awake";
    private static final int NOTIFICATION_ID = 1;

    private static volatile boolean running = false;

    private View overlay;
    private PowerManager.WakeLock wakeLock;

    public static boolean isRunning() {
        return running;
    }

    public static void start(Context ctx) {
        Intent i = new Intent(ctx, KeepAwakeService.class).setAction(ACTION_START);
        ctx.startForegroundService(i);
    }

    public static void stop(Context ctx) {
        Intent i = new Intent(ctx, KeepAwakeService.class).setAction(ACTION_STOP);
        ctx.startService(i);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Always enter the foreground first: startForegroundService() requires it.
        startInForeground();

        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }

        running = true;
        acquire();
        refreshTile();
        // Restarted automatically (with a null intent) if the system kills the process.
        return START_STICKY;
    }

    private void startInForeground() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm.getNotificationChannel(CHANNEL_ID) == null) {
            NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID, "Keep screen on", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Shown while the screen is being kept on");
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        }

        PendingIntent openApp = PendingIntent.getActivity(this, 0,
                new Intent(this, MainActivity.class),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent stopIntent = PendingIntent.getService(this, 1,
                new Intent(this, KeepAwakeService.class).setAction(ACTION_STOP),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Notification n = new Notification.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_tile)
                .setContentTitle("Screen is being kept on")
                .setContentText(Settings.canDrawOverlays(this)
                        ? "Tap Stop to let the screen turn off normally"
                        : "Limited mode: allow \"Display over other apps\" for best results")
                .setContentIntent(openApp)
                .setOngoing(true)
                .addAction(new Notification.Action.Builder(null, "Stop", stopIntent).build())
                .build();

        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIFICATION_ID, n);
        }
    }

    @SuppressWarnings("deprecation")
    private void acquire() {
        if (overlay == null && Settings.canDrawOverlays(this)) {
            WindowManager wm = getSystemService(WindowManager.class);
            WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                    1, 1,
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                            | WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                            | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                            | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    PixelFormat.TRANSLUCENT);
            lp.gravity = Gravity.TOP | Gravity.START;
            lp.x = 0;
            lp.y = 0;
            // Below the 0.8 "untrusted touch" limit so touches always pass through.
            lp.alpha = 0.5f;
            View v = new View(this);
            v.setBackgroundColor(0x00000000);
            try {
                wm.addView(v, lp);
                overlay = v;
            } catch (RuntimeException ignored) {
                overlay = null;
            }
        }

        if (wakeLock == null) {
            PowerManager pm = getSystemService(PowerManager.class);
            wakeLock = pm.newWakeLock(
                    PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ON_AFTER_RELEASE,
                    "KeepScreenOn::screen");
            wakeLock.setReferenceCounted(false);
            wakeLock.acquire();
        }
    }

    private void release() {
        if (overlay != null) {
            try {
                getSystemService(WindowManager.class).removeView(overlay);
            } catch (RuntimeException ignored) {
            }
            overlay = null;
        }
        if (wakeLock != null) {
            if (wakeLock.isHeld()) wakeLock.release();
            wakeLock = null;
        }
    }

    private void refreshTile() {
        TileService.requestListeningState(this, new ComponentName(this, KeepAwakeTileService.class));
    }

    @Override
    public void onDestroy() {
        running = false;
        release();
        refreshTile();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

package kr.shwo.focuslock;

import android.app.Notification;
import android.content.ComponentName;
import android.content.Context;
import android.provider.Settings;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

/**
 * 원격 조작 앱(Spatial Phone 등)이 연결돼 있는지 알림으로 감지한다.
 * 화면을 보내는 동안 그 앱은 "화면 공유 중" 같은 상시(진행 중) 알림을 띄운다.
 * 알림 내용은 읽거나 저장하지 않고, 어느 앱의 상시 알림인지만 본다.
 */
public class NotifWatcher extends NotificationListenerService {

    private static NotifWatcher instance;
    private static volatile boolean targetActive;

    static boolean isTargetActive() { return instance != null && targetActive; }
    static boolean isConnected() { return instance != null; }

    static boolean isAllowed(Context c) {
        String s = Settings.Secure.getString(c.getContentResolver(), "enabled_notification_listeners");
        if (s == null) return false;
        String me = new ComponentName(c, NotifWatcher.class).flattenToString();
        for (String p : s.split(":")) if (p.equals(me)) return true;
        return false;
    }

    /** 대상 앱을 바꿨을 때 다시 계산 */
    static void refreshNow() {
        if (instance != null) instance.recompute();
    }

    @Override
    public void onListenerConnected() {
        instance = this;
        recompute();
    }

    @Override
    public void onListenerDisconnected() {
        instance = null;
        setActive(false);
    }

    @Override public void onNotificationPosted(StatusBarNotification sbn) { recompute(); }
    @Override public void onNotificationRemoved(StatusBarNotification sbn) { recompute(); }

    private void recompute() {
        String pkg = RemoteApp.targetPackage(this);
        boolean active = false;
        if (pkg != null) {
            try {
                StatusBarNotification[] list = getActiveNotifications();
                if (list != null) {
                    for (StatusBarNotification sbn : list) {
                        if (!pkg.equals(sbn.getPackageName())) continue;
                        int flags = sbn.getNotification().flags;
                        if (sbn.isOngoing() || (flags & Notification.FLAG_FOREGROUND_SERVICE) != 0) {
                            active = true;
                            break;
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
        setActive(active);
    }

    private static void setActive(boolean active) {
        if (targetActive == active) return;
        targetActive = active;
        TouchLockService s = TouchLockService.get();
        if (s != null) s.update();
    }
}

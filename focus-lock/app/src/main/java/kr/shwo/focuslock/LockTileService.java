package kr.shwo.focuslock;

import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

/** 빠른 설정(상단 내림 메뉴) 타일: 눌러서 바로 터치 잠금 */
public class LockTileService extends TileService {

    static void requestRefresh(Context c) {
        try {
            TileService.requestListeningState(c, new ComponentName(c, LockTileService.class));
        } catch (Exception ignored) {}
    }

    @Override
    public void onStartListening() {
        refresh();
    }

    @SuppressLint("StartActivityAndCollapseDeprecated")
    @Override
    public void onClick() {
        TouchLockService s = TouchLockService.get();
        if (s == null) {
            // 접근성 서비스가 꺼져 있으면 앱을 열어 안내
            Intent i = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (Build.VERSION.SDK_INT >= 34) {
                startActivityAndCollapse(PendingIntent.getActivity(this, 0, i, PendingIntent.FLAG_IMMUTABLE));
            } else {
                startActivityAndCollapse(i);
            }
            return;
        }
        if (s.isLocked()) {
            s.unlockByUser("타일");
        } else {
            // 알림창이 닫힐 시간을 주고 잠근다
            s.startManualLock(1500);
        }
        refresh();
    }

    private void refresh() {
        Tile t = getQsTile();
        if (t == null) return;
        TouchLockService s = TouchLockService.get();
        if (s == null) {
            t.setState(Tile.STATE_INACTIVE); // 누르면 앱을 열어 권한 안내
        } else {
            t.setState(s.isLocked() ? Tile.STATE_ACTIVE : Tile.STATE_INACTIVE);
        }
        t.updateTile();
    }
}

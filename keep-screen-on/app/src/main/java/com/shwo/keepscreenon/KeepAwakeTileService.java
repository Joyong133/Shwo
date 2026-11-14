package com.shwo.keepscreenon;

import android.content.Intent;
import android.provider.Settings;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

/** Quick Settings tile: toggle keep-screen-on from the notification shade. */
public class KeepAwakeTileService extends TileService {

    @Override
    public void onStartListening() {
        update(KeepAwakeService.isRunning());
    }

    @Override
    public void onClick() {
        if (KeepAwakeService.isRunning()) {
            KeepAwakeService.stop(this);
            update(false);
        } else if (!Settings.canDrawOverlays(this)) {
            // Needs setup first: open the app.
            Intent i = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivityAndCollapseCompat(i);
        } else {
            KeepAwakeService.start(this);
            update(true);
        }
    }

    @SuppressWarnings("deprecation")
    private void startActivityAndCollapseCompat(Intent i) {
        if (android.os.Build.VERSION.SDK_INT >= 34) {
            android.app.PendingIntent pi = android.app.PendingIntent.getActivity(this, 0, i,
                    android.app.PendingIntent.FLAG_IMMUTABLE);
            startActivityAndCollapse(pi);
        } else {
            startActivityAndCollapse(i);
        }
    }

    private void update(boolean on) {
        Tile t = getQsTile();
        if (t == null) return;
        t.setState(on ? Tile.STATE_ACTIVE : Tile.STATE_INACTIVE);
        if (android.os.Build.VERSION.SDK_INT >= 29) t.setSubtitle(on ? "On" : "Off");
        t.updateTile();
    }
}

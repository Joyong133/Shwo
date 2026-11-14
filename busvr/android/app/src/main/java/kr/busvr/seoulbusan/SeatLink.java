package kr.busvr.seoulbusan;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.os.Binder;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

/** The seat-monitor helper (started from adb) hands its binder to the bus app through this provider. Only adb (shell) or root may call it. */
public class SeatLink extends ContentProvider {
    static volatile IBinder helper;

    @Override
    public Bundle call(String method, String arg, Bundle extras) {
        Bundle out = new Bundle();
        int uid = Binder.getCallingUid();
        if (!"helper".equals(method) || extras == null || (uid != 2000 && uid != 0)) { out.putBoolean("ok", false); return out; }
        IBinder b = extras.getBinder("binder");
        helper = b;
        Log.i("BusVR", "seat helper connected (version " + extras.getInt("version") + ")");
        out.putBoolean("ok", b != null);
        return out;
    }

    @Override public boolean onCreate() { return true; }
    @Override public Cursor query(Uri uri, String[] p, String s, String[] a, String o) { return null; }
    @Override public String getType(Uri uri) { return null; }
    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String s, String[] a) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String s, String[] a) { return 0; }
}

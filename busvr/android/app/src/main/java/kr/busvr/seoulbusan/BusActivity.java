package kr.busvr.seoulbusan;

import android.app.NativeActivity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.SurfaceTexture;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Parcel;
import android.view.Surface;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.text.TextUtils;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.text.Collator;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * NativeActivity plus the few things the C++ side cannot do on its own:
 * list the apps installed on the headset (store apps and sideloaded APKs), draw their icons,
 * open one of them, and leave a "back to the bus" notification while the rider is away.
 */
public class BusActivity extends NativeActivity {
    private static final String TAG = "BusVR";
    private static final String CHANNEL = "ride";
    private static final int NOTE_ID = 1;
    private static final String VR_CATEGORY = "com.oculus.intent.category.VR";
    // Built-in apps worth offering on a long ride.
    private static final Set<String> SYSTEM_OK = new HashSet<>(Arrays.asList(
            "com.oculus.browser", "com.oculus.tv", "com.meta.tv", "com.oculus.gallery", "com.oculus.photos"));

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        writeHelperScript();
    }

    /** start.sh for the seat-monitor helper; run it from adb once per headset boot. */
    private void writeHelperScript() {
        try {
            File dir = getExternalFilesDir(null);
            if (dir == null) return;
            String apk = getApplicationInfo().sourceDir;
            String sh = "#!/system/bin/sh\n"
                    + "# Seoul-Busan bus VR: seat-monitor helper. Run once per headset boot:\n"
                    + "#   adb shell sh /sdcard/Android/data/" + getPackageName() + "/files/start.sh\n"
                    + "APK=\"" + apk + "\"\n"
                    + "pkill -f busvr_seat_helper >/dev/null 2>&1\n"
                    + "if command -v setsid >/dev/null 2>&1; then RUN=setsid; else RUN=; fi\n"
                    + "CLASSPATH=\"$APK\" $RUN nohup app_process /system/bin --nice-name=busvr_seat_helper kr.busvr.seoulbusan.SeatHelper >/dev/null 2>&1 &\n"
                    + "sleep 2\n"
                    + "if pgrep -f busvr_seat_helper >/dev/null 2>&1; then echo 'OK: seat monitor helper is running'; else echo 'FAILED: helper did not start'; fi\n";
            FileOutputStream out = new FileOutputStream(new File(dir, "start.sh"));
            out.write(sh.getBytes("UTF-8"));
            out.close();
        } catch (Exception e) {
            Log.w(TAG, "start.sh", e);
        }
    }

    // ------------------------------------------------------------------ seat monitor (talks to SeatHelper)
    private static final int T_PING = 1, T_OPEN = 2, T_LAUNCH = 3, T_TOUCH = 4, T_SCROLL = 5, T_KEY = 6, T_CLOSE = 7;
    private SurfaceTexture monTex; private Surface monSurface; private int monDisplay = -1;
    private volatile boolean monFrame = false;
    private final android.os.Binder monToken = new android.os.Binder();

    /** 1 when the adb helper is connected and alive. */
    public int helperState() {
        IBinder b = SeatLink.helper;
        if (b == null) return 0;
        if (!b.isBinderAlive() || !b.pingBinder()) { SeatLink.helper = null; monDisplay = -1; return 0; }
        return 1;
    }

    private boolean transact(int code, Parcel d, Parcel r, boolean oneway) {
        IBinder b = SeatLink.helper;
        if (b == null) return false;
        try {
            return b.transact(code, d, r, oneway ? IBinder.FLAG_ONEWAY : 0);
        } catch (Exception e) {
            Log.w(TAG, "seat helper call " + code, e);
            return false;
        }
    }

    /** Creates (once) the texture-backed surface and the helper's virtual display drawing into it. Returns the display id or -1. */
    public int monitorOpen(int glTexture, int w, int h, int dpi) {
        if (monDisplay >= 0 && helperState() == 1) return monDisplay;
        if (helperState() != 1) return -1;
        if (monTex == null) {
            monTex = new SurfaceTexture(glTexture);
            monTex.setDefaultBufferSize(w, h);
            monTex.setOnFrameAvailableListener(new SurfaceTexture.OnFrameAvailableListener() {
                @Override public void onFrameAvailable(SurfaceTexture t) { monFrame = true; }
            });
            monSurface = new Surface(monTex);
        }
        Parcel d = Parcel.obtain(), r = Parcel.obtain();
        try {
            monSurface.writeToParcel(d, 0);
            d.writeInt(w); d.writeInt(h); d.writeInt(dpi);
            d.writeStrongBinder(monToken);
            monDisplay = transact(T_OPEN, d, r, false) ? r.readInt() : -1;
        } catch (Exception e) {
            Log.w(TAG, "monitorOpen", e);
            monDisplay = -1;
        } finally { d.recycle(); r.recycle(); }
        return monDisplay;
    }

    public boolean monitorLaunch(String pkg) {
        if (monDisplay < 0) return false;
        Intent i = launchIntent(getPackageManager(), pkg);
        if (i == null || i.getComponent() == null) return false;
        Parcel d = Parcel.obtain(), r = Parcel.obtain();
        try {
            d.writeInt(monDisplay); d.writeString(i.getComponent().flattenToString()); d.writeString(pkg);
            return transact(T_LAUNCH, d, r, false) && r.readInt() == 1;
        } finally { d.recycle(); r.recycle(); }
    }

    public void monitorTouch(int action, float x, float y) {
        if (monDisplay < 0) return;
        Parcel d = Parcel.obtain();
        try { d.writeInt(monDisplay); d.writeInt(action); d.writeFloat(x); d.writeFloat(y); transact(T_TOUCH, d, null, true); } finally { d.recycle(); }
    }

    public void monitorScroll(float x, float y, float v) {
        if (monDisplay < 0) return;
        Parcel d = Parcel.obtain();
        try { d.writeInt(monDisplay); d.writeFloat(x); d.writeFloat(y); d.writeFloat(v); transact(T_SCROLL, d, null, true); } finally { d.recycle(); }
    }

    public void monitorKey(int keyCode) {
        if (monDisplay < 0) return;
        Parcel d = Parcel.obtain();
        try { d.writeInt(monDisplay); d.writeInt(keyCode); transact(T_KEY, d, null, true); } finally { d.recycle(); }
    }

    public void monitorClose() {
        Parcel d = Parcel.obtain(), r = Parcel.obtain();
        try { transact(T_CLOSE, d, r, false); } finally { d.recycle(); r.recycle(); }
        monDisplay = -1;
    }

    /** Latches the newest frame into the GL texture (call on the GL thread). Returns true once any frame has arrived. */
    public boolean monitorUpdate(float[] matrix) {
        if (monTex == null) return false;
        try {
            monTex.updateTexImage();
            monTex.getTransformMatrix(matrix);
        } catch (Exception e) {
            return false;
        }
        return monFrame;
    }

    @Override
    protected void onResume() {
        super.onResume();
        try {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null) nm.cancel(NOTE_ID);
        } catch (Exception e) {
            Log.w(TAG, "cancel notification", e);
        }
    }

    private static Intent launchIntent(PackageManager pm, String pkg) {
        Intent i = pm.getLaunchIntentForPackage(pkg);
        if (i == null) {
            // Many Quest apps only declare the VR category, not the phone launcher one.
            Intent q = new Intent(Intent.ACTION_MAIN).addCategory(VR_CATEGORY).setPackage(pkg);
            List<ResolveInfo> r = pm.queryIntentActivities(q, 0);
            if (r != null && !r.isEmpty() && r.get(0).activityInfo != null) {
                i = new Intent(Intent.ACTION_MAIN).addCategory(VR_CATEGORY).setClassName(pkg, r.get(0).activityInfo.name);
            }
        }
        if (i != null) i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return i;
    }

    @SuppressWarnings("deprecation")
    private static String installerOf(PackageManager pm, String pkg) {
        try {
            if (Build.VERSION.SDK_INT >= 30) return pm.getInstallSourceInfo(pkg).getInstallingPackageName();
            return pm.getInstallerPackageName(pkg);
        } catch (Exception e) {
            return null;
        }
    }

    /** One entry per app that can be opened: "package \t label \t apk(1/0) \t vr(1/0)". Sideloaded apps first. */
    public String[] queryApps() {
        PackageManager pm = getPackageManager();
        List<ApplicationInfo> all;
        try {
            all = pm.getInstalledApplications(0);
        } catch (Exception e) {
            Log.e(TAG, "getInstalledApplications", e);
            return new String[0];
        }
        final List<String[]> rows = new ArrayList<>();
        for (ApplicationInfo ai : all) {
            String pkg = ai.packageName;
            if (pkg == null || pkg.equals(getPackageName())) continue;
            boolean system = (ai.flags & ApplicationInfo.FLAG_SYSTEM) != 0 && (ai.flags & ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0;
            if (system && !SYSTEM_OK.contains(pkg)) continue;
            try {
                if (launchIntent(pm, pkg) == null) continue;
            } catch (Exception e) {
                continue;
            }
            boolean vr = false;
            try {
                Intent q = new Intent(Intent.ACTION_MAIN).addCategory(VR_CATEGORY).setPackage(pkg);
                List<ResolveInfo> r = pm.queryIntentActivities(q, 0);
                vr = r != null && !r.isEmpty();
                ApplicationInfo full = pm.getApplicationInfo(pkg, PackageManager.GET_META_DATA);
                if (full.metaData != null && "vr_only".equals(full.metaData.getString("com.samsung.android.vr.application.mode"))) vr = true;
            } catch (Exception ignored) { }
            String inst = installerOf(pm, pkg);
            boolean store = inst != null && (inst.startsWith("com.oculus") || inst.startsWith("com.meta") || inst.equals("com.android.vending"));
            boolean apk = !system && !store;
            String label = String.valueOf(pm.getApplicationLabel(ai)).replace('\t', ' ').replace('\n', ' ').trim();
            if (label.isEmpty()) label = pkg;
            rows.add(new String[]{pkg, label, apk ? "1" : "0", vr ? "1" : "0"});
        }
        final Collator col = Collator.getInstance(Locale.KOREAN);
        Collections.sort(rows, new Comparator<String[]>() {
            @Override
            public int compare(String[] a, String[] b) {
                if (!a[2].equals(b[2])) return b[2].compareTo(a[2]);
                return col.compare(a[1], b[1]);
            }
        });
        String[] out = new String[rows.size()];
        for (int k = 0; k < out.length; k++) out[k] = rows.get(k)[0] + "\t" + rows.get(k)[1] + "\t" + rows.get(k)[2] + "\t" + rows.get(k)[3];
        return out;
    }

    /** size x size tile: icon on top, name below (system font, so any language works), "APK" badge for sideloaded apps. ARGB, top row first. */
    public int[] renderTile(String pkg, boolean apk, int size) {
        Bitmap bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(bmp);
        PackageManager pm = getPackageManager();
        String label = pkg;
        int is = size * 9 / 16, x0 = (size - is) / 2, y0 = size / 22;
        try {
            label = String.valueOf(pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)));
            Drawable d = pm.getApplicationIcon(pkg);
            d.setBounds(x0, y0, x0 + is, y0 + is);
            d.draw(c);
        } catch (Exception e) {
            Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
            p.setColor(0xff3a4a66);
            c.drawRoundRect(new RectF(x0, y0, x0 + is, y0 + is), is * 0.2f, is * 0.2f, p);
        }
        TextPaint tp = new TextPaint(Paint.ANTI_ALIAS_FLAG);
        tp.setColor(0xffffffff);
        tp.setTextSize(size * 0.112f);
        tp.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        tp.setShadowLayer(size * 0.012f, 0, size * 0.004f, 0xcc000000);
        int pad = size / 32;
        StaticLayout sl = StaticLayout.Builder.obtain(label, 0, label.length(), tp, size - pad * 2)
                .setAlignment(Layout.Alignment.ALIGN_CENTER)
                .setMaxLines(2)
                .setEllipsize(TextUtils.TruncateAt.END)
                .setIncludePad(false)
                .build();
        c.save();
        c.translate(pad, y0 + is + size * 0.035f);
        sl.draw(c);
        c.restore();
        if (apk) {
            Paint bp = new Paint(Paint.ANTI_ALIAS_FLAG);
            bp.setColor(0xfff2b84b);
            float bw = size * 0.27f, bh = size * 0.12f, bx = size - bw - size * 0.02f, by = size * 0.02f;
            c.drawRoundRect(new RectF(bx, by, bx + bw, by + bh), bh * 0.3f, bh * 0.3f, bp);
            TextPaint t2 = new TextPaint(Paint.ANTI_ALIAS_FLAG);
            t2.setColor(0xff16130a);
            t2.setTextSize(bh * 0.72f);
            t2.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
            t2.setTextAlign(Paint.Align.CENTER);
            c.drawText("APK", bx + bw / 2, by + bh * 0.76f, t2);
        }
        int[] px = new int[size * size];
        bmp.getPixels(px, 0, size, 0, 0, size, size);
        bmp.recycle();
        return px;
    }

    /** Opens another app. The notification brings the rider back to the bus. */
    public boolean launchApp(String pkg, String title, String text) {
        final Intent i;
        try {
            i = launchIntent(getPackageManager(), pkg);
        } catch (Exception e) {
            Log.e(TAG, "launch intent for " + pkg, e);
            return false;
        }
        if (i == null) return false;
        postReturnNotification(title, text);
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    startActivity(i);
                } catch (Exception e) {
                    Log.e(TAG, "startActivity " + i, e);
                }
            }
        });
        return true;
    }

    private void postReturnNotification(String title, String text) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm == null) return;
            nm.createNotificationChannel(new NotificationChannel(CHANNEL, "고속버스 운행", NotificationManager.IMPORTANCE_DEFAULT));
            Intent back = new Intent(this, BusActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent pi = PendingIntent.getActivity(this, 0, back, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            Notification n = new Notification.Builder(this, CHANNEL)
                    .setSmallIcon(android.R.drawable.ic_dialog_map)
                    .setContentTitle(title)
                    .setContentText(text)
                    .setContentIntent(pi)
                    .setAutoCancel(true)
                    .build();
            nm.notify(NOTE_ID, n);
        } catch (Exception e) {
            Log.w(TAG, "notification", e);
        }
    }
}

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
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.text.TextUtils;
import android.util.Log;

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

    /** One entry per app that can be opened: "package \t label \t 1 if sideloaded APK else 0". Sideloaded apps first. */
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
            String inst = installerOf(pm, pkg);
            boolean store = inst != null && (inst.startsWith("com.oculus") || inst.startsWith("com.meta") || inst.equals("com.android.vending"));
            boolean apk = !system && !store;
            String label = String.valueOf(pm.getApplicationLabel(ai)).replace('\t', ' ').replace('\n', ' ').trim();
            if (label.isEmpty()) label = pkg;
            rows.add(new String[]{pkg, label, apk ? "1" : "0"});
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
        for (int k = 0; k < out.length; k++) out[k] = rows.get(k)[0] + "\t" + rows.get(k)[1] + "\t" + rows.get(k)[2];
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

package kr.busvr.seoulbusan;

import android.content.AttributionSource;
import android.content.Context;
import android.content.ContextWrapper;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.os.Binder;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Looper;
import android.os.Parcel;
import android.os.SystemClock;
import android.util.Log;
import android.view.InputDevice;
import android.view.InputEvent;
import android.view.KeyCharacterMap;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.Surface;

import java.io.File;
import java.io.FileInputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;

/**
 * Seat-monitor helper. Started once per headset boot from adb (it then runs with the shell user's rights):
 *   adb shell sh /sdcard/Android/data/kr.busvr.seoulbusan/files/start.sh
 * It creates a virtual display that draws straight into the bus app's seat-monitor texture, opens the chosen APK on it
 * and forwards the rider's touches, scrolls and Back presses. A normal app may not show other apps inside itself;
 * the shell user may (the same way scrcpy's virtual displays work).
 */
public final class SeatHelper extends Binder {
    static final String TAG = "BusVR-seat";
    static final String APP = "kr.busvr.seoulbusan";
    static final String AUTHORITY = "kr.busvr.seoulbusan.seatlink";
    static final int VERSION = 1;
    static final int T_PING = 1, T_OPEN = 2, T_LAUNCH = 3, T_TOUCH = 4, T_SCROLL = 5, T_KEY = 6, T_CLOSE = 7;

    private VirtualDisplay display;
    private IBinder clientToken;
    private final Set<String> launchedHere = new HashSet<>();
    private long downTime;
    private Object inputManager; private Method injectMethod, setDisplayIdMethod;

    public static void main(String[] args) {
        Looper.prepareMainLooper();
        final SeatHelper helper = new SeatHelper();
        Log.i(TAG, "seat helper running as uid " + android.os.Process.myUid() + ", sdk " + Build.VERSION.SDK_INT);
        System.out.println("seat helper running");
        Thread watcher = new Thread(new Runnable() {
            @Override
            public void run() {
                int lastPid = -1;
                while (true) {
                    try {
                        int pid = findAppPid();
                        if (pid > 0 && pid != lastPid) {
                            // the bus app (re)started: hand it our binder
                            if (sendBinder(helper)) { lastPid = pid; Log.i(TAG, "connected to bus app pid " + pid); }
                        } else if (pid <= 0) lastPid = -1;
                        Thread.sleep(1500);
                    } catch (Throwable t) {
                        Log.w(TAG, "watcher", t);
                        try { Thread.sleep(3000); } catch (InterruptedException ignored) { }
                    }
                }
            }
        }, "seat-watch");
        watcher.setDaemon(true);
        watcher.start();
        Looper.loop();
    }

    // ------------------------------------------------------------------ finding and reaching the bus app
    static int findAppPid() {
        File[] procs = new File("/proc").listFiles();
        if (procs == null) return -1;
        byte[] buf = new byte[128];
        for (File p : procs) {
            String n = p.getName();
            if (n.isEmpty() || n.charAt(0) < '0' || n.charAt(0) > '9') continue;
            try (FileInputStream in = new FileInputStream(new File(p, "cmdline"))) {
                int len = in.read(buf);
                if (len <= 0) continue;
                int end = 0;
                while (end < len && buf[end] != 0) end++;
                if (new String(buf, 0, end, "UTF-8").equals(APP)) return Integer.parseInt(n);
            } catch (Exception ignored) { }
        }
        return -1;
    }

    /** Delivers our binder through the bus app's content provider (the way Shizuku hands out its binder). */
    static boolean sendBinder(IBinder me) {
        Object am = null; IBinder token = new Binder();
        try {
            am = Class.forName("android.app.ActivityManager").getMethod("getService").invoke(null);
            Object holder = null;
            for (Method m : am.getClass().getMethods()) {
                if (!m.getName().equals("getContentProviderExternal")) continue;
                int n = m.getParameterTypes().length;
                if (n == 4) holder = m.invoke(am, AUTHORITY, 0, token, null);
                else if (n == 3) holder = m.invoke(am, AUTHORITY, 0, token);
                else continue;
                break;
            }
            if (holder == null) { Log.w(TAG, "provider not found"); return false; }
            Field f = holder.getClass().getField("provider");
            f.setAccessible(true);
            Object provider = f.get(holder);
            Bundle extras = new Bundle();
            extras.putBinder("binder", me);
            extras.putInt("version", VERSION);
            Bundle reply = null; boolean called = false;
            for (Method m : provider.getClass().getMethods()) {
                if (!m.getName().equals("call")) continue;
                Class<?>[] p = m.getParameterTypes();
                if (p.length == 5 && p[0].getName().equals("android.content.AttributionSource") && Build.VERSION.SDK_INT >= 31) {
                    AttributionSource as = new AttributionSource.Builder(android.os.Process.myUid()).setPackageName("com.android.shell").build();
                    reply = (Bundle) m.invoke(provider, as, AUTHORITY, "helper", null, extras);
                } else if (p.length == 6 && p[0] == String.class) {
                    reply = (Bundle) m.invoke(provider, "com.android.shell", null, AUTHORITY, "helper", null, extras);
                } else if (p.length == 5 && p[0] == String.class) {
                    reply = (Bundle) m.invoke(provider, "com.android.shell", AUTHORITY, "helper", null, extras);
                } else continue;
                called = true;
                break;
            }
            return called && reply != null && reply.getBoolean("ok");
        } catch (Throwable t) {
            Log.w(TAG, "sendBinder", t);
            return false;
        } finally {
            if (am != null) {
                try {
                    for (Method m : am.getClass().getMethods()) {
                        if (m.getName().equals("removeContentProviderExternalAsUser") && m.getParameterTypes().length == 3) { m.invoke(am, AUTHORITY, token, 0); break; }
                        if (m.getName().equals("removeContentProviderExternal") && m.getParameterTypes().length == 2) { m.invoke(am, AUTHORITY, token); break; }
                    }
                } catch (Throwable ignored) { }
            }
        }
    }

    // ------------------------------------------------------------------ requests from the bus app
    @Override
    protected boolean onTransact(int code, Parcel data, Parcel reply, int flags) {
        try {
            switch (code) {
                case T_PING:
                    if (reply != null) reply.writeInt(VERSION);
                    return true;
                case T_OPEN: {
                    Surface s = Surface.CREATOR.createFromParcel(data);
                    int w = data.readInt(), h = data.readInt(), dpi = data.readInt();
                    IBinder token = data.readStrongBinder();
                    int id = open(s, w, h, dpi, token);
                    if (reply != null) reply.writeInt(id);
                    return true;
                }
                case T_LAUNCH: {
                    int id = data.readInt(); String component = data.readString(), pkg = data.readString();
                    boolean ok = launch(id, component, pkg);
                    if (reply != null) reply.writeInt(ok ? 1 : 0);
                    return true;
                }
                case T_TOUCH: {
                    int id = data.readInt(), action = data.readInt(); float x = data.readFloat(), y = data.readFloat();
                    touch(id, action, x, y);
                    return true;
                }
                case T_SCROLL: {
                    int id = data.readInt(); float x = data.readFloat(), y = data.readFloat(), v = data.readFloat();
                    scroll(id, x, y, v);
                    return true;
                }
                case T_KEY: {
                    int id = data.readInt(), key = data.readInt();
                    key(id, key);
                    return true;
                }
                case T_CLOSE:
                    close();
                    if (reply != null) reply.writeInt(1);
                    return true;
                default:
                    return super.onTransact(code, data, reply, flags);
            }
        } catch (Throwable t) {
            Log.e(TAG, "request " + code, t);
            if (reply != null && (code == T_OPEN)) reply.writeInt(-1);
            return true;
        }
    }

    // ------------------------------------------------------------------ the virtual display
    private static Context shellContext;
    private static synchronized Context shellContext() throws Exception {
        if (shellContext != null) return shellContext;
        Class<?> at = Class.forName("android.app.ActivityThread");
        Constructor<?> ctor = at.getDeclaredConstructor();
        ctor.setAccessible(true);
        Object thread = ctor.newInstance();
        Field cur = at.getDeclaredField("sCurrentActivityThread");
        cur.setAccessible(true);
        cur.set(null, thread);
        Field sys = at.getDeclaredField("mSystemThread");
        sys.setAccessible(true);
        sys.setBoolean(thread, true);
        Method gsc = at.getDeclaredMethod("getSystemContext");
        gsc.setAccessible(true);
        final Context base = (Context) gsc.invoke(thread);
        shellContext = new ContextWrapper(base) {
            @Override public String getPackageName() { return "com.android.shell"; }
            @Override public String getOpPackageName() { return "com.android.shell"; }
            @Override public AttributionSource getAttributionSource() {
                return new AttributionSource.Builder(android.os.Process.myUid()).setPackageName("com.android.shell").build();
            }
            @Override public Context getApplicationContext() { return this; }
        };
        return shellContext;
    }

    private synchronized int open(Surface surface, int w, int h, int dpi, IBinder token) throws Exception {
        close();
        // public | own content only | supports touch | destroy content on removal
        int flags = 1 | 8 | 64 | 256;
        if (Build.VERSION.SDK_INT >= 33) flags |= (1 << 10) | (1 << 11) | (1 << 12) | (1 << 13);   // trusted, own display group, always unlocked, no touch feedback
        if (Build.VERSION.SDK_INT >= 34) flags |= (1 << 14);                                        // own focus: touching the monitor never takes focus away from the bus
        Constructor<DisplayManager> c = DisplayManager.class.getDeclaredConstructor(Context.class);
        c.setAccessible(true);
        DisplayManager dm = c.newInstance(shellContext());
        display = dm.createVirtualDisplay("busvr-seat-monitor", w, h, dpi, surface, flags);
        launchedHere.clear();
        clientToken = token;
        if (token != null) {
            try {
                token.linkToDeath(new IBinder.DeathRecipient() {
                    @Override public void binderDied() { Log.i(TAG, "bus app went away, closing the monitor"); close(); }
                }, 0);
            } catch (Exception ignored) { }
        }
        int id = display.getDisplay().getDisplayId();
        Log.i(TAG, "monitor display " + id + " " + w + "x" + h + " @" + dpi);
        return id;
    }

    private synchronized void close() {
        if (display != null) { display.release(); display = null; }
        launchedHere.clear();
        clientToken = null;
    }

    private synchronized boolean launch(int id, String component, String pkg) throws Exception {
        if (display == null || display.getDisplay().getDisplayId() != id) return false;
        // An app already open elsewhere would stay where it is, so restart it once on the monitor.
        if (!launchedHere.contains(pkg)) run("am", "force-stop", pkg);
        int rc = run("am", "start", "--display", String.valueOf(id), "--windowingMode", "1", "-a", "android.intent.action.MAIN",
                "-c", "android.intent.category.LAUNCHER", "-f", "0x10200000", "-n", component);
        if (rc != 0) rc = run("am", "start", "--display", String.valueOf(id), "-n", component);
        launchedHere.add(pkg);
        Log.i(TAG, "launch " + component + " on " + id + " -> " + rc);
        return rc == 0;
    }

    private static int run(String... cmd) {
        try {
            Process p = new ProcessBuilder(cmd).redirectErrorStream(true).start();
            byte[] b = new byte[4096]; StringBuilder out = new StringBuilder(); int n;
            while ((n = p.getInputStream().read(b)) > 0) out.append(new String(b, 0, n));
            int rc = p.waitFor();
            if (out.length() > 0) Log.i(TAG, String.join(" ", cmd) + ": " + out.toString().trim());
            if (out.indexOf("Error") >= 0 || out.indexOf("Exception") >= 0) return 1;
            return rc;
        } catch (Exception e) {
            Log.w(TAG, "run", e);
            return 1;
        }
    }

    // ------------------------------------------------------------------ input
    private void ensureInput() throws Exception {
        if (injectMethod != null) return;
        Object im;
        try {
            im = Class.forName("android.hardware.input.InputManagerGlobal").getMethod("getInstance").invoke(null);
        } catch (Throwable t) {
            Method gi = Class.forName("android.hardware.input.InputManager").getDeclaredMethod("getInstance");
            gi.setAccessible(true);
            im = gi.invoke(null);
        }
        inputManager = im;
        injectMethod = im.getClass().getMethod("injectInputEvent", InputEvent.class, int.class);
        setDisplayIdMethod = InputEvent.class.getMethod("setDisplayId", int.class);
    }

    private void inject(InputEvent e, int displayId) throws Exception {
        ensureInput();
        setDisplayIdMethod.invoke(e, displayId);
        injectMethod.invoke(inputManager, e, 0);    // asynchronous
    }

    private void touch(int id, int action, float x, float y) throws Exception {
        long now = SystemClock.uptimeMillis();
        if (action == MotionEvent.ACTION_DOWN) downTime = now;
        MotionEvent.PointerProperties[] pp = {new MotionEvent.PointerProperties()};
        pp[0].id = 0; pp[0].toolType = MotionEvent.TOOL_TYPE_FINGER;
        MotionEvent.PointerCoords[] pc = {new MotionEvent.PointerCoords()};
        pc[0].x = x; pc[0].y = y; pc[0].pressure = action == MotionEvent.ACTION_UP ? 0f : 1f; pc[0].size = 1f;
        MotionEvent e = MotionEvent.obtain(downTime, now, action, 1, pp, pc, 0, 0, 1f, 1f, 0, 0, InputDevice.SOURCE_TOUCHSCREEN, 0);
        inject(e, id);
        e.recycle();
    }

    private void scroll(int id, float x, float y, float v) throws Exception {
        long now = SystemClock.uptimeMillis();
        MotionEvent.PointerProperties[] pp = {new MotionEvent.PointerProperties()};
        pp[0].id = 0; pp[0].toolType = MotionEvent.TOOL_TYPE_MOUSE;
        MotionEvent.PointerCoords[] pc = {new MotionEvent.PointerCoords()};
        pc[0].x = x; pc[0].y = y; pc[0].setAxisValue(MotionEvent.AXIS_VSCROLL, v);
        MotionEvent e = MotionEvent.obtain(now, now, MotionEvent.ACTION_SCROLL, 1, pp, pc, 0, 0, 1f, 1f, 0, 0, InputDevice.SOURCE_MOUSE, 0);
        inject(e, id);
        e.recycle();
    }

    private void key(int id, int keyCode) throws Exception {
        long now = SystemClock.uptimeMillis();
        for (int a = 0; a < 2; a++) {
            KeyEvent e = new KeyEvent(now, now, a == 0 ? KeyEvent.ACTION_DOWN : KeyEvent.ACTION_UP, keyCode, 0, 0,
                    KeyCharacterMap.VIRTUAL_KEYBOARD, 0, 0, InputDevice.SOURCE_KEYBOARD);
            inject(e, id);
        }
    }
}

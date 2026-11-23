package com.shwo.qpbridge;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.graphics.Point;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.Surface;

import java.nio.ByteBuffer;

/** 휴대폰 화면을 H.264 로 인코딩해서 퀘스트로 보내는 포그라운드 서비스. */
public final class MirrorService extends Service {

    public static final String EXTRA_RESULT_CODE = "resultCode";
    public static final String EXTRA_RESULT_DATA = "resultData";
    private static final String ACTION_STOP = "com.shwo.qpbridge.STOP_MIRROR";
    private static final String CHANNEL = "mirror";
    private static final int NOTIFICATION_ID = 7;

    /** {긴 변(px), 비트레이트(bps), 최대 fps} × 화질 0~2 */
    private static final int[][] BLE_PROFILES = {{480, 150_000, 12}, {640, 250_000, 10}, {864, 400_000, 8}};
    private static final int[][] USB_PROFILES = {{960, 3_000_000, 30}, {1280, 6_000_000, 30}, {1920, 10_000_000, 30}};

    static volatile MirrorService instance;

    private final Handler main = new Handler(Looper.getMainLooper());
    private Hub hub;
    private SharedPreferences prefs;
    private DisplayManager displayManager;
    private MediaProjection projection;
    private PowerManager.WakeLock wakeLock;
    private VirtualDisplay virtualDisplay;
    private MediaCodec codec;
    private Surface inputSurface;
    private Thread drainThread;
    private volatile boolean encoding;
    private volatile boolean needKey;
    private volatile byte[] lastConfig;
    private volatile long lastKeyRequest;
    private int linkKind = -1; // 0 없음, 1 블루투스, 2 USB
    private Point captureFor = new Point();

    /** 지금 보내는 영상 크기 (터치 좌표 변환용) */
    volatile int frameW, frameH;

    public static boolean isRunning() {
        return instance != null;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        hub = Hub.get(this);
        prefs = getSharedPreferences("qpbridge", MODE_PRIVATE);
        displayManager = (DisplayManager) getSystemService(DISPLAY_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }
        startForegroundNow();
        if (projection != null) return START_NOT_STICKY;

        int code = intent == null ? 0 : intent.getIntExtra(EXTRA_RESULT_CODE, 0);
        Intent data = intent == null ? null : intent.getParcelableExtra(EXTRA_RESULT_DATA);
        MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
        try {
            projection = data == null ? null : mpm.getMediaProjection(code, data);
        } catch (Exception e) {
            projection = null;
        }
        if (projection == null) {
            hub.log("화면 공유 권한을 받지 못했어요.");
            stopSelf();
            return START_NOT_STICKY;
        }
        projection.registerCallback(new MediaProjection.Callback() {
            @Override
            public void onStop() {
                main.post(MirrorService.this::stopSelf);
            }
        }, main);
        instance = this;
        // 공유하는 동안 휴대폰 화면이 꺼지고 잠기면 볼 수도 조작할 수도 없으니 화면을 켜 둠(어둡게)
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        //noinspection deprecation
        wakeLock = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "qpbridge:mirror");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire(6 * 60 * 60 * 1000L);
        displayManager.registerDisplayListener(displayListener, main);
        hub.log("화면 공유를 시작했어요.");
        onLinkChanged();
        PhoneController.get(this).onSharingChanged();
        return START_NOT_STICKY;
    }

    private void startForegroundNow() {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        nm.createNotificationChannel(new NotificationChannel(CHANNEL, "화면 공유", NotificationManager.IMPORTANCE_LOW));
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, PhoneActivity.class),
                PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1,
                new Intent(this, MirrorService.class).setAction(ACTION_STOP), PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(this, CHANNEL)
                .setSmallIcon(R.drawable.ic_launcher_fg)
                .setContentTitle("메타퀘스트로 화면 공유 중")
                .setContentText("퀘스트에서 이 휴대폰을 보고 조작할 수 있어요")
                .setContentIntent(open)
                .addAction(new Notification.Action.Builder(null, "공유 중지", stop).build())
                .setOngoing(true)
                .build();
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(NOTIFICATION_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION);
        } else {
            startForeground(NOTIFICATION_ID, n);
        }
    }

    @Override
    public void onDestroy() {
        instance = null;
        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
        wakeLock = null;
        try {
            displayManager.unregisterDisplayListener(displayListener);
        } catch (Exception ignored) {
        }
        stopCodec();
        if (virtualDisplay != null) virtualDisplay.release();
        virtualDisplay = null;
        if (projection != null) projection.stop();
        projection = null;
        hub.log("화면 공유를 멈췄어요.");
        PhoneController.get(this).onSharingChanged();
        super.onDestroy();
    }

    public static void stop(Context c) {
        c.stopService(new Intent(c, MirrorService.class));
    }

    // ── 연결/화질 변화 ──

    /** 연결 종류가 바뀌면 그에 맞는 화질로 인코더를 다시 시작 (메인 스레드) */
    void onLinkChanged() {
        Link a = hub.active();
        int kind = a == null ? 0 : (a == hub.usb ? 2 : 1);
        if (kind == linkKind && codec != null) return;
        linkKind = kind;
        restartEncoder();
    }

    void setQuality(int level) {
        level = Math.max(0, Math.min(2, level));
        if (prefs.getInt("quality", 1) == level) return;
        prefs.edit().putInt("quality", level).apply();
        restartEncoder();
    }

    /** 퀘스트가 키프레임을 요청 (메인 스레드) */
    void onKeyframeRequest() {
        byte[] cfg = lastConfig;
        if (cfg != null) hub.send(Proto.VIDEO_CONFIG, configPayload(frameW, frameH, cfg));
        lastKeyRequest = 0;
        requestSyncFrame();
    }

    private final DisplayManager.DisplayListener displayListener = new DisplayManager.DisplayListener() {
        @Override
        public void onDisplayAdded(int displayId) {}

        @Override
        public void onDisplayRemoved(int displayId) {}

        @Override
        public void onDisplayChanged(int displayId) {
            if (displayId != Display.DEFAULT_DISPLAY || codec == null) return;
            Point p = realSize();
            if (p.x != captureFor.x || p.y != captureFor.y) restartEncoder(); // 화면 회전
        }
    };

    private Point realSize() {
        Point p = new Point();
        Display d = displayManager.getDisplay(Display.DEFAULT_DISPLAY);
        //noinspection deprecation
        d.getRealSize(p);
        return p;
    }

    private int densityDpi() {
        DisplayMetrics m = new DisplayMetrics();
        //noinspection deprecation
        displayManager.getDisplay(Display.DEFAULT_DISPLAY).getRealMetrics(m);
        return m.densityDpi;
    }

    // ── 인코더 ──

    private void restartEncoder() {
        stopCodec();
        if (projection == null || !hub.isReady()) return;
        boolean usb = hub.usbActive();
        int level = prefs.getInt("quality", 1);
        int[][] table = usb ? USB_PROFILES : BLE_PROFILES;
        Point real = realSize();
        captureFor = real;

        MediaCodec c = null;
        int w = 0, h = 0;
        int[] profile = null;
        for (int lv = level; lv >= 0 && c == null; lv--) {
            profile = table[lv];
            int[] size = fit(real.x, real.y, profile[0]);
            w = size[0];
            h = size[1];
            c = createEncoder(w, h, profile[1], profile[2], usb);
        }
        if (c == null) {
            hub.log("이 휴대폰의 영상 인코더를 시작할 수 없어요.");
            return;
        }
        codec = c;
        inputSurface = c.createInputSurface();
        c.start();
        frameW = w;
        frameH = h;
        try {
            if (virtualDisplay == null) {
                virtualDisplay = projection.createVirtualDisplay("QPBridge", w, h, densityDpi(),
                        DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, inputSurface, null, null);
            } else {
                virtualDisplay.resize(w, h, densityDpi());
                virtualDisplay.setSurface(inputSurface);
            }
        } catch (SecurityException | IllegalStateException e) {
            hub.log("화면 캡처를 시작할 수 없어요. 다시 '화면 공유 시작'을 눌러 주세요.");
            stopSelf();
            return;
        }
        encoding = true;
        needKey = false;
        long maxPending = usb ? 4_000_000L : (long) profile[1] / 8; // 블루투스: 약 1초 분량까지만 쌓음
        MediaCodec runCodec = c;
        int fw = w, fh = h;
        drainThread = new Thread(() -> drainLoop(runCodec, fw, fh, maxPending), "encoder");
        drainThread.start();
        hub.log("화면 전송: " + w + "×" + h + ", " + (profile[1] / 1000) + "kbps, " + (usb ? "USB" : "블루투스"));
    }

    private static int[] fit(int dw, int dh, int longEdge) {
        float scale = Math.min(1f, longEdge / (float) Math.max(dw, dh));
        int w = Math.max(16, Math.round(dw * scale / 16f) * 16);
        int h = Math.max(16, Math.round(dh * scale / 16f) * 16);
        return new int[]{w, h};
    }

    private MediaCodec createEncoder(int w, int h, int bitrate, int fps, boolean usb) {
        MediaCodec c = null;
        try {
            c = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC);
            MediaCodecInfo.CodecCapabilities caps = c.getCodecInfo().getCapabilitiesForType(MediaFormat.MIMETYPE_VIDEO_AVC);
            if (!caps.getVideoCapabilities().isSizeSupported(w, h)) {
                c.release();
                return null;
            }
            MediaFormat f = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, w, h);
            f.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);
            f.setInteger(MediaFormat.KEY_BIT_RATE, bitrate);
            f.setInteger(MediaFormat.KEY_FRAME_RATE, fps);
            f.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, usb ? 2 : 10);
            f.setLong(MediaFormat.KEY_REPEAT_PREVIOUS_FRAME_AFTER, usb ? 500_000 : 1_000_000);
            f.setInteger(MediaFormat.KEY_PRIORITY, 0);
            if (Build.VERSION.SDK_INT >= 29) {
                f.setFloat(MediaFormat.KEY_MAX_FPS_TO_ENCODER, fps);
                f.setInteger(MediaFormat.KEY_MAX_B_FRAMES, 0);
            }
            if (caps.getEncoderCapabilities().isBitrateModeSupported(MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR)) {
                f.setInteger(MediaFormat.KEY_BITRATE_MODE, MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR);
            }
            c.configure(f, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
            return c;
        } catch (Exception e) {
            if (c != null) c.release();
            return null;
        }
    }

    private void stopCodec() {
        encoding = false;
        if (virtualDisplay != null) virtualDisplay.setSurface(null);
        if (drainThread != null) {
            try {
                drainThread.join(800);
            } catch (InterruptedException ignored) {
            }
        }
        drainThread = null;
        if (codec != null) {
            try {
                codec.stop();
            } catch (Exception ignored) {
            }
            codec.release();
        }
        codec = null;
        if (inputSurface != null) inputSurface.release();
        inputSurface = null;
        lastConfig = null;
    }

    private void requestSyncFrame() {
        long now = SystemClock.elapsedRealtime();
        if (now - lastKeyRequest < (hub.usbActive() ? 500 : 2000)) return;
        lastKeyRequest = now;
        MediaCodec c = codec;
        if (c == null) return;
        Bundle b = new Bundle();
        b.putInt(MediaCodec.PARAMETER_KEY_REQUEST_SYNC_FRAME, 0);
        try {
            c.setParameters(b);
        } catch (IllegalStateException ignored) {
        }
    }

    static byte[] configPayload(int w, int h, byte[] csd) {
        ByteBuffer b = ByteBuffer.allocate(8 + csd.length);
        b.putInt(w).putInt(h).put(csd);
        return b.array();
    }

    private void drainLoop(MediaCodec c, int w, int h, long maxPending) {
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        while (encoding) {
            int idx;
            try {
                idx = c.dequeueOutputBuffer(info, 20_000);
            } catch (IllegalStateException e) {
                break;
            }
            if (idx < 0) continue;
            byte[] data = new byte[info.size];
            ByteBuffer out = c.getOutputBuffer(idx);
            if (out != null && info.size > 0) {
                out.position(info.offset);
                out.get(data, 0, info.size);
            }
            try {
                c.releaseOutputBuffer(idx, false);
            } catch (IllegalStateException e) {
                break;
            }
            if (info.size == 0) continue;

            if ((info.flags & MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0) {
                lastConfig = data;
                hub.send(Proto.VIDEO_CONFIG, configPayload(w, h, data));
                continue;
            }
            boolean key = (info.flags & MediaCodec.BUFFER_FLAG_KEY_FRAME) != 0;
            if (!key && (needKey || hub.pendingBytes() > maxPending)) {
                // 전송이 밀리면 키프레임이 올 때까지 버려서 지연이 쌓이지 않게 함
                needKey = true;
                main.post(this::requestSyncFrame);
                continue;
            }
            needKey = false;
            byte[] msg = new byte[data.length + 1];
            msg[0] = (byte) (key ? 1 : 0);
            System.arraycopy(data, 0, msg, 1, data.length);
            hub.send(Proto.VIDEO_FRAME, msg);
        }
    }
}

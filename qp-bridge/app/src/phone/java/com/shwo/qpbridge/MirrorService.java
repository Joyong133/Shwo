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

import android.media.MediaCodecList;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/** 휴대폰 화면을 H.264 로 인코딩해서 퀘스트로 보내는 포그라운드 서비스. */
public final class MirrorService extends Service {

    public static final String EXTRA_RESULT_CODE = "resultCode";
    public static final String EXTRA_RESULT_DATA = "resultData";
    private static final String ACTION_STOP = "com.shwo.qpbridge.STOP_MIRROR";
    private static final String CHANNEL = "mirror";
    private static final int NOTIFICATION_ID = 7;

    /** {긴 변(px), 비트레이트(bps), 최대 fps} × 화질 0~2 */
    // 블루투스는 실제로 10~30KB/s 정도라 작게 시작하고, 측정한 속도에 맞춰 비트레이트를 자동 조절
    private static final int[][] BLE_PROFILES = {{360, 60_000, 6}, {480, 120_000, 8}, {640, 200_000, 10}};
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
    private final Set<String> badEncoders = new HashSet<>();
    private final AtomicInteger framesOut = new AtomicInteger();
    private final AtomicLong encodedBytes = new AtomicLong();
    private volatile String currentEncoder;
    private volatile int profileBitrate, currentBitrate;
    private volatile long linkRate;
    private volatile boolean usbMode;

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
        badEncoders.clear();
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

    /** 써 볼 H.264 인코더 이름들 (하드웨어 먼저, 소프트웨어는 마지막) */
    private static List<String> encoderNames() {
        List<String> hw = new ArrayList<>(), sw = new ArrayList<>();
        for (MediaCodecInfo info : new MediaCodecList(MediaCodecList.REGULAR_CODECS).getCodecInfos()) {
            if (!info.isEncoder()) continue;
            boolean avc = false;
            for (String t : info.getSupportedTypes()) if (t.equalsIgnoreCase(MediaFormat.MIMETYPE_VIDEO_AVC)) avc = true;
            if (!avc) continue;
            String n = info.getName();
            boolean soft = Build.VERSION.SDK_INT >= 29 ? info.isSoftwareOnly()
                    : n.startsWith("OMX.google.") || n.startsWith("c2.android.");
            (soft ? sw : hw).add(n);
        }
        hw.addAll(sw);
        return hw;
    }

    private void restartEncoder() {
        stopCodec();
        if (projection == null || !hub.isReady()) return;
        boolean usb = hub.usbActive();
        int level = prefs.getInt("quality", 1);
        int[][] table = usb ? USB_PROFILES : BLE_PROFILES;
        Point real = realSize();
        captureFor = real;

        // 인코더 × 화질 × (조정된 설정 → 기본 설정) 순서로 될 때까지 시도
        MediaCodec c = null;
        int w = 0, h = 0;
        int[] profile = null;
        String chosen = null;
        outer:
        for (String name : encoderNames()) {
            if (badEncoders.contains(name)) continue;
            for (int lv = level; lv >= 0; lv--) {
                profile = table[lv];
                int[] size = fit(real.x, real.y, profile[0]);
                w = size[0];
                h = size[1];
                for (boolean tuned : new boolean[]{true, false}) {
                    c = createEncoder(name, w, h, profile[1], profile[2], usb, tuned);
                    if (c != null) {
                        chosen = name;
                        break outer;
                    }
                }
            }
        }
        if (c == null) {
            hub.log("이 휴대폰에서 쓸 수 있는 영상 인코더가 없어요." + (badEncoders.isEmpty() ? "" : " (시도한 인코더: " + badEncoders + ")"));
            badEncoders.clear();
            return;
        }
        try {
            codec = c;
            inputSurface = c.createInputSurface();
            c.start();
        } catch (Exception e) {
            hub.log("인코더 " + chosen + " 시작 실패 → 다른 인코더로 다시 시도");
            badEncoders.add(chosen);
            codec = null;
            c.release();
            main.post(this::restartEncoder);
            return;
        }
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
            hub.log("화면 캡처를 시작할 수 없어요 (" + e.getClass().getSimpleName() + "). 다시 '화면 공유 시작'을 눌러 주세요.");
            stopSelf();
            return;
        }
        encoding = true;
        needKey = false;
        framesOut.set(0);
        encodedBytes.set(0);
        profileBitrate = profile[1];
        currentBitrate = profile[1];
        usbMode = usb;
        MediaCodec runCodec = c;
        int fw = w, fh = h;
        drainThread = new Thread(() -> drainLoop(runCodec, fw, fh), "encoder");
        drainThread.start();
        currentEncoder = chosen;
        hub.log("화면 전송 시작: " + w + "×" + h + ", " + (profile[1] / 1000) + "kbps, " + (usb ? "USB" : "블루투스")
                + ", 인코더 " + chosen);
        // 5초 안에 영상이 하나도 안 나오면 다른 인코더로
        final MediaCodec watch = c;
        main.postDelayed(() -> {
            if (codec == watch && encoding && framesOut.get() == 0) {
                hub.log("인코더 " + currentEncoder + " 가 영상을 만들지 않아요 → 다른 인코더로 다시 시도");
                badEncoders.add(currentEncoder);
                restartEncoder();
            }
        }, 5000);
        main.removeCallbacks(statsTick);
        main.postDelayed(statsTick, 1000);
    }

    /** 1초마다: 실제 전송 속도를 재서 블루투스면 비트레이트를 맞추고, 퀘스트에 상태 표시 */
    private final Runnable statsTick = new Runnable() {
        long lastSent = -1, lastEncoded;
        int tick;

        @Override
        public void run() {
            MediaCodec c = codec;
            if (c == null || !encoding) {
                lastSent = -1;
                return;
            }
            long sent = hub.sentTotal(), enc = encodedBytes.get();
            if (lastSent >= 0 && sent >= lastSent) {
                long linkBps = (sent - lastSent) * 8;
                long videoBps = (enc - lastEncoded) * 8;
                linkRate = linkRate == 0 ? linkBps : (linkRate * 2 + linkBps) / 3;
                if (!usbMode) {
                    // 블루투스: 데이터가 밀리면(링크가 꽉 참) 실제 전송 속도 아래로 낮추고, 여유가 있으면 조금씩 올림
                    long pend = hub.pendingBytes();
                    int target;
                    if (pend > maxPendingBytes() / 2) {
                        long cap = linkRate > 0 ? (long) (linkRate * 0.7) : currentBitrate / 2;
                        target = (int) Math.max(30_000, Math.min(currentBitrate * 0.75, cap));
                    } else {
                        target = (int) Math.min(profileBitrate, currentBitrate * 1.15);
                    }
                    if (Math.abs(target - currentBitrate) > currentBitrate * 0.15) {
                        currentBitrate = target;
                        Bundle b = new Bundle();
                        b.putInt(MediaCodec.PARAMETER_KEY_VIDEO_BITRATE, target);
                        try {
                            c.setParameters(b);
                        } catch (IllegalStateException ignored) {
                        }
                    }
                }
                if (++tick % 2 == 0) {
                    hub.send(Proto.STATS, Proto.utf8((usbMode ? "USB" : "블루투스") + " " + (linkRate / 8 / 1024) + "KB/s · 영상 "
                            + (videoBps / 1000) + "kbps(목표 " + (currentBitrate / 1000) + ") · " + frameW + "×" + frameH
                            + " · 보낸 프레임 " + framesOut.get()));
                }
            }
            lastSent = sent;
            lastEncoded = enc;
            main.postDelayed(this, 1000);
        }
    };

    /** 이만큼 넘게 밀리면 프레임을 버림 (블루투스는 약 1초 분량) */
    private long maxPendingBytes() {
        if (usbMode) return 4_000_000L;
        long perSec = Math.max(currentBitrate / 8, linkRate / 8);
        return Math.max(12_000, perSec);
    }

    private static int[] fit(int dw, int dh, int longEdge) {
        float scale = Math.min(1f, longEdge / (float) Math.max(dw, dh));
        int w = Math.max(16, Math.round(dw * scale / 16f) * 16);
        int h = Math.max(16, Math.round(dh * scale / 16f) * 16);
        return new int[]{w, h};
    }

    private MediaCodec createEncoder(String name, int w, int h, int bitrate, int fps, boolean usb, boolean tuned) {
        MediaCodec c = null;
        try {
            c = MediaCodec.createByCodecName(name);
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
            if (tuned) {
                f.setInteger(MediaFormat.KEY_PRIORITY, 0);
                if (Build.VERSION.SDK_INT >= 29) {
                    f.setFloat(MediaFormat.KEY_MAX_FPS_TO_ENCODER, fps);
                    f.setInteger(MediaFormat.KEY_MAX_B_FRAMES, 0);
                }
                if (caps.getEncoderCapabilities().isBitrateModeSupported(MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR)) {
                    f.setInteger(MediaFormat.KEY_BITRATE_MODE, MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR);
                }
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
        main.removeCallbacks(statsTick);
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

    private void drainLoop(MediaCodec c, int w, int h) {
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
            framesOut.incrementAndGet();
            encodedBytes.addAndGet(data.length);
            boolean key = (info.flags & MediaCodec.BUFFER_FLAG_KEY_FRAME) != 0;
            long pend = hub.pendingBytes();
            long limit = maxPendingBytes();
            // 전송이 밀리면 키프레임까지 버려서 지연이 쌓이지 않게 함. 아주 많이 밀리면 키프레임도 버림
            if ((!key && (needKey || pend > limit)) || (key && pend > limit * 3)) {
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

package com.shwo.qpbridge;

import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.os.Build;
import android.view.Surface;

import java.nio.ByteBuffer;
import android.media.MediaCodecList;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/** 휴대폰에서 온 H.264 를 SurfaceView 에 바로 그리는 디코더. onConfig/onFrame 은 아무 스레드에서나 호출 가능. */
final class VideoDecoder {

    interface Callback {
        void onVideoSize(int w, int h);

        void onFirstFrame();

        void requestKeyframe();

        void onError(String message);
    }

    private final Callback cb;
    private final LinkedBlockingQueue<byte[]> queue = new LinkedBlockingQueue<>();
    private final Object lock = new Object();
    private Surface surface;
    private int width, height;
    private String mime = MediaFormat.MIMETYPE_VIDEO_AVC;
    private byte[] csd;
    private Thread thread;
    private volatile boolean running;
    private volatile MediaCodec active;
    private volatile boolean gotKey;
    private volatile long lastKeyRequest;

    // 진단용 카운터
    final AtomicInteger configs = new AtomicInteger(), received = new AtomicInteger(), rendered = new AtomicInteger(),
            errors = new AtomicInteger();
    volatile String decoderName = "-";

    String codecLabel() {
        return MediaFormat.MIMETYPE_VIDEO_HEVC.equals(mime) ? "H.265" : "H.264";
    }

    VideoDecoder(Callback cb) {
        this.cb = cb;
    }

    void setSurface(Surface s) {
        synchronized (lock) {
            surface = s;
            restartLocked();
        }
    }

    /** 연결이 끊기면 호출 */
    void reset() {
        synchronized (lock) {
            stopLocked();
            csd = null;
        }
    }

    void onConfig(byte[] payload) {
        if (payload.length < 10) return;
        ByteBuffer b = ByteBuffer.wrap(payload);
        int w = b.getInt(), h = b.getInt();
        String m = b.get() == Proto.CODEC_HEVC ? MediaFormat.MIMETYPE_VIDEO_HEVC : MediaFormat.MIMETYPE_VIDEO_AVC;
        byte[] c = Arrays.copyOfRange(payload, 9, payload.length);
        configs.incrementAndGet();
        synchronized (lock) {
            if (running && w == width && h == height && m.equals(mime) && Arrays.equals(c, csd)) return; // 같은 설정 재전송
            mime = m;
            width = w;
            height = h;
            csd = c;
            restartLocked();
        }
        cb.onVideoSize(w, h);
    }

    void onFrame(byte[] payload) {
        received.incrementAndGet();
        if (!running || payload.length < 2) return;
        boolean key = (payload[0] & 1) != 0;
        if (!gotKey && !key) {
            askKey();
            return;
        }
        gotKey = true;
        if (queue.size() > 30) { // 디코더가 밀림 → 버리고 키프레임부터 다시
            queue.clear();
            gotKey = false;
            askKey();
            return;
        }
        queue.offer(payload);
    }

    private void askKey() {
        long now = System.currentTimeMillis();
        if (now - lastKeyRequest < 1500) return;
        lastKeyRequest = now;
        cb.requestKeyframe();
    }

    private void restartLocked() {
        stopLocked();
        if (surface == null || !surface.isValid() || csd == null) return;
        // 디코더마다 (조정된 설정 → 기본 설정) 순서로 시도. 저지연 옵션을 거부하는 디코더도 있음
        MediaCodec codec = null;
        for (String name : decoderNames(mime)) {
            if (badDecoders.contains(name)) continue;
            codec = createDecoder(name, true);
            if (codec == null) codec = createDecoder(name, false);
            if (codec != null) {
                decoderName = name;
                break;
            }
        }
        if (codec == null) {
            badDecoders.clear();
            cb.onError("이 기기에서 영상 디코더를 시작할 수 없어요.");
            return;
        }
        queue.clear();
        gotKey = false;
        receivedAtStart = received.get();
        renderedAtStart = rendered.get();
        active = codec;
        running = true;
        byte[] config = csd;
        MediaCodec c = codec;
        thread = new Thread(() -> loop(c, config), "decoder");
        thread.start();
        lastKeyRequest = 0;
        askKey();
    }

    private final List<String> badDecoders = new ArrayList<>();
    private int receivedAtStart, renderedAtStart;

    /** 프레임은 들어오는데 화면에 하나도 안 그려지면 다음 디코더로 바꿈. 바꿨으면 true */
    boolean skipIfStalled() {
        synchronized (lock) {
            if (!running || rendered.get() != renderedAtStart || received.get() - receivedAtStart < 40) return false;
            cb.onError("디코더 " + decoderName + " 가 화면을 그리지 않아요 → 다른 디코더로 바꿉니다");
            badDecoders.add(decoderName);
            restartLocked();
            return true;
        }
    }

    /** 이 기기가 H.265 를 풀 수 있는지 */
    static boolean supportsHevc() {
        return !decoderNames(MediaFormat.MIMETYPE_VIDEO_HEVC).isEmpty();
    }

    private static List<String> decoderNames(String mime) {
        List<String> hw = new ArrayList<>(), sw = new ArrayList<>();
        for (MediaCodecInfo info : new MediaCodecList(MediaCodecList.REGULAR_CODECS).getCodecInfos()) {
            if (info.isEncoder()) continue;
            boolean avc = false;
            for (String t : info.getSupportedTypes()) if (t.equalsIgnoreCase(mime)) avc = true;
            if (!avc) continue;
            String n = info.getName();
            if (n.endsWith(".secure")) continue;
            boolean soft = Build.VERSION.SDK_INT >= 29 ? info.isSoftwareOnly()
                    : n.startsWith("OMX.google.") || n.startsWith("c2.android.");
            (soft ? sw : hw).add(n);
        }
        hw.addAll(sw);
        return hw;
    }

    private MediaCodec createDecoder(String name, boolean tuned) {
        MediaCodec c = null;
        try {
            c = MediaCodec.createByCodecName(name);
            MediaFormat f = MediaFormat.createVideoFormat(mime, width, height);
            f.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, Math.max(512 * 1024, width * height * 2));
            if (tuned) {
                f.setInteger(MediaFormat.KEY_PRIORITY, 0);
                if (Build.VERSION.SDK_INT >= 30 && c.getCodecInfo().getCapabilitiesForType(mime)
                        .isFeatureSupported(MediaCodecInfo.CodecCapabilities.FEATURE_LowLatency)) {
                    f.setInteger(MediaFormat.KEY_LOW_LATENCY, 1);
                }
            }
            c.configure(f, surface, null, 0);
            c.start();
            return c;
        } catch (Exception e) {
            if (c != null) c.release();
            return null;
        }
    }

    private void stopLocked() {
        running = false;
        active = null;
        if (thread != null) {
            thread.interrupt();
            try {
                thread.join(800);
            } catch (InterruptedException ignored) {
            }
        }
        thread = null;
        queue.clear();
    }

    private void loop(MediaCodec c, byte[] config) {
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        long pts = 0;
        boolean first = true;
        try {
            // SPS/PPS 먼저
            int in = -1;
            while (running && active == c && in < 0) in = c.dequeueInputBuffer(20_000);
            if (in >= 0) {
                ByteBuffer ib = c.getInputBuffer(in);
                ib.clear();
                ib.put(config);
                c.queueInputBuffer(in, 0, config.length, 0, MediaCodec.BUFFER_FLAG_CODEC_CONFIG);
            }
            while (running && active == c) {
                byte[] f = queue.poll(5, TimeUnit.MILLISECONDS);
                if (f != null) {
                    int idx = c.dequeueInputBuffer(30_000);
                    if (idx >= 0) {
                        ByteBuffer ib = c.getInputBuffer(idx);
                        ib.clear();
                        if (f.length - 1 <= ib.capacity()) {
                            ib.put(f, 1, f.length - 1);
                            pts += 33_333;
                            c.queueInputBuffer(idx, 0, f.length - 1, pts, 0);
                        } else {
                            c.queueInputBuffer(idx, 0, 0, pts, 0);
                        }
                    }
                }
                int out;
                while ((out = c.dequeueOutputBuffer(info, 0)) >= 0 || out == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED
                        || out == MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED) {
                    if (out >= 0) {
                        c.releaseOutputBuffer(out, true);
                        rendered.incrementAndGet();
                        if (first) {
                            first = false;
                            cb.onFirstFrame();
                        }
                    }
                }
            }
        } catch (InterruptedException ignored) {
        } catch (Exception e) {
            // 디코더 오류 → 다음 설정(SPS/PPS)이 오면 새로 만들도록 표시하고 키프레임 요청
            errors.incrementAndGet();
            if (active == c) {
                // 같은 디코더가 계속 실패하면 다음 디코더로
                if (errors.get() % 3 == 0) badDecoders.add(decoderName);
                cb.onError("영상 디코더 오류 (" + decoderName + "): " + e.getClass().getSimpleName());
                running = false;
                active = null;
                gotKey = false;
                lastKeyRequest = 0;
                askKey();
            }
        } finally {
            try {
                c.stop();
            } catch (Exception ignored) {
            }
            c.release();
        }
    }
}

package com.shwo.qpbridge;

import android.media.MediaCodec;
import android.media.MediaFormat;
import android.os.Build;
import android.view.Surface;

import java.nio.ByteBuffer;
import java.util.Arrays;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/** 휴대폰에서 온 H.264 를 SurfaceView 에 바로 그리는 디코더. onConfig/onFrame 은 아무 스레드에서나 호출 가능. */
final class VideoDecoder {

    interface Callback {
        void onVideoSize(int w, int h);

        void onFirstFrame();

        void requestKeyframe();
    }

    private final Callback cb;
    private final LinkedBlockingQueue<byte[]> queue = new LinkedBlockingQueue<>();
    private final Object lock = new Object();
    private Surface surface;
    private int width, height;
    private byte[] csd;
    private Thread thread;
    private volatile boolean running;
    private volatile MediaCodec active;
    private volatile boolean gotKey;
    private volatile long lastKeyRequest;

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
        if (payload.length < 9) return;
        ByteBuffer b = ByteBuffer.wrap(payload);
        int w = b.getInt(), h = b.getInt();
        byte[] c = Arrays.copyOfRange(payload, 8, payload.length);
        synchronized (lock) {
            if (running && w == width && h == height && Arrays.equals(c, csd)) return; // 같은 설정 재전송
            width = w;
            height = h;
            csd = c;
            restartLocked();
        }
        cb.onVideoSize(w, h);
    }

    void onFrame(byte[] payload) {
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
        MediaCodec codec;
        try {
            codec = MediaCodec.createDecoderByType(MediaFormat.MIMETYPE_VIDEO_AVC);
            MediaFormat f = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height);
            if (Build.VERSION.SDK_INT >= 30) f.setInteger(MediaFormat.KEY_LOW_LATENCY, 1);
            f.setInteger(MediaFormat.KEY_PRIORITY, 0);
            codec.configure(f, surface, null, 0);
            codec.start();
        } catch (Exception e) {
            return;
        }
        queue.clear();
        gotKey = false;
        active = codec;
        running = true;
        byte[] config = csd;
        MediaCodec c = codec;
        thread = new Thread(() -> loop(c, config), "decoder");
        thread.start();
        lastKeyRequest = 0;
        askKey();
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
            if (active == c) {
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

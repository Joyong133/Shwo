package com.shwo.qpbridge;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import android.media.MediaCodec;
import android.media.MediaFormat;

import java.nio.ByteBuffer;
import java.util.Arrays;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/** 휴대폰에서 온 AAC 소리를 풀어서 퀘스트 스피커로 재생. onConfig/onFrame 은 아무 스레드에서나 호출 가능. */
final class AudioPlayer {

    /** 이보다 많이 쌓이면(약 0.4초) 오래된 것부터 버려서 소리가 점점 늦어지지 않게 함 */
    private static final int MAX_QUEUE = 20;

    private final LinkedBlockingQueue<byte[]> queue = new LinkedBlockingQueue<>();
    private final Object lock = new Object();
    private Thread thread;
    private volatile boolean running;
    private int sampleRate, channels;
    private byte[] asc;
    private volatile boolean muted;
    private volatile AudioTrack track;
    final AtomicInteger played = new AtomicInteger(), dropped = new AtomicInteger();

    void onConfig(byte[] p) {
        if (p.length < 6) return;
        ByteBuffer b = ByteBuffer.wrap(p);
        int sr = b.getInt();
        int ch = b.get();
        byte[] c = Arrays.copyOfRange(p, 5, p.length);
        synchronized (lock) {
            if (running && sr == sampleRate && ch == channels && Arrays.equals(c, asc)) return;
            sampleRate = sr;
            channels = ch;
            asc = c;
            restartLocked();
        }
    }

    void onFrame(byte[] p) {
        if (!running) return;
        while (queue.size() >= MAX_QUEUE) {
            queue.poll();
            dropped.incrementAndGet();
        }
        queue.offer(p);
    }

    void setMuted(boolean m) {
        muted = m;
        AudioTrack t = track;
        if (t != null) t.setVolume(m ? 0f : 1f);
        if (m) queue.clear();
    }

    boolean isActive() {
        return running;
    }

    void reset() {
        synchronized (lock) {
            stopLocked();
            asc = null;
        }
    }

    private void restartLocked() {
        stopLocked();
        MediaCodec dec;
        AudioTrack t;
        try {
            dec = MediaCodec.createDecoderByType(MediaFormat.MIMETYPE_AUDIO_AAC);
            MediaFormat f = MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_AAC, sampleRate, channels);
            f.setByteBuffer("csd-0", ByteBuffer.wrap(asc));
            dec.configure(f, null, null, 0);
            dec.start();
        } catch (Exception e) {
            return;
        }
        int mask = channels == 1 ? AudioFormat.CHANNEL_OUT_MONO : AudioFormat.CHANNEL_OUT_STEREO;
        int min = AudioTrack.getMinBufferSize(sampleRate, mask, AudioFormat.ENCODING_PCM_16BIT);
        try {
            t = new AudioTrack.Builder()
                    .setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build())
                    .setAudioFormat(new AudioFormat.Builder()
                            .setSampleRate(sampleRate)
                            .setChannelMask(mask)
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .build())
                    .setBufferSizeInBytes(Math.max(min * 2, sampleRate * channels * 2 / 5)) // 약 0.2초
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build();
            t.setVolume(muted ? 0f : 1f);
            t.play();
        } catch (Exception e) {
            dec.release();
            return;
        }
        track = t;
        queue.clear();
        running = true;
        MediaCodec d = dec;
        thread = new Thread(() -> loop(d, t), "audio-play");
        thread.start();
    }

    private void stopLocked() {
        running = false;
        if (thread != null) {
            thread.interrupt();
            try {
                thread.join(800);
            } catch (InterruptedException ignored) {
            }
        }
        thread = null;
        track = null;
        queue.clear();
    }

    private void loop(MediaCodec dec, AudioTrack t) {
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        long pts = 0;
        byte[] pcm = new byte[0];
        try {
            while (running) {
                byte[] f = queue.poll(20, TimeUnit.MILLISECONDS);
                if (f != null) {
                    int in = dec.dequeueInputBuffer(20_000);
                    if (in >= 0) {
                        ByteBuffer ib = dec.getInputBuffer(in);
                        ib.clear();
                        ib.put(f);
                        pts += 21_333;
                        dec.queueInputBuffer(in, 0, f.length, pts, 0);
                    }
                }
                int out;
                while ((out = dec.dequeueOutputBuffer(info, 0)) >= 0 || out == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    if (out < 0) continue;
                    ByteBuffer ob = dec.getOutputBuffer(out);
                    if (ob != null && info.size > 0) {
                        if (pcm.length < info.size) pcm = new byte[info.size];
                        ob.position(info.offset);
                        ob.get(pcm, 0, info.size);
                        t.write(pcm, 0, info.size);
                        played.incrementAndGet();
                    }
                    dec.releaseOutputBuffer(out, false);
                }
            }
        } catch (InterruptedException ignored) {
        } catch (Exception e) {
            running = false;
        } finally {
            try { dec.stop(); } catch (Exception ignored) {}
            dec.release();
            try { t.stop(); } catch (Exception ignored) {}
            t.release();
        }
    }
}

package com.shwo.qpbridge;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioPlaybackCaptureConfiguration;
import android.media.AudioRecord;
import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.media.projection.MediaProjection;
import android.os.Build;

import java.nio.ByteBuffer;

/**
 * 휴대폰에서 재생되는 소리(앱 소리, 마이크 아님)를 받아 AAC 로 압축해서 퀘스트로 보냄. Android 10 이상.
 * 소리가 없을 때(무음)는 보내지 않아서 블루투스 대역폭을 아낌.
 */
@SuppressLint("MissingPermission")
final class AudioCapture {

    static final int SAMPLE_RATE = 48000;
    static final int CHANNELS = 2;
    /** AAC 한 프레임 = 1024 샘플 × 2채널 × 2바이트 */
    private static final int FRAME_BYTES = 1024 * CHANNELS * 2;

    static boolean permitted(Context c) {
        return Build.VERSION.SDK_INT >= 29
                && c.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private final Hub hub;
    private final MediaProjection projection;
    private Thread thread;
    private volatile boolean running;
    private volatile boolean enabled = true;
    private volatile int wantedBitrate = 128_000;
    private volatile boolean resendConfig;
    private volatile boolean sending;

    AudioCapture(Hub hub, MediaProjection projection) {
        this.hub = hub;
        this.projection = projection;
    }

    void setEnabled(boolean on) {
        enabled = on;
    }

    boolean isSending() {
        return sending;
    }

    /** 일반 블루투스는 느리니 소리 데이터를 줄임 */
    void setLinkKind(int kind) {
        wantedBitrate = kind == Hub.KIND_BLE ? 48_000 : kind == Hub.KIND_FAST ? 96_000 : 128_000;
        resendConfig = true;
    }

    void resendConfig() {
        resendConfig = true;
    }

    void start() {
        if (Build.VERSION.SDK_INT < 29) return;
        running = true;
        thread = new Thread(this::run, "audio-capture");
        thread.start();
    }

    void stop() {
        running = false;
        if (thread != null) {
            thread.interrupt();
            try {
                thread.join(800);
            } catch (InterruptedException ignored) {
            }
        }
        thread = null;
        sending = false;
    }

    private void run() {
        if (Build.VERSION.SDK_INT < 29) return;
        AudioRecord rec = null;
        MediaCodec aac = null;
        try {
            AudioPlaybackCaptureConfiguration cfg = new AudioPlaybackCaptureConfiguration.Builder(projection)
                    .addMatchingUsage(AudioAttributes.USAGE_MEDIA)
                    .addMatchingUsage(AudioAttributes.USAGE_GAME)
                    .addMatchingUsage(AudioAttributes.USAGE_UNKNOWN)
                    .build();
            AudioFormat fmt = new AudioFormat.Builder()
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setSampleRate(SAMPLE_RATE)
                    .setChannelMask(AudioFormat.CHANNEL_IN_STEREO)
                    .build();
            int minBuf = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT);
            rec = new AudioRecord.Builder()
                    .setAudioFormat(fmt)
                    .setBufferSizeInBytes(Math.max(minBuf, FRAME_BYTES) * 4)
                    .setAudioPlaybackCaptureConfig(cfg)
                    .build();
            if (rec.getState() != AudioRecord.STATE_INITIALIZED) {
                hub.log("소리 캡처를 시작할 수 없어요.");
                return;
            }
            rec.startRecording();
        } catch (Exception e) {
            hub.log("소리 캡처를 시작할 수 없어요 (" + e.getClass().getSimpleName() + ").");
            if (rec != null) rec.release();
            return;
        }
        hub.log("소리 전달 준비 완료 (휴대폰에서 재생되는 앱 소리).");

        byte[] pcm = new byte[FRAME_BYTES];
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        int bitrate = 0;
        byte[] config = null;
        long samples = 0;
        int silentFrames = 0;
        Link lastLink = null;
        try {
            while (running) {
                int n = rec.read(pcm, 0, pcm.length);
                if (n <= 0) continue;

                // 비트레이트가 바뀌면(연결 종류 변경) 인코더를 새로 만듦
                if (aac == null || bitrate != wantedBitrate) {
                    if (aac != null) {
                        try { aac.stop(); } catch (Exception ignored) {}
                        aac.release();
                    }
                    bitrate = wantedBitrate;
                    aac = createEncoder(bitrate);
                    config = null;
                    if (aac == null) {
                        hub.log("이 휴대폰의 AAC 인코더를 시작할 수 없어 소리를 보낼 수 없어요.");
                        return;
                    }
                }

                silentFrames = isSilent(pcm, n) ? silentFrames + 1 : 0;
                Link link = hub.active();
                boolean send = enabled && link != null && silentFrames < 24; // 무음 0.5초 지나면 멈춤
                sending = enabled && link != null;
                if (link != lastLink || resendConfig) {
                    lastLink = link;
                    resendConfig = false;
                    if (config != null && link != null) hub.send(Proto.AUDIO_CONFIG, configPayload(config));
                }
                if (!send) continue;

                int in = aac.dequeueInputBuffer(10_000);
                if (in >= 0) {
                    ByteBuffer ib = aac.getInputBuffer(in);
                    ib.clear();
                    ib.put(pcm, 0, n);
                    aac.queueInputBuffer(in, 0, n, samples * 1_000_000L / SAMPLE_RATE, 0);
                    samples += n / (CHANNELS * 2);
                }
                int out;
                while ((out = aac.dequeueOutputBuffer(info, 0)) >= 0) {
                    byte[] data = new byte[info.size];
                    ByteBuffer ob = aac.getOutputBuffer(out);
                    if (ob != null && info.size > 0) {
                        ob.position(info.offset);
                        ob.get(data, 0, info.size);
                    }
                    aac.releaseOutputBuffer(out, false);
                    if (info.size == 0) continue;
                    if ((info.flags & MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0) {
                        config = data;
                        hub.send(Proto.AUDIO_CONFIG, configPayload(config));
                    } else if (config != null) {
                        hub.send(Proto.AUDIO_FRAME, data);
                    }
                }
            }
        } catch (Exception e) {
            if (running) hub.log("소리 전달 오류 (" + e.getClass().getSimpleName() + "). 소리를 멈춥니다.");
        } finally {
            sending = false;
            try { rec.stop(); } catch (Exception ignored) {}
            rec.release();
            if (aac != null) {
                try { aac.stop(); } catch (Exception ignored) {}
                aac.release();
            }
        }
    }

    private static MediaCodec createEncoder(int bitrate) {
        MediaCodec c = null;
        try {
            c = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC);
            MediaFormat f = MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_AAC, SAMPLE_RATE, CHANNELS);
            f.setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC);
            f.setInteger(MediaFormat.KEY_BIT_RATE, bitrate);
            f.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, FRAME_BYTES * 2);
            c.configure(f, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
            c.start();
            return c;
        } catch (Exception e) {
            if (c != null) c.release();
            return null;
        }
    }

    static byte[] configPayload(byte[] asc) {
        return ByteBuffer.allocate(5 + asc.length).putInt(SAMPLE_RATE).put((byte) CHANNELS).put(asc).array();
    }

    /** 거의 소리가 없으면 true (16비트 PCM) */
    static boolean isSilent(byte[] pcm, int n) {
        for (int i = 0; i + 1 < n; i += 2) {
            int v = (short) ((pcm[i] & 0xFF) | (pcm[i + 1] << 8));
            if (v > 24 || v < -24) return false;
        }
        return true;
    }
}

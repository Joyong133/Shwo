package com.shwo.qpbridge;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 퀘스트(보는 쪽) ↔ 휴대폰(화면을 보내는 쪽) 프로토콜.
 *
 * 메시지 = [종류 1바이트][내용]
 *  - 블루투스: 메시지를 [플래그 1바이트][데이터] 패킷으로 잘라 보냄 (플래그 bit0 = 다음 패킷 이어짐)
 *  - USB: [종류 1][길이 4 (big endian)][내용] 스트림
 */
public final class Proto {
    private Proto() {}

    // ── BLE GATT ──
    public static final UUID SERVICE = UUID.fromString("7a3e0001-8c5b-4f1e-9d2a-51c0b7e4a9f3");
    public static final UUID RX = UUID.fromString("7a3e0002-8c5b-4f1e-9d2a-51c0b7e4a9f3"); // 퀘스트 → 폰 (Write)
    public static final UUID TX = UUID.fromString("7a3e0003-8c5b-4f1e-9d2a-51c0b7e4a9f3"); // 폰 → 퀘스트 (Notify)
    public static final UUID CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    public static final int MANUFACTURER_ID = 0xFFFF;
    public static final byte[] MAGIC = {'Q', 'P'};

    // ── USB 액세서리(AOA) 식별 문자열 ──
    public static final String AOA_MANUFACTURER = "Shwo";
    public static final String AOA_MODEL = "QPBridge";

    // ── 메시지 종류 ──
    public static final byte HELLO = 0x01;            // 기기 이름 (UTF-8)
    public static final byte PING = 0x02;             // long
    public static final byte PONG = 0x03;             // long
    public static final byte STATUS = 0x04;           // 폰 상태 안내 (UTF-8)
    public static final byte VIDEO_CONFIG = 0x10;     // int 폭, int 높이, H.264 SPS/PPS
    public static final byte VIDEO_FRAME = 0x11;      // byte 플래그(bit0 키프레임), H.264 데이터
    public static final byte REQUEST_KEYFRAME = 0x12; // (없음)
    public static final byte SET_QUALITY = 0x13;      // byte 0~2
    public static final byte GESTURE = 0x20;          // int 지속시간(ms), short 점 개수, (u16 x, u16 y)* 0~65535 정규화
    public static final byte GLOBAL = 0x21;           // byte AccessibilityService.GLOBAL_ACTION_*
    public static final byte TEXT = 0x22;             // UTF-8 (입력칸에 이어 쓰기)
    public static final byte BACKSPACE = 0x23;        // (없음)

    public static final int MAX_MESSAGE = 4 * 1024 * 1024;

    public static byte[] utf8(String s) {
        return (s == null ? "" : s).getBytes(StandardCharsets.UTF_8);
    }

    public static String str(byte[] b) {
        return new String(b, StandardCharsets.UTF_8);
    }

    public static byte[] longBytes(long v) {
        return ByteBuffer.allocate(8).putLong(v).array();
    }

    public static long readLong(byte[] b) {
        return b.length >= 8 ? ByteBuffer.wrap(b).getLong() : 0;
    }

    // ── 블루투스 패킷 분할/조립 ──

    public static List<byte[]> split(byte type, byte[] payload, int maxPacket) {
        int total = payload.length + 1;
        int chunk = Math.max(1, maxPacket - 1);
        List<byte[]> out = new ArrayList<>(total / chunk + 1);
        int off = 0; // 메시지(종류+내용) 기준 위치
        do {
            int n = Math.min(chunk, total - off);
            byte[] p = new byte[n + 1];
            p[0] = (byte) (off + n < total ? 1 : 0);
            int dst = 1, src = off, left = n;
            if (src == 0) {
                p[dst++] = type;
                src = 1;
                left--;
            }
            System.arraycopy(payload, src - 1, p, dst, left);
            out.add(p);
            off += n;
        } while (off < total);
        return out;
    }

    public static final class Reassembler {
        private final ByteArrayOutputStream buf = new ByteArrayOutputStream();
        private boolean overflow;

        /** 완성된 메시지([종류][내용])를 돌려주고, 이어지는 중이거나 너무 크면 null */
        public byte[] feed(byte[] packet) {
            if (packet == null || packet.length == 0) return null;
            if (!overflow) {
                buf.write(packet, 1, packet.length - 1);
                if (buf.size() > MAX_MESSAGE) {
                    overflow = true;
                    buf.reset();
                }
            }
            if ((packet[0] & 1) != 0) return null;
            byte[] m = overflow ? null : buf.toByteArray();
            reset();
            return m;
        }

        public void reset() {
            buf.reset();
            overflow = false;
        }
    }

    // ── 광고 데이터(4자리 연결 코드) ──

    public static byte[] advertPayload(String code) {
        byte[] c = code.getBytes(StandardCharsets.US_ASCII);
        byte[] out = new byte[MAGIC.length + c.length];
        System.arraycopy(MAGIC, 0, out, 0, MAGIC.length);
        System.arraycopy(c, 0, out, MAGIC.length, c.length);
        return out;
    }

    public static String parseAdvert(byte[] data) {
        if (data == null || data.length < MAGIC.length || data[0] != MAGIC[0] || data[1] != MAGIC[1]) return null;
        return new String(data, MAGIC.length, data.length - MAGIC.length, StandardCharsets.US_ASCII);
    }

    // ── 제스처 ──

    /** xs, ys 는 0~1 정규화 좌표 */
    public static byte[] gesture(int durationMs, float[] xs, float[] ys, int n) {
        ByteBuffer b = ByteBuffer.allocate(4 + 2 + n * 4);
        b.putInt(durationMs).putShort((short) n);
        for (int i = 0; i < n; i++) {
            b.putShort((short) Math.round(clamp01(xs[i]) * 65535));
            b.putShort((short) Math.round(clamp01(ys[i]) * 65535));
        }
        return b.array();
    }

    private static float clamp01(float v) {
        return v < 0 ? 0 : (v > 1 ? 1 : v);
    }
}

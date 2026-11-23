package com.shwo.qpbridge;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * BLE 링크의 프로토콜 정의.
 *
 * GATT 구조 (휴대폰 = GATT 서버, 퀘스트 = GATT 클라이언트가 기본):
 *   서비스 SERVICE
 *     RX: 클라이언트 → 서버 (Write)
 *     TX: 서버 → 클라이언트 (Notify)
 *
 * 패킷 = [플래그 1바이트][데이터]. 플래그 bit0 = 1 이면 다음 패킷이 이어짐.
 * 메시지 = [종류 1글자][본문 UTF-8].
 */
public final class Proto {
    private Proto() {}

    public static final UUID SERVICE = UUID.fromString("7a3e0001-8c5b-4f1e-9d2a-51c0b7e4a9f3");
    public static final UUID RX = UUID.fromString("7a3e0002-8c5b-4f1e-9d2a-51c0b7e4a9f3");
    public static final UUID TX = UUID.fromString("7a3e0003-8c5b-4f1e-9d2a-51c0b7e4a9f3");
    public static final UUID CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    /** 광고의 제조사 데이터에 쓰는 ID (0xFFFF = 테스트/미등록용) */
    public static final int MANUFACTURER_ID = 0xFFFF;
    public static final byte[] MAGIC = {'Q', 'P'};

    /** 메시지 종류 */
    public static final char TEXT = 'T';
    public static final char HELLO = 'H';
    public static final char PING = 'P';
    public static final char PONG = 'O';

    public static final int MAX_MESSAGE = 64 * 1024;

    public static byte[] encode(char type, String body) {
        return (type + (body == null ? "" : body)).getBytes(StandardCharsets.UTF_8);
    }

    public static List<byte[]> split(byte[] msg, int maxPacket) {
        int payload = Math.max(1, maxPacket - 1);
        List<byte[]> out = new ArrayList<>();
        int off = 0;
        do {
            int n = Math.min(payload, msg.length - off);
            byte[] p = new byte[n + 1];
            p[0] = (byte) (off + n < msg.length ? 1 : 0);
            System.arraycopy(msg, off, p, 1, n);
            out.add(p);
            off += n;
        } while (off < msg.length);
        return out;
    }

    /** 광고 데이터에 넣는 4자리 연결 코드 */
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

    public static final class Reassembler {
        private final ByteArrayOutputStream buf = new ByteArrayOutputStream();
        private boolean overflow;

        /** 완성된 메시지를 돌려주고, 아직 이어지는 중이거나 너무 큰 메시지면 null */
        public byte[] feed(byte[] packet) {
            if (packet == null || packet.length == 0) return null;
            if (!overflow) {
                buf.write(packet, 1, packet.length - 1);
                if (buf.size() > MAX_MESSAGE) {
                    overflow = true; // 끝날 때까지 버림
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
}

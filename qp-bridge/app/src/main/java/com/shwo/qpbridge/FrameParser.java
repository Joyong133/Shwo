package com.shwo.qpbridge;

import java.io.IOException;
import java.nio.ByteBuffer;

/** USB 스트림에서 [종류 1][길이 4][내용] 메시지를 잘라냄 (안드로이드 의존성 없음). */
public final class FrameParser {

    public interface Sink {
        void onFrame(byte type, byte[] payload);
    }

    private byte[] acc = new byte[256 * 1024];
    private int accLen;

    public static byte[] frame(byte type, byte[] payload) {
        byte[] f = new byte[5 + payload.length];
        f[0] = type;
        ByteBuffer.wrap(f, 1, 4).putInt(payload.length);
        System.arraycopy(payload, 0, f, 5, payload.length);
        return f;
    }

    public void feed(byte[] buf, int n, Sink sink) throws IOException {
        if (accLen + n > acc.length) {
            byte[] bigger = new byte[Math.max(acc.length * 2, accLen + n)];
            System.arraycopy(acc, 0, bigger, 0, accLen);
            acc = bigger;
        }
        System.arraycopy(buf, 0, acc, accLen, n);
        accLen += n;
        int pos = 0;
        while (accLen - pos >= 5) {
            int len = ByteBuffer.wrap(acc, pos + 1, 4).getInt();
            if (len < 0 || len > Proto.MAX_MESSAGE) throw new IOException("bad frame");
            if (accLen - pos < 5 + len) break;
            byte[] payload = new byte[len];
            System.arraycopy(acc, pos + 5, payload, 0, len);
            byte type = acc[pos];
            pos += 5 + len;
            sink.onFrame(type, payload);
        }
        if (pos > 0) {
            System.arraycopy(acc, pos, acc, 0, accLen - pos);
            accLen -= pos;
        }
    }
}

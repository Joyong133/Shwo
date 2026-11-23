package com.shwo.qpbridge;

import android.bluetooth.BluetoothSocket;
import android.content.Context;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * 블루투스 고속 채널 (BLE L2CAP 연결 지향 채널).
 * 일반 블루투스(GATT)보다 몇 배 빠름. GATT 연결 위에서 추가로 열리고, 안 되면 GATT 로 계속 동작.
 * 형식은 USB 와 같은 [종류][길이 4][내용] 스트림.
 */
public final class StreamLink extends Link {

    private final Outbox outbox = new Outbox();
    private volatile BluetoothSocket socket;
    private Thread reader, writer;

    public StreamLink(Context ctx) {
        super(ctx);
    }

    @Override
    public String label() {
        return "블루투스 고속";
    }

    @Override
    public void start() {}

    @Override
    public void stop() {
        close(null);
    }

    @Override
    public void disconnect() {
        close(null);
    }

    public boolean isOpen() {
        return socket != null;
    }

    /** 연결된 L2CAP 소켓을 넘겨받아 사용 시작 (아무 스레드) */
    public void attach(BluetoothSocket s) {
        main.post(() -> {
            close(null);
            socket = s;
            outbox.clear();
            pending.set(0);
            reader = new Thread(() -> readLoop(s), "l2cap-read");
            writer = new Thread(() -> writeLoop(s), "l2cap-write");
            reader.start();
            writer.start();
            setState(READY, "블루투스 고속으로 연결됨");
        });
    }

    private void close(String reason) {
        BluetoothSocket s = socket;
        if (s == null) return;
        socket = null;
        try {
            s.close();
        } catch (IOException ignored) {
        }
        if (reader != null) reader.interrupt();
        if (writer != null) writer.interrupt();
        outbox.clear();
        pending.set(0);
        if (reason != null) log(reason);
        setState(IDLE, "블루투스 고속 꺼짐");
    }

    private void fail(BluetoothSocket which, String reason) {
        main.post(() -> {
            if (socket == which) close(reason);
        });
    }

    private void readLoop(BluetoothSocket s) {
        byte[] buf = new byte[16384];
        FrameParser parser = new FrameParser();
        try {
            InputStream in = s.getInputStream();
            while (socket == s) {
                int n = in.read(buf);
                if (n < 0) throw new IOException("eof");
                if (n > 0) parser.feed(buf, n, this::deliver);
            }
        } catch (IOException e) {
            fail(s, "블루투스 고속 채널이 끊어졌어요. 일반 블루투스로 계속합니다.");
        }
    }

    private void writeLoop(BluetoothSocket s) {
        try {
            OutputStream out = s.getOutputStream();
            int max = s.getMaxTransmitPacketSize();
            if (max <= 0) max = 4096;
            while (socket == s) {
                byte[] f = outbox.take();
                for (int off = 0; off < f.length; off += max) out.write(f, off, Math.min(max, f.length - off));
                out.flush();
                pending.addAndGet(-f.length);
                sentTotal.addAndGet(f.length);
            }
        } catch (InterruptedException ignored) {
        } catch (IOException e) {
            fail(s, "블루투스 고속 전송 실패. 일반 블루투스로 계속합니다.");
        }
    }

    @Override
    public boolean send(byte type, byte[] payload) {
        if (socket == null || state != READY) return false;
        byte[] f = FrameParser.frame(type, payload);
        pending.addAndGet(f.length);
        outbox.put(f, !Proto.isBulk(type));
        return true;
    }
}

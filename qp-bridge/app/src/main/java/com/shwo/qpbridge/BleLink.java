package com.shwo.qpbridge;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.Context;

import java.util.ArrayDeque;
import java.util.List;

/** 블루투스 링크 공통: 패킷 큐(한 번에 하나씩 전송), 조립. 큐 조작은 메인 스레드에서만. */
public abstract class BleLink extends Link {

    protected final BluetoothAdapter adapter;
    protected volatile int mtu = 23;
    /** BLE 속성 값 최대 길이 */
    static final int MAX_ATTR_LEN = 512;

    private final ArrayDeque<byte[]> queue = new ArrayDeque<>();
    private final Proto.Reassembler reassembler = new Proto.Reassembler();
    private boolean sending;
    private int inFlight;
    private int startRetries;
    private int generation; // 연결이 바뀌면 증가 → 이전 연결용으로 예약된 패킷 무시
    private final Runnable watchdog = () -> {
        sending = false;
        pump();
    };

    protected BleLink(Context ctx) {
        super(ctx);
        BluetoothManager bm = (BluetoothManager) this.ctx.getSystemService(Context.BLUETOOTH_SERVICE);
        adapter = bm == null ? null : bm.getAdapter();
    }

    @Override
    public String label() {
        return "블루투스";
    }

    protected boolean bluetoothOn() {
        return adapter != null && adapter.isEnabled();
    }

    /** 패킷 하나 전송 시작 (메인 스레드). 실패하면 false */
    protected abstract boolean writePacket(byte[] packet);

    @Override
    public boolean send(byte type, byte[] payload) {
        if (state != READY) return false;
        if (payload.length + 1 > Proto.MAX_MESSAGE) return false;
        // 한 패킷은 MTU-3 이하이면서 512바이트 이하여야 함 (Android 13+ 는 512 초과 시 예외를 던짐)
        List<byte[]> packets = Proto.split(type, payload, Math.min(mtu - 3, MAX_ATTR_LEN));
        long size = 0;
        for (byte[] p : packets) size += p.length;
        pending.addAndGet(size);
        final long total = size;
        final int gen = generation;
        main.post(() -> {
            if (gen != generation || state != READY) {
                pending.addAndGet(-total);
                return;
            }
            queue.addAll(packets);
            pump();
        });
        return true;
    }

    private void pump() {
        if (sending || state != READY) return;
        byte[] p = queue.peekFirst();
        if (p == null) return;
        boolean ok;
        try {
            ok = writePacket(p);
        } catch (RuntimeException e) {
            // 어떤 예외든 앱이 멈추지 않게 하고 이 패킷은 버림
            queue.pollFirst();
            pending.addAndGet(-p.length);
            log("블루투스 전송 오류: " + e.getClass().getSimpleName() + " — 패킷을 건너뜁니다");
            main.post(this::pump);
            return;
        }
        if (ok) {
            queue.pollFirst();
            pending.addAndGet(-p.length);
            inFlight = p.length;
            sending = true;
            startRetries = 0;
            main.removeCallbacks(watchdog);
            main.postDelayed(watchdog, 2000);
        } else if (++startRetries <= 80) {
            main.postDelayed(this::pump, 10); // 블루투스 스택이 바쁨 → 잠시 후 재시도
        } else {
            startRetries = 0;
            queue.clear();
            pending.set(0);
            log("블루투스 전송이 멈췄어요. 보내려던 데이터를 버립니다.");
        }
    }

    protected void onPacketSent() {
        sentTotal.addAndGet(inFlight);
        inFlight = 0;
        main.removeCallbacks(watchdog);
        sending = false;
        pump();
    }

    protected void onPacketReceived(byte[] packet) {
        byte[] m = reassembler.feed(packet);
        if (m == null || m.length == 0) return;
        byte[] payload = new byte[m.length - 1];
        System.arraycopy(m, 1, payload, 0, payload.length);
        deliver(m[0], payload);
    }

    protected void resetTransfer() {
        generation++;
        main.removeCallbacks(watchdog);
        queue.clear();
        pending.set(0);
        sending = false;
        startRetries = 0;
        reassembler.reset();
        mtu = 23;
    }

    protected static String gattStatus(int status) {
        switch (status) {
            case 0: return "정상";
            case 8: return "응답 시간 초과(거리가 멀거나 간섭)";
            case 19: return "상대가 연결을 끊음";
            case 22: return "이 기기가 연결을 끊음";
            case 62: return "연결 수립 실패";
            case 133: return "일시적 블루투스 오류(133)";
            default: return "상태 코드 " + status;
        }
    }
}

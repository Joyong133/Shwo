package com.shwo.qpbridge;

import java.util.ArrayDeque;

/** 스트림(USB·고속 블루투스)용 보낼 프레임 줄. 급한 것 먼저. 여러 스레드에서 사용 가능. */
public final class Outbox {
    private final ArrayDeque<byte[]> high = new ArrayDeque<>(), low = new ArrayDeque<>();

    public synchronized void put(byte[] frame, boolean urgent) {
        (urgent ? high : low).add(frame);
        notifyAll();
    }

    public synchronized byte[] take() throws InterruptedException {
        while (high.isEmpty() && low.isEmpty()) wait();
        return high.isEmpty() ? low.poll() : high.poll();
    }

    public synchronized void clear() {
        high.clear();
        low.clear();
    }
}

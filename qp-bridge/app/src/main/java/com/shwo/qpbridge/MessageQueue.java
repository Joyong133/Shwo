package com.shwo.qpbridge;

import java.util.ArrayDeque;
import java.util.List;

/**
 * 블루투스 패킷 보낼 순서 (안드로이드 의존성 없음, 스레드 안전 X — 한 스레드에서만 사용).
 * 메시지 단위로 줄을 세우고, 지금 보내는 메시지가 끝나면 급한 메시지(소리·조작)를 먼저 꺼냄.
 * 한 메시지의 패킷들은 섞이지 않음 (받는 쪽이 순서대로 이어 붙이므로).
 */
public final class MessageQueue {
    private final ArrayDeque<List<byte[]>> high = new ArrayDeque<>(), low = new ArrayDeque<>();
    private List<byte[]> cur;
    private int idx;

    public void add(List<byte[]> packets, boolean urgent) {
        (urgent ? high : low).add(packets);
    }

    /** 다음에 보낼 패킷 (없으면 null) */
    public byte[] peek() {
        if (cur == null || idx >= cur.size()) {
            cur = high.isEmpty() ? low.poll() : high.poll();
            idx = 0;
            if (cur == null) return null;
        }
        return cur.get(idx);
    }

    /** peek() 한 패킷을 보냈음 */
    public void advance() {
        idx++;
    }

    public void clear() {
        high.clear();
        low.clear();
        cur = null;
        idx = 0;
    }
}

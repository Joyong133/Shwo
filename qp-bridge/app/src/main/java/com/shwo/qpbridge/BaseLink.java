package com.shwo.qpbridge;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;

import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.List;

/** 두 역할(중앙/주변기기)이 함께 쓰는 송수신 큐, 메시지 처리, 상태 관리. 모든 메서드는 메인 스레드에서 호출. */
public abstract class BaseLink {

    public static final int IDLE = 0;        // 아무것도 안 하는 중
    public static final int WAITING = 1;     // 광고 중(폰) 또는 검색 중(퀘스트)
    public static final int CONNECTING = 2;  // 연결됨, 준비 중
    public static final int READY = 3;       // 메시지 주고받기 가능

    public interface Listener {
        void onState(int state, String detail);
        void onLog(String line);
        void onMessage(char type, String body);
        void onPeers(List<CentralLink.Peer> peers);
    }

    protected final Context ctx;
    protected final Handler main = new Handler(Looper.getMainLooper());
    protected final BluetoothAdapter adapter;
    protected Listener listener;
    protected int state = IDLE;
    protected String stateDetail = "";
    protected int mtu = 23;

    private final ArrayDeque<byte[]> sendQueue = new ArrayDeque<>();
    private final Proto.Reassembler reassembler = new Proto.Reassembler();
    private boolean sending;
    private int startRetries;
    private final Runnable sendWatchdog = () -> {
        // 전송 완료 콜백이 오지 않으면 큐가 멈추지 않도록 다음 패킷으로 넘어감
        sending = false;
        pump();
    };

    protected BaseLink(Context ctx) {
        this.ctx = ctx.getApplicationContext();
        BluetoothManager bm = (BluetoothManager) this.ctx.getSystemService(Context.BLUETOOTH_SERVICE);
        this.adapter = bm == null ? null : bm.getAdapter();
    }

    public void setListener(Listener l) {
        listener = l;
        if (l != null) l.onState(state, stateDetail);
    }

    public int getState() {
        return state;
    }

    public abstract boolean isCentral();

    public abstract void start();

    /** 검색/광고와 연결을 모두 멈춤 */
    public abstract void stop();

    /** 현재 연결만 끊음 */
    public abstract void disconnect();

    /** 패킷 하나 전송 시작. 시작에 실패하면 false */
    protected abstract boolean writePacket(byte[] packet);

    public boolean send(char type, String body) {
        if (state != READY) {
            log("연결되어 있지 않아 보낼 수 없어요.");
            return false;
        }
        byte[] msg = Proto.encode(type, body);
        if (msg.length > Proto.MAX_MESSAGE) {
            log("메시지가 너무 길어요 (최대 64KB).");
            return false;
        }
        sendQueue.addAll(Proto.split(msg, mtu - 3));
        pump();
        return true;
    }

    public void sendPing() {
        send(Proto.PING, Long.toString(SystemClock.elapsedRealtime()));
    }

    private void pump() {
        if (sending || state != READY) return;
        byte[] p = sendQueue.peekFirst();
        if (p == null) return;
        boolean ok;
        try {
            ok = writePacket(p);
        } catch (SecurityException e) {
            ok = false;
        }
        if (ok) {
            sendQueue.pollFirst();
            sending = true;
            startRetries = 0;
            main.removeCallbacks(sendWatchdog);
            main.postDelayed(sendWatchdog, 3000);
        } else if (++startRetries <= 40) {
            main.postDelayed(this::pump, 25); // 블루투스 스택이 바쁨 → 잠시 후 재시도
        } else {
            startRetries = 0;
            sendQueue.clear();
            log("전송 실패: 블루투스가 응답하지 않아요.");
        }
    }

    protected void onPacketSent() {
        main.removeCallbacks(sendWatchdog);
        sending = false;
        pump();
    }

    protected void onPacketReceived(byte[] packet) {
        byte[] m = reassembler.feed(packet);
        if (m == null || m.length == 0) return;
        String s = new String(m, StandardCharsets.UTF_8);
        char type = s.charAt(0);
        String body = s.substring(1);
        if (type == Proto.PING) {
            send(Proto.PONG, body); // 자동 응답
            return;
        }
        if (listener != null) listener.onMessage(type, body);
    }

    protected void resetTransfer() {
        main.removeCallbacks(sendWatchdog);
        sendQueue.clear();
        sending = false;
        startRetries = 0;
        reassembler.reset();
        mtu = 23;
    }

    protected void setState(int s, String detail) {
        boolean becameReady = s == READY && state != READY;
        state = s;
        stateDetail = detail;
        if (listener != null) listener.onState(s, detail);
        if (becameReady) {
            send(Proto.HELLO, deviceName());
            pump();
        }
    }

    protected void log(String line) {
        if (listener != null) listener.onLog(line);
    }

    protected boolean bluetoothOn() {
        return adapter != null && adapter.isEnabled();
    }

    public static String deviceName() {
        String m = Build.MODEL == null ? "" : Build.MODEL;
        String b = Build.MANUFACTURER == null ? "" : Build.MANUFACTURER;
        if (m.toLowerCase(java.util.Locale.ROOT).startsWith(b.toLowerCase(java.util.Locale.ROOT))) return m;
        return b + " " + m;
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

package com.shwo.qpbridge;

import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;

import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicLong;

/** 연결 하나(블루투스 또는 USB). send() 는 아무 스레드에서나 호출 가능. */
public abstract class Link {

    public static final int IDLE = 0;       // 꺼짐
    public static final int WAITING = 1;    // 광고/검색/케이블 대기
    public static final int CONNECTING = 2; // 연결 준비 중
    public static final int READY = 3;      // 데이터 주고받기 가능

    public interface Callback {
        /** 메인 스레드 */
        void onLinkState(Link link);

        /** 아무 스레드 */
        void onLinkMessage(Link link, byte type, byte[] payload);

        /** 메인 스레드 */
        void onLinkLog(Link link, String line);

        /** 메인 스레드 (블루투스 검색 결과) */
        default void onPeers(List<BleCentralLink.Peer> peers) {}
    }

    protected final Context ctx;
    protected final Handler main = new Handler(Looper.getMainLooper());
    protected Callback cb;
    protected volatile int state = IDLE;
    protected volatile String detail = "";
    /** 아직 보내지 못한 바이트 수 (흐름 제어용) */
    protected final AtomicLong pending = new AtomicLong();
    /** 실제로 내보낸 누적 바이트 (전송 속도 측정용) */
    protected final AtomicLong sentTotal = new AtomicLong();

    protected Link(Context ctx) {
        this.ctx = ctx.getApplicationContext();
    }

    public void setCallback(Callback c) {
        cb = c;
    }

    public int getState() {
        return state;
    }

    public String getDetail() {
        return detail;
    }

    public long pendingBytes() {
        return pending.get();
    }

    public long sentTotal() {
        return sentTotal.get();
    }

    /** 화면 표시용 이름 */
    public abstract String label();

    public abstract void start();

    public abstract void stop();

    /** 현재 연결만 끊기 */
    public abstract void disconnect();

    public abstract boolean send(byte type, byte[] payload);

    protected void setState(int s, String d) {
        Runnable r = () -> {
            state = s;
            detail = d;
            if (cb != null) cb.onLinkState(this);
        };
        if (Looper.myLooper() == Looper.getMainLooper()) r.run();
        else main.post(r);
    }

    protected void log(String line) {
        main.post(() -> {
            if (cb != null) cb.onLinkLog(this, line);
        });
    }

    protected void deliver(byte type, byte[] payload) {
        if (cb != null) cb.onLinkMessage(this, type, payload);
    }

    public static String deviceName() {
        String m = Build.MODEL == null ? "" : Build.MODEL;
        String b = Build.MANUFACTURER == null ? "" : Build.MANUFACTURER;
        if (m.toLowerCase(Locale.ROOT).startsWith(b.toLowerCase(Locale.ROOT))) return m;
        return b + " " + m;
    }
}

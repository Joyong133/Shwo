package com.shwo.qpbridge;

import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Looper;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 앱 전체에서 하나만 있는 연결 관리자.
 * 블루투스와 USB를 함께 켜 두고, USB가 연결되면 USB를, 아니면 블루투스를 사용합니다.
 */
public final class Hub implements Link.Callback {

    public interface Listener {
        /** 메인 스레드 */
        default void onHubState() {}

        /** 아무 스레드 (영상은 블루투스면 메인, USB면 USB 스레드) */
        default void onMessage(byte type, byte[] payload) {}

        /** 메인 스레드 */
        default void onLog(String line) {}

        /** 메인 스레드 */
        default void onPeers(List<BleCentralLink.Peer> peers) {}
    }

    private static Hub instance;

    public static synchronized Hub get(Context c) {
        if (instance == null) instance = new Hub(c.getApplicationContext());
        return instance;
    }

    public final BleLink ble;
    public final UsbLink usb;
    /** 블루투스 고속(L2CAP) */
    public final StreamLink fast;
    private final CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ArrayList<String> logLines = new ArrayList<>();
    private final SimpleDateFormat timeFmt = new SimpleDateFormat("HH:mm:ss", Locale.KOREA);
    private volatile String peerName;
    private Link lastActive;
    private boolean bluetoothWanted;
    private String lastCrash;

    private Hub(Context ctx) {
        ble = BuildConfig.IS_VIEWER ? new BleCentralLink(ctx) : new BlePeripheralLink(ctx);
        usb = new UsbLink(ctx);
        fast = new StreamLink(ctx);
        ble.setCallback(this);
        usb.setCallback(this);
        fast.setCallback(this);
        ble.setSocketSink(fast::attach);
        // 앱이 오류로 꺼지면 내용을 저장해 두었다가 다음 연결 때 기록에 보여줌 (문제 찾기용)
        android.content.SharedPreferences prefs = ctx.getSharedPreferences("qpbridge", Context.MODE_PRIVATE);
        Thread.UncaughtExceptionHandler prev = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            String trace = sw.toString();
            prefs.edit().putString("lastCrash", trace.substring(0, Math.min(700, trace.length()))).commit();
            if (prev != null) prev.uncaughtException(t, e);
        });
        lastCrash = prefs.getString("lastCrash", null);
        prefs.edit().remove("lastCrash").apply();
        // 블루투스를 켜는 데는 시간이 걸리므로, 켜지는 순간 자동으로 시작 / 꺼지면 정리
        ctx.registerReceiver(new BroadcastReceiver() {
            @Override
            public void onReceive(Context c, Intent i) {
                int st = i.getIntExtra(BluetoothAdapter.EXTRA_STATE, -1);
                if (st == BluetoothAdapter.STATE_ON && bluetoothWanted) ble.start();
                else if (st == BluetoothAdapter.STATE_OFF && ble.getState() != Link.IDLE) {
                    ble.stop();
                    log("블루투스가 꺼졌어요.");
                }
            }
        }, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
    }

    /** 블루투스 연결을 사용 (꺼져 있으면 켜지는 대로 시작). 권한은 호출 전에 받아야 함 */
    public void wantBluetooth() {
        bluetoothWanted = true;
        if (ble.bluetoothOn()) ble.start();
    }

    public void addListener(Listener l) {
        if (!listeners.contains(l)) listeners.add(l);
    }

    public void removeListener(Listener l) {
        listeners.remove(l);
    }

    /** 지금 사용 중인 연결 (없으면 null) */
    public Link active() {
        if (usb.getState() == Link.READY) return usb;
        if (fast.getState() == Link.READY) return fast;
        if (ble.getState() == Link.READY) return ble;
        return null;
    }

    public static final int KIND_NONE = 0, KIND_BLE = 1, KIND_FAST = 2, KIND_USB = 3;

    /** 지금 연결 종류 (화질 결정용) */
    public int kind() {
        Link a = active();
        return a == null ? KIND_NONE : a == usb ? KIND_USB : a == fast ? KIND_FAST : KIND_BLE;
    }

    public boolean isReady() {
        return active() != null;
    }

    public boolean usbActive() {
        return active() == usb;
    }

    public String peerName() {
        return peerName;
    }

    public boolean send(byte type, byte[] payload) {
        Link l = active();
        return l != null && l.send(type, payload);
    }

    public boolean send(byte type) {
        return send(type, new byte[0]);
    }

    /** 현재 연결로 실제 내보낸 누적 바이트 */
    public long sentTotal() {
        Link l = active();
        return l == null ? 0 : l.sentTotal();
    }

    public long pendingBytes() {
        Link l = active();
        return l == null ? 0 : l.pendingBytes();
    }

    /** 화면에 보여줄 연결 상태 한 줄 */
    public String describe() {
        Link l = active();
        if (l != null) return l.label() + "로 연결됨" + (peerName != null ? " · " + peerName : "");
        if (usb.getState() == Link.CONNECTING) return usb.getDetail();
        if (ble.getState() != Link.IDLE) return ble.getDetail();
        return "연결 안 됨";
    }

    public List<String> logLines() {
        return new ArrayList<>(logLines);
    }

    public void log(String line) {
        String s = timeFmt.format(new Date()) + "  " + line;
        Runnable r = () -> {
            logLines.add(s);
            while (logLines.size() > 60) logLines.remove(0);
            for (Listener l : listeners) l.onLog(s);
        };
        if (Looper.myLooper() == Looper.getMainLooper()) r.run();
        else main.post(r);
    }

    /** 상태가 바뀌었다고 화면들에 알림 */
    public void notifyState() {
        main.post(() -> {
            for (Listener l : listeners) l.onHubState();
        });
    }

    public void stopAll() {
        bluetoothWanted = false;
        fast.stop();
        ble.stop();
        usb.stop();
    }

    // ── Link.Callback ──

    @Override
    public void onLinkState(Link link) {
        // 일반 블루투스가 끊기면 고속 채널도 닫음
        if (link == ble && ble.getState() != Link.READY && fast.isOpen()) fast.disconnect();
        // 퀘스트: 고속 채널 상태를 블루투스 쪽에 알려서, 끊기면 계속 다시 시도하게 함
        if (link == fast && ble instanceof BleCentralLink) {
            if (fast.getState() == Link.READY) ((BleCentralLink) ble).onFastReady();
            else ((BleCentralLink) ble).onFastClosed();
        }
        if (link.getState() == Link.READY) {
            link.send(Proto.HELLO, Proto.utf8(Link.deviceName()));
        }
        Link now = active();
        if (now == null) peerName = null;
        if (now != null && lastCrash != null) {
            String c = lastCrash;
            lastCrash = null;
            main.postDelayed(() -> log("지난번에 앱이 오류로 꺼졌어요: " + c.replace('\n', ' ').replace('\t', ' ')), 500);
        }
        if (now != lastActive) {
            if (now != null) log(now.label() + " 연결을 사용합니다.");
            else if (lastActive != null) log("연결이 끊어졌어요.");
            lastActive = now;
        }
        for (Listener l : listeners) l.onHubState();
    }

    @Override
    public void onLinkMessage(Link link, byte type, byte[] payload) {
        if (type == Proto.PING) {
            link.send(Proto.PONG, payload);
            return;
        }
        if (type == Proto.HELLO) {
            peerName = Proto.str(payload);
            main.post(() -> {
                log("상대 기기: " + peerName);
                for (Listener l : listeners) l.onHubState();
            });
            return;
        }
        for (Listener l : listeners) l.onMessage(type, payload);
    }

    @Override
    public void onLinkLog(Link link, String line) {
        log(line);
    }

    @Override
    public void onPeers(List<BleCentralLink.Peer> peers) {
        for (Listener l : listeners) l.onPeers(peers);
    }
}

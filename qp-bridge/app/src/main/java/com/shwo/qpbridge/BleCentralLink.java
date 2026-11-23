package com.shwo.qpbridge;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.BluetoothStatusCodes;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.ParcelUuid;
import android.bluetooth.BluetoothSocket;

import java.nio.ByteBuffer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;

/** 퀘스트 쪽 블루투스: 검색 + GATT 클라이언트. */
@SuppressLint("MissingPermission")
public final class BleCentralLink extends BleLink {

    public static final class Peer {
        public final BluetoothDevice device;
        public String code;
        public int rssi;

        Peer(BluetoothDevice d) {
            device = d;
        }
    }

    private static final long SCAN_TIMEOUT_MS = 90_000;
    private static final long CONNECT_TIMEOUT_MS = 20_000;
    /** 같은 주소로 바로 다시 연결해 보는 횟수. 그다음엔 코드로 다시 찾음 (휴대폰 블루투스 주소는 가끔 바뀜) */
    private static final int DIRECT_RETRIES = 2;

    private final SharedPreferences prefs;
    private BluetoothLeScanner scanner;
    private boolean scanning;
    private final LinkedHashMap<String, Peer> peers = new LinkedHashMap<>();

    private BluetoothGatt gatt;
    private BluetoothGattCharacteristic rxChar;
    private BluetoothDevice target;
    private String targetCode;
    private boolean userStopped;
    private boolean discoveryStarted;
    private int retries;
    private BluetoothGattCharacteristic psmChar;
    private int fastPsm, fastAttempts;
    private volatile boolean fastUp;
    private final Runnable fastRetry = this::connectFast;
    private final Runnable rescan = this::start;

    public BleCentralLink(Context ctx) {
        super(ctx);
        prefs = this.ctx.getSharedPreferences("qpbridge", Context.MODE_PRIVATE);
    }

    public boolean isScanning() {
        return scanning;
    }

    // ── 검색 ──

    @Override
    public void start() {
        startScan(ScanSettings.SCAN_MODE_LOW_LATENCY);
    }

    private void startScan(int mode) {
        if (scanning || gatt != null) return;
        if (!bluetoothOn()) {
            log("블루투스가 꺼져 있어요. (퀘스트: 설정 → 기기 → 블루투스)");
            return;
        }
        scanner = adapter.getBluetoothLeScanner();
        if (scanner == null) {
            log("블루투스 검색을 시작할 수 없어요. 블루투스를 다시 켜 보세요.");
            return;
        }
        peers.clear();
        publishPeers();
        List<ScanFilter> filters = Collections.singletonList(
                new ScanFilter.Builder().setServiceUuid(new ParcelUuid(Proto.SERVICE)).build());
        ScanSettings settings = new ScanSettings.Builder().setScanMode(mode).build();
        try {
            scanner.startScan(filters, settings, scanCallback);
        } catch (SecurityException | IllegalStateException e) {
            log("블루투스 검색 시작 실패: " + e.getMessage());
            return;
        }
        scanning = true;
        userStopped = false;
        setState(WAITING, "블루투스로 휴대폰을 찾는 중…");
        main.removeCallbacks(scanTimeout);
        if (mode == ScanSettings.SCAN_MODE_LOW_LATENCY) main.postDelayed(scanTimeout, SCAN_TIMEOUT_MS);
        // 처음 쓰는 경우: 4초 동안 휴대폰이 딱 하나만 보이면 그걸로 바로 연결
        main.removeCallbacks(autoPick);
        if (prefs.getString("lastCode", null) == null) main.postDelayed(autoPick, 4000);
    }

    private final Runnable autoPick = this::pickOnlyPhone;

    private void pickOnlyPhone() {
        if (!scanning || peers.size() != 1) return;
        Peer only = peers.values().iterator().next();
        if (only.code == null) return;
        log("근처에 휴대폰이 하나(코드 " + only.code + ")뿐이라 바로 연결합니다.");
        connect(only);
    }

    private final Runnable scanTimeout = this::onScanTimeout;

    private void onScanTimeout() {
        if (!scanning) return;
        stopScan();
        if (prefs.getString("lastCode", null) != null && !userStopped && bluetoothOn()) {
            // 연결했던 휴대폰이 있으면 포기하지 않고 계속 찾음 (배터리를 덜 쓰는 모드로)
            setState(WAITING, "휴대폰을 계속 찾는 중… (휴대폰 앱을 켜 두세요)");
            startScan(ScanSettings.SCAN_MODE_BALANCED); // 이번엔 시간 제한 없음
            return;
        }
        if (peers.isEmpty()) log("휴대폰을 찾지 못했어요. 휴대폰 앱이 켜져 있고 블루투스가 켜져 있는지 확인하세요.");
        setState(IDLE, "블루투스 검색 멈춤");
    }

    private void stopScan() {
        main.removeCallbacks(scanTimeout);
        main.removeCallbacks(autoPick);
        if (!scanning) return;
        scanning = false;
        peers.clear();
        publishPeers();
        try {
            if (scanner != null && bluetoothOn()) scanner.stopScan(scanCallback);
        } catch (SecurityException | IllegalStateException ignored) {}
    }

    private void publishPeers() {
        if (cb != null) cb.onPeers(new ArrayList<>(peers.values()));
    }

    private final ScanCallback scanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            main.post(() -> handleResult(result));
        }

        @Override
        public void onBatchScanResults(List<ScanResult> results) {
            main.post(() -> {
                for (ScanResult r : results) handleResult(r);
            });
        }

        @Override
        public void onScanFailed(int errorCode) {
            main.post(() -> {
                scanning = false;
                log("블루투스 검색 실패 (코드 " + errorCode + "). 블루투스를 껐다 켜 보세요.");
                setState(IDLE, "블루투스 검색 실패");
            });
        }
    };

    private void handleResult(ScanResult r) {
        if (!scanning) return;
        BluetoothDevice d = r.getDevice();
        Peer p = peers.get(d.getAddress());
        if (p == null) {
            p = new Peer(d);
            peers.put(d.getAddress(), p);
        }
        ScanRecord rec = r.getScanRecord();
        if (rec != null) {
            String c = Proto.parseAdvert(rec.getManufacturerSpecificData(Proto.MANUFACTURER_ID));
            if (c != null) p.code = c;
        }
        p.rssi = r.getRssi();
        publishPeers();
        String last = prefs.getString("lastCode", null);
        if (p.code != null && p.code.equals(last)) {
            log("지난번 휴대폰(코드 " + p.code + ")을 찾아 자동으로 연결합니다.");
            connect(p);
        }
    }

    // ── 연결 ──

    public void connect(Peer p) {
        stopScan();
        target = p.device;
        targetCode = p.code;
        userStopped = false;
        retries = 0;
        doConnect();
    }

    private void doConnect() {
        if (target == null) return;
        closeGatt();
        discoveryStarted = false;
        setState(CONNECTING, "블루투스 연결 중…" + (retries > 0 ? " (재시도 " + retries + ")" : ""));
        try {
            gatt = target.connectGatt(ctx, false, gattCallback, BluetoothDevice.TRANSPORT_LE,
                    BluetoothDevice.PHY_LE_1M_MASK | BluetoothDevice.PHY_LE_2M_MASK);
        } catch (SecurityException e) {
            log("블루투스 권한이 없어요.");
            setState(IDLE, "블루투스 연결 실패");
            return;
        }
        main.removeCallbacks(connectTimeout);
        main.postDelayed(connectTimeout, CONNECT_TIMEOUT_MS);
    }

    private final Runnable connectTimeout = () -> {
        if (state == CONNECTING) {
            log("블루투스 연결 시간이 초과됐어요.");
            handleDisconnect(8);
        }
    };

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt g, int status, int newState) {
            main.post(() -> {
                if (g != gatt) return;
                if (newState == BluetoothProfile.STATE_CONNECTED && status == BluetoothGatt.GATT_SUCCESS) {
                    setState(CONNECTING, "블루투스 연결됨 · 준비 중…");
                    try {
                        g.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH);
                        g.setPreferredPhy(BluetoothDevice.PHY_LE_2M_MASK, BluetoothDevice.PHY_LE_2M_MASK,
                                BluetoothDevice.PHY_OPTION_NO_PREFERRED);
                        if (!g.requestMtu(517)) discover(g);
                        else main.postDelayed(() -> { if (g == gatt) discover(g); }, 1500);
                    } catch (SecurityException e) {
                        log("블루투스 권한이 없어요.");
                    }
                } else {
                    handleDisconnect(status);
                }
            });
        }

        @Override
        public void onMtuChanged(BluetoothGatt g, int newMtu, int status) {
            main.post(() -> {
                if (g != gatt) return;
                if (status == BluetoothGatt.GATT_SUCCESS) mtu = newMtu;
                discover(g);
            });
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt g, int status) {
            main.post(() -> {
                if (g != gatt) return;
                BluetoothGattService svc = g.getService(Proto.SERVICE);
                if (status != BluetoothGatt.GATT_SUCCESS || svc == null) {
                    log("상대 기기에서 QP브릿지를 찾지 못했어요.");
                    handleDisconnect(status);
                    return;
                }
                rxChar = svc.getCharacteristic(Proto.RX);
                BluetoothGattCharacteristic tx = svc.getCharacteristic(Proto.TX);
                BluetoothGattDescriptor cccd = tx == null ? null : tx.getDescriptor(Proto.CCCD);
                if (rxChar == null || cccd == null) {
                    log("두 앱의 버전이 달라요. 같은 버전으로 설치하세요.");
                    handleDisconnect(status);
                    return;
                }
                try {
                    g.setCharacteristicNotification(tx, true);
                    writeDescriptor(g, cccd, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                } catch (SecurityException e) {
                    log("블루투스 권한이 없어요.");
                }
            });
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt g, BluetoothGattDescriptor descriptor, int status) {
            main.post(() -> {
                if (g != gatt) return;
                if (status != BluetoothGatt.GATT_SUCCESS) {
                    log("블루투스 알림 설정 실패: " + gattStatus(status));
                    handleDisconnect(status);
                    return;
                }
                main.removeCallbacks(connectTimeout);
                retries = 0;
                if (targetCode != null) prefs.edit().putString("lastCode", targetCode).apply();
                // 준비 완료 전에 고속 채널 번호를 먼저 읽음 (다른 블루투스 작업과 겹치지 않게)
                psmChar = g.getService(Proto.SERVICE).getCharacteristic(Proto.PSM);
                boolean reading = false;
                if (psmChar != null && Build.VERSION.SDK_INT >= 29) {
                    try {
                        reading = g.readCharacteristic(psmChar);
                    } catch (SecurityException ignored) {
                    }
                }
                if (!reading) finishReady(0);
            });
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c, byte[] value) {
            byte[] copy = value.clone();
            main.post(() -> {
                if (g == gatt && Proto.TX.equals(c.getUuid())) onPacketReceived(copy);
            });
        }

        @Override
        @SuppressWarnings("deprecation")
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c) {
            byte[] v = c.getValue();
            byte[] copy = v == null ? new byte[0] : v.clone();
            main.post(() -> {
                if (g == gatt && Proto.TX.equals(c.getUuid())) onPacketReceived(copy);
            });
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt g, BluetoothGattCharacteristic c, byte[] value, int status) {
            byte[] copy = value == null ? new byte[0] : value.clone();
            main.post(() -> onPsmRead(g, c, copy, status));
        }

        @Override
        @SuppressWarnings("deprecation")
        public void onCharacteristicRead(BluetoothGatt g, BluetoothGattCharacteristic c, int status) {
            byte[] v = c.getValue();
            byte[] copy = v == null ? new byte[0] : v.clone();
            main.post(() -> onPsmRead(g, c, copy, status));
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt g, BluetoothGattCharacteristic c, int status) {
            main.post(() -> {
                if (g == gatt) onPacketSent();
            });
        }
    };

    private void onPsmRead(BluetoothGatt g, BluetoothGattCharacteristic c, byte[] v, int status) {
        if (g != gatt || state == READY || !Proto.PSM.equals(c.getUuid())) return;
        int psm = status == BluetoothGatt.GATT_SUCCESS && v.length >= 4 ? ByteBuffer.wrap(v).getInt() : 0;
        finishReady(psm);
    }

    private void finishReady(int psm) {
        setState(READY, "블루투스로 연결됨");
        fastPsm = psm;
        fastAttempts = 0;
        fastUp = false;
        if (psm > 0) connectFast();
    }

    /** 고속 채널(L2CAP) 연결. 실패해도 일반 블루투스로 계속 */
    public void connectFast() {
        BluetoothDevice dev = target;
        int psm = fastPsm;
        main.removeCallbacks(fastRetry);
        if (dev == null || psm <= 0 || state != READY || Build.VERSION.SDK_INT < 29 || fastUp) return;
        int attempt = ++fastAttempts;
        new Thread(() -> {
            BluetoothSocket s = null;
            try {
                s = dev.createInsecureL2capChannel(psm);
                s.connect();
                if (socketSink != null) socketSink.onSocket(s);
            } catch (Exception e) {
                if (s != null) {
                    try { s.close(); } catch (Exception ignored) {}
                }
                if (attempt == 1 || attempt % 5 == 0)
                    log("블루투스 고속 채널 연결 실패 (" + e.getClass().getSimpleName() + "). 일반 블루투스로 계속하면서 다시 시도합니다.");
                // 2, 4, 8, 16, 30초… 간격으로 계속 다시 시도
                long delay = Math.min(30_000L, 2000L << Math.min(attempt - 1, 4));
                main.post(() -> {
                    if (state == READY && !fastUp) main.postDelayed(fastRetry, delay);
                });
            }
        }, "l2cap-connect").start();
    }

    /** Hub 가 고속 채널 상태를 알려 줌 */
    public void onFastReady() {
        fastUp = true;
        fastAttempts = 0;
        main.removeCallbacks(fastRetry);
    }

    public void onFastClosed() {
        fastUp = false;
        main.removeCallbacks(fastRetry);
        if (state == READY) main.postDelayed(fastRetry, 2000);
    }

    private void discover(BluetoothGatt g) {
        if (discoveryStarted) return;
        discoveryStarted = true;
        try {
            if (!g.discoverServices()) handleDisconnect(133);
        } catch (SecurityException e) {
            log("블루투스 권한이 없어요.");
        }
    }

    @SuppressWarnings("deprecation")
    private static void writeDescriptor(BluetoothGatt g, BluetoothGattDescriptor d, byte[] value) {
        if (Build.VERSION.SDK_INT >= 33) {
            g.writeDescriptor(d, value);
        } else {
            d.setValue(value);
            g.writeDescriptor(d);
        }
    }

    private void handleDisconnect(int status) {
        main.removeCallbacks(connectTimeout);
        boolean wasReady = state == READY;
        closeGatt();
        resetTransfer();
        if (userStopped || target == null) {
            setState(IDLE, "블루투스 끊김");
            return;
        }
        if (wasReady) log("블루투스 연결이 끊어졌어요 (" + gattStatus(status) + "). 바로 다시 연결합니다.");
        if (!bluetoothOn()) {
            target = null;
            setState(IDLE, "블루투스 꺼짐");
        } else if (retries < DIRECT_RETRIES) {
            retries++;
            setState(CONNECTING, "블루투스 다시 연결 중… (" + retries + ")");
            main.postDelayed(this::doConnect, 1000);
        } else {
            // 주소가 바뀌었을 수 있으니 코드로 다시 찾아서 자동 연결 (포기하지 않음)
            target = null;
            setState(IDLE, "다시 찾는 중");
            main.postDelayed(rescan, 500);
        }
    }

    private void closeGatt() {
        main.removeCallbacks(fastRetry);
        fastUp = false;
        if (gatt != null) {
            try {
                gatt.disconnect();
                gatt.close();
            } catch (SecurityException ignored) {}
        }
        gatt = null;
        rxChar = null;
    }

    @Override
    @SuppressWarnings("deprecation")
    protected boolean writePacket(byte[] packet) {
        if (gatt == null || rxChar == null) return false;
        if (Build.VERSION.SDK_INT >= 33) {
            return gatt.writeCharacteristic(rxChar, packet, BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT)
                    == BluetoothStatusCodes.SUCCESS;
        }
        rxChar.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
        rxChar.setValue(packet);
        return gatt.writeCharacteristic(rxChar);
    }

    @Override
    public void disconnect() {
        userStopped = true;
        main.removeCallbacks(rescan);
        target = null;
        prefs.edit().remove("lastCode").apply();
        main.removeCallbacks(connectTimeout);
        closeGatt();
        resetTransfer();
        setState(IDLE, "블루투스 끊김");
    }

    @Override
    public void stop() {
        stopScan();
        userStopped = true;
        main.removeCallbacks(rescan);
        target = null;
        main.removeCallbacks(connectTimeout);
        closeGatt();
        resetTransfer();
        setState(IDLE, "블루투스 꺼짐");
    }
}

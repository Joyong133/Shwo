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
    private static final int MAX_RETRIES = 5;

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
        ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
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
        main.postDelayed(scanTimeout, SCAN_TIMEOUT_MS);
    }

    private final Runnable scanTimeout = () -> {
        if (!scanning) return;
        stopScan();
        if (peers.isEmpty()) log("휴대폰을 찾지 못했어요. 휴대폰 앱이 켜져 있고 블루투스가 켜져 있는지 확인하세요.");
        setState(IDLE, "블루투스 검색 멈춤");
    };

    private void stopScan() {
        main.removeCallbacks(scanTimeout);
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
        setState(CONNECTING, "블루투스 연결 중…" + (retries > 0 ? " (재시도 " + retries + "/" + MAX_RETRIES + ")" : ""));
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
                setState(READY, "블루투스로 연결됨");
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
        public void onCharacteristicWrite(BluetoothGatt g, BluetoothGattCharacteristic c, int status) {
            main.post(() -> {
                if (g == gatt) onPacketSent();
            });
        }
    };

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
        if (wasReady) log("블루투스 연결이 끊어졌어요 (" + gattStatus(status) + ")");
        if (retries < MAX_RETRIES && bluetoothOn()) {
            retries++;
            setState(CONNECTING, "블루투스 다시 연결 중… (" + retries + "/" + MAX_RETRIES + ")");
            main.postDelayed(this::doConnect, 1500);
        } else {
            log("블루투스로 연결하지 못했어요 (" + gattStatus(status) + "). 두 기기를 가까이 두고 다시 시도하세요.");
            target = null;
            setState(IDLE, "블루투스 연결 실패");
        }
    }

    private void closeGatt() {
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
        target = null;
        main.removeCallbacks(connectTimeout);
        closeGatt();
        resetTransfer();
        setState(IDLE, "블루투스 꺼짐");
    }
}

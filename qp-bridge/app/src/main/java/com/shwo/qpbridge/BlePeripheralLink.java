package com.shwo.qpbridge;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.BluetoothStatusCodes;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.ParcelUuid;

import java.util.Arrays;
import java.util.Locale;
import java.util.Random;

/** 휴대폰 쪽 블루투스: 광고 + GATT 서버. 화면 데이터는 Notify 로 보냄. */
@SuppressLint("MissingPermission")
public final class BlePeripheralLink extends BleLink {

    private BluetoothLeAdvertiser advertiser;
    private BluetoothGattServer server;
    private BluetoothGattCharacteristic txChar;
    private BluetoothDevice central;
    private boolean subscribed;
    private boolean running;
    private boolean advertising;
    private final String code;

    public BlePeripheralLink(Context ctx) {
        super(ctx);
        SharedPreferences prefs = this.ctx.getSharedPreferences("qpbridge", Context.MODE_PRIVATE);
        String c = prefs.getString("code", null);
        if (c == null) {
            c = String.format(Locale.US, "%04d", new Random().nextInt(10000));
            prefs.edit().putString("code", c).apply();
        }
        code = c;
    }

    public String getCode() {
        return code;
    }

    @Override
    public void start() {
        if (running) return;
        if (!bluetoothOn()) {
            log("블루투스가 꺼져 있어요.");
            return;
        }
        advertiser = adapter.getBluetoothLeAdvertiser();
        if (advertiser == null) {
            log("이 휴대폰은 블루투스 광고를 지원하지 않아요. USB 케이블로 연결하세요.");
            return;
        }
        BluetoothManager bm = (BluetoothManager) ctx.getSystemService(Context.BLUETOOTH_SERVICE);
        server = bm.openGattServer(ctx, serverCallback);
        if (server == null) {
            log("블루투스 서버를 열 수 없어요. 블루투스를 껐다 켠 뒤 다시 시도하세요.");
            return;
        }
        running = true;
        BluetoothGattService svc = new BluetoothGattService(Proto.SERVICE, BluetoothGattService.SERVICE_TYPE_PRIMARY);
        BluetoothGattCharacteristic rx = new BluetoothGattCharacteristic(Proto.RX,
                BluetoothGattCharacteristic.PROPERTY_WRITE | BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE,
                BluetoothGattCharacteristic.PERMISSION_WRITE);
        txChar = new BluetoothGattCharacteristic(Proto.TX,
                BluetoothGattCharacteristic.PROPERTY_NOTIFY | BluetoothGattCharacteristic.PROPERTY_READ,
                BluetoothGattCharacteristic.PERMISSION_READ);
        txChar.addDescriptor(new BluetoothGattDescriptor(Proto.CCCD,
                BluetoothGattDescriptor.PERMISSION_READ | BluetoothGattDescriptor.PERMISSION_WRITE));
        svc.addCharacteristic(rx);
        svc.addCharacteristic(txChar);
        setState(WAITING, "블루투스 준비 중…");
        if (!server.addService(svc)) {
            log("블루투스 서비스 등록 실패");
            stop();
        }
    }

    private String waitingText() {
        return "퀘스트를 기다리는 중 · 코드 " + code;
    }

    private void startAdvertising() {
        if (!running || advertising || advertiser == null) return;
        AdvertiseSettings settings = new AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setConnectable(true)
                .setTimeout(0)
                .build();
        AdvertiseData data = new AdvertiseData.Builder()
                .addServiceUuid(new ParcelUuid(Proto.SERVICE))
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .build();
        AdvertiseData scanResponse = new AdvertiseData.Builder()
                .addManufacturerData(Proto.MANUFACTURER_ID, Proto.advertPayload(code))
                .setIncludeDeviceName(false)
                .build();
        try {
            advertiser.startAdvertising(settings, data, scanResponse, advertiseCallback);
            advertising = true;
        } catch (SecurityException | IllegalStateException e) {
            log("블루투스 광고 시작 실패: " + e.getMessage());
        }
    }

    private void stopAdvertising() {
        if (!advertising || advertiser == null) return;
        advertising = false;
        try {
            advertiser.stopAdvertising(advertiseCallback);
        } catch (SecurityException | IllegalStateException ignored) {
        }
    }

    private final AdvertiseCallback advertiseCallback = new AdvertiseCallback() {
        @Override
        public void onStartSuccess(AdvertiseSettings settingsInEffect) {
            main.post(() -> {
                if (running && central == null) setState(WAITING, waitingText());
            });
        }

        @Override
        public void onStartFailure(int errorCode) {
            main.post(() -> {
                advertising = false;
                if (errorCode == ADVERTISE_FAILED_ALREADY_STARTED) {
                    advertising = true;
                    return;
                }
                String why;
                switch (errorCode) {
                    case ADVERTISE_FAILED_DATA_TOO_LARGE: why = "광고 데이터가 너무 큼"; break;
                    case ADVERTISE_FAILED_TOO_MANY_ADVERTISERS: why = "다른 앱이 광고 슬롯을 모두 사용 중"; break;
                    case ADVERTISE_FAILED_FEATURE_UNSUPPORTED: why = "이 휴대폰은 블루투스 광고를 지원하지 않음 → USB 케이블을 쓰세요"; break;
                    default: why = "내부 오류 " + errorCode;
                }
                log("블루투스 광고 실패: " + why);
                stop();
            });
        }
    };

    private final BluetoothGattServerCallback serverCallback = new BluetoothGattServerCallback() {
        @Override
        public void onServiceAdded(int status, BluetoothGattService service) {
            main.post(() -> {
                if (status == BluetoothGatt.GATT_SUCCESS) startAdvertising();
                else {
                    log("블루투스 서비스 등록 실패: " + gattStatus(status));
                    stop();
                }
            });
        }

        @Override
        public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {
            main.post(() -> {
                if (!running) return;
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    if (central != null && !central.equals(device)) {
                        try { server.cancelConnection(device); } catch (SecurityException ignored) {}
                        return;
                    }
                    central = device;
                    subscribed = false;
                    stopAdvertising();
                    setState(CONNECTING, "블루투스 연결됨 · 준비 중…");
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED && device.equals(central)) {
                    central = null;
                    subscribed = false;
                    resetTransfer();
                    log("블루투스 연결이 끊어졌어요 (" + gattStatus(status) + ")");
                    setState(WAITING, waitingText());
                    startAdvertising();
                }
            });
        }

        @Override
        public void onMtuChanged(BluetoothDevice device, int newMtu) {
            mtu = newMtu;
        }

        @Override
        public void onCharacteristicWriteRequest(BluetoothDevice device, int requestId,
                BluetoothGattCharacteristic characteristic, boolean preparedWrite, boolean responseNeeded,
                int offset, byte[] value) {
            byte[] copy = value == null ? new byte[0] : value.clone();
            main.post(() -> {
                boolean ok = Proto.RX.equals(characteristic.getUuid());
                if (responseNeeded && server != null) {
                    try {
                        server.sendResponse(device, requestId,
                                ok ? BluetoothGatt.GATT_SUCCESS : BluetoothGatt.GATT_WRITE_NOT_PERMITTED, 0, null);
                    } catch (SecurityException ignored) {}
                }
                if (ok && device.equals(central)) onPacketReceived(copy);
            });
        }

        @Override
        public void onDescriptorWriteRequest(BluetoothDevice device, int requestId,
                BluetoothGattDescriptor descriptor, boolean preparedWrite, boolean responseNeeded,
                int offset, byte[] value) {
            byte[] copy = value == null ? new byte[0] : value.clone();
            main.post(() -> {
                if (responseNeeded && server != null) {
                    try {
                        server.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, null);
                    } catch (SecurityException ignored) {}
                }
                if (!Proto.CCCD.equals(descriptor.getUuid()) || !device.equals(central)) return;
                subscribed = Arrays.equals(copy, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
                        || Arrays.equals(copy, BluetoothGattDescriptor.ENABLE_INDICATION_VALUE);
                if (subscribed && state != READY) setState(READY, "블루투스로 연결됨");
            });
        }

        @Override
        public void onDescriptorReadRequest(BluetoothDevice device, int requestId, int offset,
                BluetoothGattDescriptor descriptor) {
            main.post(() -> {
                if (server == null) return;
                byte[] v = subscribed ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                        : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE;
                try { server.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, v); }
                catch (SecurityException ignored) {}
            });
        }

        @Override
        public void onCharacteristicReadRequest(BluetoothDevice device, int requestId, int offset,
                BluetoothGattCharacteristic characteristic) {
            main.post(() -> {
                if (server == null) return;
                try { server.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, new byte[0]); }
                catch (SecurityException ignored) {}
            });
        }

        @Override
        public void onNotificationSent(BluetoothDevice device, int status) {
            main.post(BlePeripheralLink.this::onPacketSent);
        }
    };

    @Override
    @SuppressWarnings("deprecation")
    protected boolean writePacket(byte[] packet) {
        if (server == null || central == null || !subscribed) return false;
        if (Build.VERSION.SDK_INT >= 33) {
            return server.notifyCharacteristicChanged(central, txChar, false, packet) == BluetoothStatusCodes.SUCCESS;
        }
        txChar.setValue(packet);
        return server.notifyCharacteristicChanged(central, txChar, false);
    }

    @Override
    public void disconnect() {
        if (server != null && central != null) {
            try { server.cancelConnection(central); } catch (SecurityException ignored) {}
        }
    }

    @Override
    public void stop() {
        running = false;
        stopAdvertising();
        if (server != null) {
            try {
                if (central != null) server.cancelConnection(central);
                server.close();
            } catch (SecurityException ignored) {}
        }
        server = null;
        central = null;
        subscribed = false;
        resetTransfer();
        setState(IDLE, "블루투스 꺼짐");
    }
}

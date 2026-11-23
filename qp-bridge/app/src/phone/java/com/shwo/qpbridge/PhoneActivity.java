package com.shwo.qpbridge;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

public class PhoneActivity extends Activity implements Hub.Listener {

    private static final int REQ_PERMS = 1;
    private static final int REQ_CAPTURE = 2;
    private static final int REQ_ENABLE_BT = 3;

    private Hub hub;
    private TextView linkStatus, codeText, a11yStatus, shareStatus, logText;
    private Button a11yBtn, shareBtn, btBtn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_phone);
        linkStatus = findViewById(R.id.linkStatus);
        codeText = findViewById(R.id.codeText);
        a11yStatus = findViewById(R.id.a11yStatus);
        shareStatus = findViewById(R.id.shareStatus);
        logText = findViewById(R.id.logText);
        a11yBtn = findViewById(R.id.a11yBtn);
        shareBtn = findViewById(R.id.shareBtn);
        btBtn = findViewById(R.id.btBtn);

        hub = Hub.get(this);
        PhoneController.get(this);
        hub.addListener(this);
        hub.usb.start();

        a11yBtn.setOnClickListener(v -> openAccessibilitySettings());
        findViewById(R.id.restrictedBtn).setOnClickListener(v -> openAppInfo());
        shareBtn.setOnClickListener(v -> {
            if (MirrorService.isRunning()) MirrorService.stop(this);
            else startCapture();
        });
        btBtn.setOnClickListener(v -> startBluetooth());

        startBluetooth();
        refresh();
        StringBuilder sb = new StringBuilder();
        for (String s : hub.logLines()) sb.append(s).append('\n');
        logText.setText(sb);
    }

    @Override
    protected void onResume() {
        super.onResume();
        hub.usb.scan();
        refresh();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        hub.usb.scan(); // USB 액세서리로 열린 경우
    }

    @Override
    protected void onDestroy() {
        hub.removeListener(this);
        if (isFinishing() && !MirrorService.isRunning()) hub.stopAll();
        super.onDestroy();
    }

    // ── 블루투스 ──

    private List<String> missingPermissions() {
        List<String> need = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= 31) {
            need.add(Manifest.permission.BLUETOOTH_ADVERTISE);
            need.add(Manifest.permission.BLUETOOTH_CONNECT);
        }
        if (Build.VERSION.SDK_INT >= 33) need.add(Manifest.permission.POST_NOTIFICATIONS);
        List<String> missing = new ArrayList<>();
        for (String p : need) if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) missing.add(p);
        return missing;
    }

    private boolean bluetoothOn() {
        BluetoothManager bm = (BluetoothManager) getSystemService(BLUETOOTH_SERVICE);
        return bm != null && bm.getAdapter() != null && bm.getAdapter().isEnabled();
    }

    private void startBluetooth() {
        List<String> missing = missingPermissions();
        if (!missing.isEmpty()) {
            requestPermissions(missing.toArray(new String[0]), REQ_PERMS);
            return;
        }
        if (!bluetoothOn()) {
            hub.wantBluetooth(); // 켜지는 대로 자동 시작
            try {
                //noinspection MissingPermission
                startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), REQ_ENABLE_BT);
            } catch (Exception e) {
                hub.log("블루투스를 켜 주세요. (USB 케이블만 쓸 거라면 꺼져 있어도 됩니다)");
            }
            return;
        }
        hub.wantBluetooth();
        refresh();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode != REQ_PERMS) return;
        boolean btOk = Build.VERSION.SDK_INT < 31
                || (checkSelfPermission(Manifest.permission.BLUETOOTH_ADVERTISE) == PackageManager.PERMISSION_GRANTED
                && checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED);
        if (btOk) {
            startBluetooth();
        } else {
            hub.log("'근처 기기' 권한이 없으면 블루투스로 연결할 수 없어요. (USB 케이블은 사용 가능)");
        }
        refresh();
    }

    // ── 화면 공유 ──

    private void startCapture() {
        MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
        startActivityForResult(mpm.createScreenCaptureIntent(), REQ_CAPTURE);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_CAPTURE) {
            if (resultCode == RESULT_OK && data != null) {
                Intent svc = new Intent(this, MirrorService.class)
                        .putExtra(MirrorService.EXTRA_RESULT_CODE, resultCode)
                        .putExtra(MirrorService.EXTRA_RESULT_DATA, data);
                startForegroundService(svc);
            } else {
                hub.log("화면 공유를 취소했어요.");
            }
        }
        refresh();
    }

    // ── 접근성 ──

    private boolean accessibilityEnabled() {
        if (RemoteControlService.isOn()) return true;
        String enabled = Settings.Secure.getString(getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (enabled == null) return false;
        ComponentName me = new ComponentName(this, RemoteControlService.class);
        TextUtils.SimpleStringSplitter sp = new TextUtils.SimpleStringSplitter(':');
        sp.setString(enabled);
        for (String s : sp) {
            ComponentName c = ComponentName.unflattenFromString(s);
            if (me.equals(c)) return true;
        }
        return false;
    }

    private void openAccessibilitySettings() {
        try {
            startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
        } catch (Exception ignored) {
        }
    }

    private void openAppInfo() {
        try {
            startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", getPackageName(), null)));
        } catch (Exception ignored) {
        }
    }

    // ── 화면 갱신 ──

    private void refresh() {
        String link = hub.describe();
        linkStatus.setText((hub.isReady() ? "● " : "○ ") + link);
        linkStatus.setTextColor(getColor(hub.isReady() ? R.color.ok : R.color.text));
        BlePeripheralLink ble = (BlePeripheralLink) hub.ble;
        boolean waiting = ble.getState() != Link.IDLE && !hub.isReady();
        codeText.setText("연결 코드 " + ble.getCode());
        codeText.setVisibility(waiting ? View.VISIBLE : View.GONE);
        btBtn.setVisibility(ble.getState() == Link.IDLE ? View.VISIBLE : View.GONE);

        boolean a11y = accessibilityEnabled();
        a11yStatus.setText(a11y ? "✓ 켜짐 — 퀘스트에서 터치·뒤로·홈·글자 입력 가능" : "✗ 꺼짐 — 켜야 퀘스트에서 조작할 수 있어요");
        a11yStatus.setTextColor(getColor(a11y ? R.color.ok : R.color.warn));
        a11yBtn.setText(a11y ? "접근성 설정 보기" : "접근성 설정 열기");

        boolean sharing = MirrorService.isRunning();
        shareStatus.setText(sharing ? "✓ 공유 중 — 다른 앱으로 나가도 계속 공유됩니다" : "공유하지 않는 중");
        shareStatus.setTextColor(getColor(sharing ? R.color.ok : R.color.muted));
        shareBtn.setText(sharing ? "화면 공유 중지" : "화면 공유 시작");
    }

    @Override
    public void onHubState() {
        refresh();
    }

    @Override
    public void onLog(String line) {
        logText.append(line + "\n");
        refresh();
    }
}

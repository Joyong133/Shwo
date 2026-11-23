package com.shwo.qpbridge;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.provider.Settings;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.text.style.StyleSpan;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

@SuppressLint("MissingPermission")
public class MainActivity extends Activity implements BaseLink.Listener {

    private static final int REQ_PERMS = 1;
    private static final int REQ_ENABLE_BT = 2;
    private static final int MAX_LOG_CHARS = 40_000;

    // 액티비티가 다시 만들어져도 연결과 대화 기록을 유지
    private static BaseLink sLink;
    private static final SpannableStringBuilder sLog = new SpannableStringBuilder();

    private SharedPreferences prefs;
    private String role;
    private BaseLink link;
    private String peerName;
    private Runnable pendingAction;
    private static int sLastState = BaseLink.IDLE;

    private TextView roleText, statusText, codeText, logText;
    private ScrollView logScroll;
    private LinearLayout peerList;
    private Button primaryBtn, disconnectBtn, sendBtn, pingBtn, swapBtn;
    private EditText input;

    private int cText, cMuted, cAccent, cOk, cWarn;

    private final SimpleDateFormat timeFmt = new SimpleDateFormat("HH:mm:ss", Locale.KOREA);

    private final BroadcastReceiver btReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            int s = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, -1);
            if (s == BluetoothAdapter.STATE_OFF && link != null && link.getState() != BaseLink.IDLE) {
                link.stop();
                addSys("블루투스가 꺼져서 연결을 멈췄어요.", cWarn);
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        cText = getColor(R.color.text);
        cMuted = getColor(R.color.muted);
        cAccent = getColor(R.color.accent);
        cOk = getColor(R.color.ok);
        cWarn = getColor(R.color.warn);

        roleText = findViewById(R.id.roleText);
        statusText = findViewById(R.id.statusText);
        codeText = findViewById(R.id.codeText);
        logText = findViewById(R.id.logText);
        logScroll = findViewById(R.id.logScroll);
        peerList = findViewById(R.id.peerList);
        primaryBtn = findViewById(R.id.primaryBtn);
        disconnectBtn = findViewById(R.id.disconnectBtn);
        sendBtn = findViewById(R.id.sendBtn);
        pingBtn = findViewById(R.id.pingBtn);
        swapBtn = findViewById(R.id.swapBtn);
        input = findViewById(R.id.input);

        prefs = getSharedPreferences("qpbridge", MODE_PRIVATE);
        role = prefs.getString("role", BuildConfig.DEFAULT_ROLE);

        primaryBtn.setOnClickListener(v -> onPrimary());
        disconnectBtn.setOnClickListener(v -> {
            if (link instanceof CentralLink) ((CentralLink) link).forgetLast();
            link.disconnect();
        });
        sendBtn.setOnClickListener(v -> sendInput());
        input.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEND || actionId == EditorInfo.IME_ACTION_DONE) {
                sendInput();
                return true;
            }
            return false;
        });
        pingBtn.setOnClickListener(v -> {
            if (link.getState() == BaseLink.READY) {
                link.sendPing();
                addSys("응답속도 측정 중…", cMuted);
            }
        });
        swapBtn.setOnClickListener(v -> confirmSwap());

        registerReceiver(btReceiver, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));

        logText.setText(sLog);
        boolean fresh = sLink == null;
        bindLink();
        if (fresh) {
            addSys(intro(), cMuted);
            // 권한과 블루투스가 이미 준비돼 있으면 바로 시작
            if (missingPermissions().isEmpty() && bluetoothOn()) link.start();
        }
    }

    private boolean isCentral() {
        return "central".equals(role);
    }

    private void bindLink() {
        if (sLink == null || sLink.isCentral() != isCentral()) {
            if (sLink != null) {
                sLink.setListener(null);
                sLink.stop();
            }
            sLink = isCentral() ? new CentralLink(this) : new PeripheralLink(this);
        }
        link = sLink;
        updateRoleText();
        link.setListener(this);
    }

    private String intro() {
        if (isCentral()) {
            return "상대 기기(" + otherName() + ")에서 QP브릿지 앱을 열고 '연결 대기'가 되면, 여기서 '찾기'를 눌러 목록에서 고르세요. Wi-Fi는 꺼져 있어도 됩니다. 블루투스만 켜 두세요.";
        }
        return "이 기기는 연결을 기다리는 쪽이에요. 상대 기기(" + otherName() + ")에서 '찾기'를 누르고 아래 코드와 같은 기기를 고르세요. Wi-Fi는 꺼져 있어도 됩니다. 블루투스만 켜 두세요.";
    }

    private String otherName() {
        return "quest".equals(BuildConfig.DEVICE_KIND) ? "휴대폰" : "메타퀘스트";
    }

    private void updateRoleText() {
        String me = "quest".equals(BuildConfig.DEVICE_KIND) ? "메타퀘스트" : "휴대폰";
        String r = isCentral() ? "찾아서 연결하는 쪽" : "연결을 기다리는 쪽";
        boolean swapped = !role.equals(BuildConfig.DEFAULT_ROLE);
        roleText.setText("이 기기: " + me + " · 역할: " + r + (swapped ? " (바꾼 역할)" : "")
                + " · 블루투스(BLE) 연결, Wi-Fi 불필요");
    }

    // ───────────────────────── 버튼 동작 ─────────────────────────

    private void onPrimary() {
        int s = link.getState();
        if (s == BaseLink.IDLE) {
            withBluetoothReady(() -> link.start());
        } else if (s == BaseLink.WAITING) {
            link.stop();
        }
    }

    private void sendInput() {
        String text = input.getText().toString().trim();
        if (text.isEmpty()) return;
        if (link.send(Proto.TEXT, text)) {
            addChat("나", text, cAccent);
            input.setText("");
        }
    }

    private void confirmSwap() {
        new AlertDialog.Builder(this)
                .setTitle("역할 바꾸기")
                .setMessage("어느 한쪽 기기가 '기다리는 쪽(광고)'을 지원하지 않을 때 씁니다.\n\n"
                        + "두 기기 모두에서 역할을 바꿔야 해요. 한쪽은 '찾는 쪽', 다른 쪽은 '기다리는 쪽'이어야 연결됩니다.\n\n"
                        + "지금: " + (isCentral() ? "찾는 쪽" : "기다리는 쪽") + " → 바꾼 후: " + (isCentral() ? "기다리는 쪽" : "찾는 쪽"))
                .setPositiveButton("바꾸기", (d, w) -> {
                    role = isCentral() ? "peripheral" : "central";
                    prefs.edit().putString("role", role).apply();
                    bindLink();
                    addSys("역할을 바꿨어요: " + (isCentral() ? "찾는 쪽" : "기다리는 쪽"), cWarn);
                })
                .setNegativeButton("취소", null)
                .show();
    }

    // ───────────────────────── 권한 / 블루투스 ─────────────────────────

    private List<String> missingPermissions() {
        List<String> need = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= 31) {
            need.add(Manifest.permission.BLUETOOTH_CONNECT);
            need.add(isCentral() ? Manifest.permission.BLUETOOTH_SCAN : Manifest.permission.BLUETOOTH_ADVERTISE);
        } else if (isCentral()) {
            need.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        List<String> missing = new ArrayList<>();
        for (String p : need) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) missing.add(p);
        }
        return missing;
    }

    private boolean bluetoothOn() {
        BluetoothManager bm = (BluetoothManager) getSystemService(BLUETOOTH_SERVICE);
        BluetoothAdapter a = bm == null ? null : bm.getAdapter();
        return a != null && a.isEnabled();
    }

    private void withBluetoothReady(Runnable action) {
        BluetoothManager bm = (BluetoothManager) getSystemService(BLUETOOTH_SERVICE);
        if (bm == null || bm.getAdapter() == null) {
            addSys("이 기기에는 블루투스가 없어요.", cWarn);
            return;
        }
        List<String> missing = missingPermissions();
        if (!missing.isEmpty()) {
            pendingAction = action;
            requestPermissions(missing.toArray(new String[0]), REQ_PERMS);
            return;
        }
        if (!bluetoothOn()) {
            pendingAction = action;
            try {
                startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), REQ_ENABLE_BT);
            } catch (Exception e) {
                openBluetoothSettings();
            }
            return;
        }
        action.run();
    }

    private void openBluetoothSettings() {
        addSys("블루투스를 켜 주세요. (퀘스트: 설정 → 기기 → 블루투스)", cWarn);
        try {
            startActivity(new Intent(Settings.ACTION_BLUETOOTH_SETTINGS));
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode != REQ_PERMS) return;
        if (missingPermissions().isEmpty()) {
            Runnable a = pendingAction;
            pendingAction = null;
            if (a != null) withBluetoothReady(a);
        } else {
            pendingAction = null;
            addSys("'근처 기기' 권한이 있어야 블루투스로 연결할 수 있어요. 다시 누르거나 설정 → 앱 → 권한에서 허용하세요.", cWarn);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQ_ENABLE_BT) return;
        Runnable a = pendingAction;
        pendingAction = null;
        if (bluetoothOn()) {
            if (a != null) a.run();
        } else {
            openBluetoothSettings();
        }
    }

    // ───────────────────────── 링크 콜백 ─────────────────────────

    @Override
    public void onState(int state, String detail) {
        int dot;
        switch (state) {
            case BaseLink.READY: dot = cOk; break;
            case BaseLink.WAITING:
            case BaseLink.CONNECTING: dot = cWarn; break;
            default: dot = cMuted;
        }
        String text = (state == BaseLink.READY && peerName != null) ? "연결 완료 · " + peerName : detail;
        SpannableStringBuilder sb = new SpannableStringBuilder("● ");
        sb.setSpan(new ForegroundColorSpan(dot), 0, 1, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        sb.append(text);
        statusText.setText(sb);

        primaryBtn.setEnabled(state == BaseLink.IDLE || state == BaseLink.WAITING);
        switch (state) {
            case BaseLink.IDLE:
                primaryBtn.setText(isCentral() ? "상대 기기 찾기" : "연결 대기 시작");
                break;
            case BaseLink.WAITING:
                primaryBtn.setText(isCentral() ? "찾기 중지" : "대기 중지");
                break;
            case BaseLink.CONNECTING:
                primaryBtn.setText("연결 중…");
                break;
            default:
                primaryBtn.setText("연결됨");
        }
        disconnectBtn.setVisibility(state == BaseLink.CONNECTING || state == BaseLink.READY ? View.VISIBLE : View.GONE);
        sendBtn.setEnabled(state == BaseLink.READY);
        pingBtn.setEnabled(state == BaseLink.READY);

        if (link instanceof PeripheralLink && state != BaseLink.IDLE) {
            codeText.setText("연결 코드 " + ((PeripheralLink) link).getCode());
            codeText.setVisibility(View.VISIBLE);
        } else {
            codeText.setVisibility(View.GONE);
        }
        if (state != BaseLink.WAITING) peerList.removeAllViews();

        if (state == BaseLink.READY && sLastState != BaseLink.READY) {
            addSys("연결됐어요. 이제 메시지를 주고받을 수 있어요.", cOk);
        } else if (state == BaseLink.IDLE) {
            peerName = null;
        }
        sLastState = state;
    }

    @Override
    public void onLog(String line) {
        addSys(line, cWarn);
    }

    @Override
    public void onMessage(char type, String body) {
        switch (type) {
            case Proto.TEXT:
                addChat(peerName != null ? peerName : "상대", body, cText);
                break;
            case Proto.HELLO:
                peerName = body;
                addSys("상대 기기: " + body, cMuted);
                onState(link.getState(), "연결 완료");
                break;
            case Proto.PONG:
                try {
                    long rtt = SystemClock.elapsedRealtime() - Long.parseLong(body);
                    addSys("응답속도(왕복): " + rtt + " ms", cOk);
                } catch (NumberFormatException ignored) {
                }
                break;
            default:
                break;
        }
    }

    @Override
    public void onPeers(List<CentralLink.Peer> peers) {
        peerList.removeAllViews();
        if (!(link instanceof CentralLink) || link.getState() != BaseLink.WAITING) return;
        peers.sort((a, b) -> Integer.compare(b.rssi, a.rssi));
        for (CentralLink.Peer p : peers) {
            Button b = new Button(this);
            String signal = p.rssi > -60 ? "강함" : p.rssi > -80 ? "보통" : "약함";
            b.setText("연결: 코드 " + (p.code != null ? p.code : "????") + " · 신호 " + signal + " (" + p.rssi + " dBm)");
            b.setAllCaps(false);
            b.setOnClickListener(v -> ((CentralLink) link).connect(p));
            peerList.addView(b, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        }
    }

    // ───────────────────────── 기록 ─────────────────────────

    private void addChat(String who, String text, int color) {
        int start = sLog.length();
        sLog.append(timeFmt.format(new Date())).append("  ");
        sLog.setSpan(new ForegroundColorSpan(cMuted), start, sLog.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        int w = sLog.length();
        sLog.append(who).append(": ");
        sLog.setSpan(new ForegroundColorSpan(color), w, sLog.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        sLog.setSpan(new StyleSpan(Typeface.BOLD), w, sLog.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        sLog.append(text).append('\n');
        flushLog();
    }

    private void addSys(String text, int color) {
        int start = sLog.length();
        sLog.append(timeFmt.format(new Date())).append("  ").append(text).append('\n');
        sLog.setSpan(new ForegroundColorSpan(color), start, sLog.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        flushLog();
    }

    private void flushLog() {
        if (sLog.length() > MAX_LOG_CHARS) {
            int cut = sLog.length() - MAX_LOG_CHARS / 2;
            int nl = sLog.toString().indexOf('\n', cut);
            sLog.delete(0, nl < 0 ? cut : nl + 1);
        }
        logText.setText(sLog);
        logScroll.post(() -> logScroll.fullScroll(View.FOCUS_DOWN));
    }

    @Override
    protected void onDestroy() {
        try {
            unregisterReceiver(btReceiver);
        } catch (IllegalArgumentException ignored) {
        }
        if (link != null) link.setListener(null);
        if (isFinishing() && sLink != null) {
            // 앱을 완전히 닫으면 연결도 정리
            sLink.stop();
            sLink.setListener(null);
            sLink = null;
            sLog.clear();
        }
        super.onDestroy();
    }
}

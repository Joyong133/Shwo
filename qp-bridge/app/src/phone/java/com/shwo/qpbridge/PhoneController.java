package com.shwo.qpbridge;

import android.content.Context;
import android.graphics.Path;
import android.graphics.Point;
import android.hardware.display.DisplayManager;
import android.os.Handler;
import android.os.Looper;
import android.view.Display;

import java.nio.ByteBuffer;

/** 휴대폰 쪽 두뇌: 퀘스트에서 온 명령을 화면 공유 서비스·접근성 서비스로 전달하고, 상태를 알려줌. */
final class PhoneController implements Hub.Listener {

    private static PhoneController instance;

    static synchronized PhoneController get(Context c) {
        if (instance == null) instance = new PhoneController(c.getApplicationContext());
        return instance;
    }

    private final Context ctx;
    private final Hub hub;
    private final Handler main = new Handler(Looper.getMainLooper());
    private boolean wasReady;

    private PhoneController(Context ctx) {
        this.ctx = ctx;
        hub = Hub.get(ctx);
        hub.addListener(this);
    }

    /** 퀘스트 화면에 띄울 안내 */
    void sendStatus() {
        String s;
        if (!MirrorService.isRunning()) s = "휴대폰에서 '화면 공유 시작'을 눌러 주세요.";
        else if (!RemoteControlService.isOn()) s = "보기만 가능해요. 휴대폰에서 '원격 조작 권한'을 켜면 조작할 수 있어요.";
        else s = "";
        hub.send(Proto.STATUS, Proto.utf8(s));
    }

    void onSharingChanged() {
        sendStatus();
        hub.notifyState();
    }

    void onAccessibilityChanged() {
        main.post(() -> {
            sendStatus();
            hub.notifyState();
        });
    }

    @Override
    public void onHubState() {
        boolean ready = hub.isReady();
        if (ready && !wasReady) sendStatus();
        wasReady = ready;
        MirrorService s = MirrorService.instance;
        if (s != null) s.onLinkChanged();
    }

    /** 휴대폰 기록을 퀘스트 기록창에도 보냄 (문제 찾기용). 앞의 "HH:mm:ss  " 는 뺌 */
    @Override
    public void onLog(String line) {
        if (hub.isReady()) hub.send(Proto.LOG, Proto.utf8(line.length() > 10 ? line.substring(10) : line));
    }

    @Override
    public void onMessage(byte type, byte[] p) {
        main.post(() -> handle(type, p));
    }

    private void handle(byte type, byte[] p) {
        MirrorService s = MirrorService.instance;
        switch (type) {
            case Proto.REQUEST_KEYFRAME:
                if (s != null) s.onKeyframeRequest();
                else sendStatus();
                break;
            case Proto.SET_QUALITY:
                if (p.length > 0) {
                    if (s != null) s.setQuality(p[0]); // 저장도 여기서 함
                    else ctx.getSharedPreferences("qpbridge", Context.MODE_PRIVATE).edit().putInt("quality", p[0]).apply();
                }
                break;
            case Proto.GESTURE:
                gesture(p);
                break;
            case Proto.GLOBAL:
                if (p.length > 0 && control() != null) control().global(p[0]);
                break;
            case Proto.TEXT:
                if (control() != null && !control().typeText(Proto.str(p)))
                    hub.send(Proto.STATUS, Proto.utf8("글자를 넣을 입력칸이 없어요. 먼저 휴대폰 화면의 입력칸을 누르세요."));
                break;
            case Proto.BACKSPACE:
                if (control() != null) control().backspace();
                break;
            default:
                break;
        }
    }

    private RemoteControlService control() {
        RemoteControlService rc = RemoteControlService.instance;
        if (rc == null) sendStatus();
        return rc;
    }

    private void gesture(byte[] p) {
        RemoteControlService rc = control();
        if (rc == null || p.length < 6) return;
        ByteBuffer b = ByteBuffer.wrap(p);
        int duration = b.getInt();
        int n = b.getShort() & 0xFFFF;
        if (n == 0 || b.remaining() < n * 4) return;
        Point real = realSize();
        MirrorService s = MirrorService.instance;
        int fw = s != null && s.frameW > 0 ? s.frameW : real.x;
        int fh = s != null && s.frameH > 0 ? s.frameH : real.y;
        // 영상 안에서 화면이 차지하는 영역(여백 보정)
        float sc = Math.min(fw / (float) real.x, fh / (float) real.y);
        float ox = (fw - real.x * sc) / 2f, oy = (fh - real.y * sc) / 2f;
        Path path = new Path();
        for (int i = 0; i < n; i++) {
            float nx = (b.getShort() & 0xFFFF) / 65535f;
            float ny = (b.getShort() & 0xFFFF) / 65535f;
            float x = clamp((nx * fw - ox) / sc, real.x - 1);
            float y = clamp((ny * fh - oy) / sc, real.y - 1);
            if (i == 0) path.moveTo(x, y);
            else path.lineTo(x, y);
        }
        rc.gesture(path, duration);
    }

    private static float clamp(float v, float max) {
        return v < 0 ? 0 : (v > max ? max : v);
    }

    private Point realSize() {
        DisplayManager dm = (DisplayManager) ctx.getSystemService(Context.DISPLAY_SERVICE);
        Point p = new Point();
        //noinspection deprecation
        dm.getDisplay(Display.DEFAULT_DISPLAY).getRealSize(p);
        return p;
    }
}

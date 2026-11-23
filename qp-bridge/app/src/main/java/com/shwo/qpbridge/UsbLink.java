package com.shwo.qpbridge;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbAccessory;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.os.ParcelFileDescriptor;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * USB 케이블 연결 (Android Open Accessory).
 * USB 호스트가 된 쪽이 상대를 '액세서리 모드'로 바꾸고, 바뀐 쪽은 액세서리로 연결을 엽니다.
 * 어느 기기가 호스트가 되든 동작하도록 두 역할을 모두 구현했습니다.
 */
public final class UsbLink extends Link {

    private static final int CHUNK = 16384;
    private static final int AOA_VID = 0x18D1;

    private interface Io {
        /** 읽은 바이트 수. 0 이하면 아직 데이터 없음 */
        int read(byte[] buf) throws IOException;

        void write(byte[] b, int off, int len) throws IOException;

        void close();

        boolean matches(Object usbThing);
    }

    private final UsbManager um;
    private final String permissionAction;
    private final ExecutorService control = Executors.newSingleThreadExecutor();
    private final Set<String> asked = new HashSet<>();
    private final LinkedBlockingQueue<byte[]> outQueue = new LinkedBlockingQueue<>();
    private volatile Io io;
    private Thread reader, writer;
    private boolean started;

    public UsbLink(Context ctx) {
        super(ctx);
        um = (UsbManager) this.ctx.getSystemService(Context.USB_SERVICE);
        permissionAction = this.ctx.getPackageName() + ".USB_PERMISSION";
    }

    @Override
    public String label() {
        return "USB";
    }

    @Override
    public void start() {
        if (started || um == null) return;
        started = true;
        IntentFilter f = new IntentFilter();
        f.addAction(permissionAction);
        f.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        f.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
        f.addAction(UsbManager.ACTION_USB_ACCESSORY_DETACHED);
        if (Build.VERSION.SDK_INT >= 33) ctx.registerReceiver(receiver, f, Context.RECEIVER_NOT_EXPORTED);
        else ctx.registerReceiver(receiver, f);
        setState(WAITING, "USB 케이블 대기");
        scan();
    }

    @Override
    public void stop() {
        if (!started) return;
        started = false;
        try {
            ctx.unregisterReceiver(receiver);
        } catch (IllegalArgumentException ignored) {
        }
        closeIo(null);
        setState(IDLE, "USB 꺼짐");
    }

    @Override
    public void disconnect() {
        closeIo("USB 연결을 끊었어요.");
    }

    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String a = intent.getAction();
            if (permissionAction.equals(a)) {
                if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) scan();
                else log("USB 사용을 허용하지 않았어요. 케이블을 다시 꽂으면 다시 물어봅니다.");
            } else if (UsbManager.ACTION_USB_DEVICE_ATTACHED.equals(a)) {
                main.postDelayed(UsbLink.this::scan, 300);
            } else if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(a)) {
                UsbDevice d = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                if (d != null) asked.remove(d.getDeviceName());
                Io cur = io;
                if (cur != null && d != null && cur.matches(d)) closeIo("USB 케이블이 빠졌어요.");
            } else if (UsbManager.ACTION_USB_ACCESSORY_DETACHED.equals(a)) {
                Io cur = io;
                if (cur != null && cur.matches(null)) closeIo("USB 케이블이 빠졌어요.");
            }
        }
    };

    /** 연결 가능한 USB 상대를 찾아서 연결 (메인 스레드). 액티비티 onResume 에서도 호출 */
    public void scan() {
        if (!started || io != null || um == null) return;
        // 1) 이 기기가 액세서리가 된 경우
        UsbAccessory[] accs = um.getAccessoryList();
        if (accs != null) {
            for (UsbAccessory acc : accs) {
                if (!Proto.AOA_MANUFACTURER.equals(acc.getManufacturer()) || !Proto.AOA_MODEL.equals(acc.getModel())) continue;
                if (um.hasPermission(acc)) {
                    openAccessory(acc);
                    return;
                }
                if (asked.add("acc")) um.requestPermission(acc, permissionIntent());
                return;
            }
        }
        // 2) 이 기기가 USB 호스트인 경우
        for (UsbDevice d : um.getDeviceList().values()) {
            if (!looksLikePhoneOrHeadset(d)) continue;
            if (!um.hasPermission(d)) {
                if (asked.add(d.getDeviceName())) {
                    log("상대 기기를 USB로 쓰려면 화면에 뜨는 USB 허용 창에서 '확인'을 누르세요.");
                    um.requestPermission(d, permissionIntent());
                }
                continue;
            }
            if (isAccessoryMode(d)) {
                openHost(d);
                return;
            }
            UsbDevice target = d;
            control.execute(() -> switchToAccessory(target));
            return;
        }
    }

    private PendingIntent permissionIntent() {
        Intent i = new Intent(permissionAction).setPackage(ctx.getPackageName());
        int flags = Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0;
        return PendingIntent.getBroadcast(ctx, 0, i, flags | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private static boolean isAccessoryMode(UsbDevice d) {
        return d.getVendorId() == AOA_VID && d.getProductId() >= 0x2D00 && d.getProductId() <= 0x2D05;
    }

    /** 키보드·저장장치·허브 같은 것은 건드리지 않음 */
    private static boolean looksLikePhoneOrHeadset(UsbDevice d) {
        if (isAccessoryMode(d)) return true;
        for (int i = 0; i < d.getInterfaceCount(); i++) {
            int c = d.getInterface(i).getInterfaceClass();
            if (c == UsbConstants.USB_CLASS_VENDOR_SPEC || c == UsbConstants.USB_CLASS_STILL_IMAGE) return true;
        }
        return false;
    }

    // ── 호스트 쪽: 상대를 액세서리 모드로 전환 ──

    private void switchToAccessory(UsbDevice d) {
        UsbDeviceConnection c = um.openDevice(d);
        if (c == null) return;
        try {
            byte[] ver = new byte[2];
            int r = c.controlTransfer(0xC0, 51, 0, 0, ver, 2, 1000);
            if (r != 2 || ((ver[1] << 8) | (ver[0] & 0xFF)) < 1) {
                log("연결된 USB 기기가 QP브릿지 연결을 지원하지 않아요.");
                return;
            }
            String[] s = {Proto.AOA_MANUFACTURER, Proto.AOA_MODEL, "QP브릿지 화면 연결", "2.0", "", "qpbridge"};
            for (int i = 0; i < s.length; i++) {
                byte[] b = (s[i] + "\0").getBytes(StandardCharsets.UTF_8);
                c.controlTransfer(0x40, 52, 0, i, b, b.length, 1000);
            }
            c.controlTransfer(0x40, 53, 0, 0, null, 0, 1000);
            log("상대 기기를 USB 연결 모드로 바꾸는 중… 상대 기기에 앱 열기 창이 뜨면 '확인'을 누르세요.");
        } finally {
            c.close();
        }
        // 상대가 다시 연결되면 ATTACHED 방송이 오지만, 혹시 몰라 몇 번 더 찾아봄
        main.postDelayed(this::scan, 1500);
        main.postDelayed(this::scan, 3500);
        main.postDelayed(this::scan, 6000);
    }

    private void openHost(UsbDevice d) {
        UsbInterface found = null;
        UsbEndpoint in = null, out = null;
        for (int i = 0; i < d.getInterfaceCount() && found == null; i++) {
            UsbInterface itf = d.getInterface(i);
            if (itf.getInterfaceClass() != UsbConstants.USB_CLASS_VENDOR_SPEC || itf.getInterfaceSubclass() == 0x42)
                continue; // 0x42 = adb
            UsbEndpoint ei = null, eo = null;
            for (int e = 0; e < itf.getEndpointCount(); e++) {
                UsbEndpoint ep = itf.getEndpoint(e);
                if (ep.getType() != UsbConstants.USB_ENDPOINT_XFER_BULK) continue;
                if (ep.getDirection() == UsbConstants.USB_DIR_IN) ei = ep;
                else eo = ep;
            }
            if (ei != null && eo != null) {
                found = itf;
                in = ei;
                out = eo;
            }
        }
        if (found == null) {
            log("USB 연결 통로를 찾지 못했어요.");
            return;
        }
        UsbDeviceConnection conn = um.openDevice(d);
        if (conn == null || !conn.claimInterface(found, true)) {
            if (conn != null) conn.close();
            log("USB 연결을 열 수 없어요.");
            return;
        }
        startIo(new HostIo(d, conn, found, in, out));
    }

    private void openAccessory(UsbAccessory acc) {
        ParcelFileDescriptor pfd;
        try {
            pfd = um.openAccessory(acc);
        } catch (SecurityException e) {
            pfd = null;
        }
        if (pfd == null) {
            log("USB 액세서리를 열 수 없어요. 케이블을 다시 꽂아 보세요.");
            return;
        }
        startIo(new AccessoryIo(pfd));
    }

    private static final class HostIo implements Io {
        final UsbDevice device;
        final UsbDeviceConnection conn;
        final UsbInterface itf;
        final UsbEndpoint in, out;
        volatile boolean closed;

        HostIo(UsbDevice d, UsbDeviceConnection c, UsbInterface i, UsbEndpoint in, UsbEndpoint out) {
            device = d;
            conn = c;
            itf = i;
            this.in = in;
            this.out = out;
        }

        private int fastFailures;

        @Override
        public int read(byte[] buf) throws IOException {
            if (closed) throw new IOException("closed");
            long t0 = System.nanoTime();
            int n = conn.bulkTransfer(in, buf, buf.length, 500); // -1 = 시간 초과(데이터 없음) 또는 오류
            if (n >= 0) {
                fastFailures = 0;
                return n;
            }
            // 시간 초과가 아닌데 바로 실패하면 케이블이 빠진 것 → 50번 연속이면 끊김 처리
            if (System.nanoTime() - t0 < 50_000_000L) {
                if (++fastFailures > 50) throw new IOException("read failed");
                try {
                    Thread.sleep(5);
                } catch (InterruptedException e) {
                    throw new IOException("interrupted");
                }
            } else {
                fastFailures = 0;
            }
            return 0;
        }

        @Override
        public void write(byte[] b, int off, int len) throws IOException {
            int fails = 0;
            while (len > 0) {
                if (closed) throw new IOException("closed");
                int n = conn.bulkTransfer(out, b, off, len, 3000);
                if (n < 0) {
                    if (++fails >= 3) throw new IOException("write failed");
                    continue;
                }
                off += n;
                len -= n;
            }
        }

        @Override
        public void close() {
            closed = true;
            try {
                conn.releaseInterface(itf);
            } catch (Exception ignored) {
            }
            conn.close();
        }

        @Override
        public boolean matches(Object thing) {
            return thing instanceof UsbDevice && ((UsbDevice) thing).getDeviceName().equals(device.getDeviceName());
        }
    }

    private static final class AccessoryIo implements Io {
        final ParcelFileDescriptor pfd;
        final FileInputStream in;
        final FileOutputStream out;

        AccessoryIo(ParcelFileDescriptor p) {
            pfd = p;
            in = new FileInputStream(p.getFileDescriptor());
            out = new FileOutputStream(p.getFileDescriptor());
        }

        @Override
        public int read(byte[] buf) throws IOException {
            int n = in.read(buf, 0, buf.length);
            if (n < 0) throw new IOException("eof");
            return n;
        }

        @Override
        public void write(byte[] b, int off, int len) throws IOException {
            out.write(b, off, len);
        }

        @Override
        public void close() {
            try {
                pfd.close();
            } catch (IOException ignored) {
            }
        }

        @Override
        public boolean matches(Object thing) {
            return thing == null;
        }
    }

    // ── 공통 입출력 ──

    private void startIo(Io newIo) {
        outQueue.clear();
        pending.set(0);
        io = newIo;
        reader = new Thread(() -> readLoop(newIo), "usb-read");
        writer = new Thread(() -> writeLoop(newIo), "usb-write");
        reader.start();
        writer.start();
        setState(READY, "USB로 연결됨");
    }

    private void closeIo(String reason) {
        Io cur = io;
        if (cur == null) return;
        io = null;
        cur.close();
        if (reader != null) reader.interrupt();
        if (writer != null) writer.interrupt();
        outQueue.clear();
        pending.set(0);
        asked.clear();
        if (reason != null) log(reason);
        setState(started ? WAITING : IDLE, started ? "USB 케이블 대기" : "USB 꺼짐");
    }

    private void failFromThread(Io which, String reason) {
        main.post(() -> {
            if (io == which) closeIo(reason);
        });
    }

    private void readLoop(Io myIo) {
        byte[] buf = new byte[CHUNK];
        FrameParser parser = new FrameParser();
        try {
            while (io == myIo) {
                int n = myIo.read(buf);
                if (n > 0) parser.feed(buf, n, this::deliver);
            }
        } catch (IOException e) {
            failFromThread(myIo, "USB 연결이 끊어졌어요.");
        }
    }

    private void writeLoop(Io myIo) {
        try {
            while (io == myIo) {
                byte[] frame = outQueue.take();
                // 전송 단위가 USB 패킷 크기의 배수로 끝나면 받는 쪽이 멈출 수 있어서 마지막 1바이트를 따로 보냄
                for (int off = 0; off < frame.length; ) {
                    int n = Math.min(CHUNK, frame.length - off);
                    if (n < CHUNK && n > 1 && n % 64 == 0) {
                        myIo.write(frame, off, n - 1);
                        myIo.write(frame, off + n - 1, 1);
                    } else {
                        myIo.write(frame, off, n);
                    }
                    off += n;
                }
                pending.addAndGet(-frame.length);
            }
        } catch (InterruptedException ignored) {
        } catch (IOException e) {
            failFromThread(myIo, "USB 전송 실패. 케이블을 확인하세요.");
        }
    }

    @Override
    public boolean send(byte type, byte[] payload) {
        if (io == null || state != READY) return false;
        byte[] frame = FrameParser.frame(type, payload);
        pending.addAndGet(frame.length);
        outQueue.offer(frame);
        return true;
    }
}

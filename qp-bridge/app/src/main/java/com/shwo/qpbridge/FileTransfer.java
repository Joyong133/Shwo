package com.shwo.qpbridge;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.MediaStore;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.zip.CRC32;

/**
 * 퀘스트 ↔ 휴대폰 파일 주고받기. 지금 쓰는 연결(USB / 블루투스 고속 / 블루투스)로 보냄 — Wi-Fi·데이터 불필요.
 * 받은 파일은 '다운로드/QPBridge' 폴더에 저장.
 */
public final class FileTransfer implements Hub.Listener {

    public interface Ui {
        /** 진행 상황 한 줄 (빈 문자열이면 숨김). 메인 스레드 */
        void onTransferText(String text, boolean active);

        /** 파일을 받음. 메인 스레드 */
        void onReceived(Received r);
    }

    public static final class Received {
        public final Uri uri; // 열 수 없으면 null
        public final String name, mime, where;
        public final long size;

        Received(Uri uri, String name, String mime, String where, long size) {
            this.uri = uri;
            this.name = name;
            this.mime = mime;
            this.where = where;
            this.size = size;
        }
    }

    public static final String FOLDER = "QPBridge";

    private static FileTransfer instance;

    public static synchronized FileTransfer get(Context c) {
        if (instance == null) instance = new FileTransfer(c.getApplicationContext());
        return instance;
    }

    private final Context ctx;
    private final Hub hub;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService sender = Executors.newSingleThreadExecutor();
    private final ExecutorService receiver = Executors.newSingleThreadExecutor();
    private final SecureRandom random = new SecureRandom();
    private final AtomicInteger waiting = new AtomicInteger();
    private volatile int cancelGeneration;
    private volatile Ui ui;
    private volatile String sendText = "", recvText = "";
    private volatile boolean sendActive, recvActive;
    public final List<Received> received = new ArrayList<>();

    // 받는 쪽 상태 (receiver 스레드에서만)
    private final Map<Long, FileCodec.Incoming> incoming = new HashMap<>();
    private final Map<Long, Uri> incomingUri = new HashMap<>();
    private final Map<Long, File> incomingFile = new HashMap<>();
    private final Map<Long, long[]> incomingClock = new HashMap<>(); // {시작 시각, 마지막 표시 시각}

    private FileTransfer(Context ctx) {
        this.ctx = ctx;
        hub = Hub.get(ctx);
        hub.addListener(this);
    }

    public void setUi(Ui u) {
        ui = u;
        if (u != null) postText();
    }

    // ───────────────────────── 보내기 ─────────────────────────

    public void send(List<Uri> uris) {
        int gen = cancelGeneration;
        for (Uri u : uris) {
            waiting.incrementAndGet();
            sender.execute(() -> {
                waiting.decrementAndGet();
                if (gen == cancelGeneration) sendOne(u, gen);
            });
        }
    }

    /** 보내는 중인 것과 대기 중인 것 모두 취소, 받는 중인 것도 취소 */
    public void cancelAll() {
        cancelGeneration++;
        receiver.execute(() -> {
            for (Long id : new ArrayList<>(incoming.keySet())) {
                hub.send(Proto.FILE_CANCEL, FileCodec.idAndText(id, "받는 쪽에서 취소했어요"));
                dropIncoming(id, "받기를 취소했어요.");
            }
        });
    }

    private static int window(int kind) {
        return kind == Hub.KIND_USB ? 1 << 20 : kind == Hub.KIND_FAST ? 128 * 1024 : 24 * 1024;
    }

    private static int chunkSize(int kind) {
        return kind == Hub.KIND_USB ? 64 * 1024 : kind == Hub.KIND_FAST ? 16 * 1024 : 4 * 1024;
    }

    private void sendOne(Uri uri, int gen) {
        ContentResolver cr = ctx.getContentResolver();
        String name = "file";
        long size = -1;
        try (Cursor c = cr.query(uri, new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE}, null, null, null)) {
            if (c != null && c.moveToFirst()) {
                if (!c.isNull(0)) name = c.getString(0);
                if (!c.isNull(1)) size = c.getLong(1);
            }
        } catch (Exception ignored) {
        }
        String mime = null;
        try {
            mime = cr.getType(uri);
        } catch (Exception ignored) {
        }
        if ("file".equals(name)) {
            // 이름을 못 얻으면 주소 끝부분 + MIME 에 맞는 확장자로
            String seg = uri.getLastPathSegment();
            if (seg != null && !seg.isEmpty()) name = seg.substring(seg.lastIndexOf('/') + 1);
            String ext = mime == null ? null : android.webkit.MimeTypeMap.getSingleton().getExtensionFromMimeType(mime);
            if (ext != null && !name.toLowerCase(Locale.ROOT).endsWith("." + ext)) name = name + "." + ext;
        }
        name = FileCodec.safeName(name);

        // 연결될 때까지 최대 1분 기다림 (공유하기로 넘겨받았는데 아직 연결 전일 수 있음)
        long until = SystemClock.elapsedRealtime() + 60_000;
        while (!hub.isReady() && SystemClock.elapsedRealtime() < until && gen == cancelGeneration) {
            setSend("연결을 기다리는 중… (" + name + ")", true);
            sleep(500);
        }
        if (!hub.isReady()) {
            setSend("연결되어 있지 않아 '" + name + "' 을(를) 보내지 못했어요.", false);
            hub.log("파일 보내기 실패: 연결 안 됨 (" + name + ")");
            return;
        }
        if (size < 0) size = measure(cr, uri);
        if (size < 0) {
            setSend("'" + name + "' 을(를) 읽을 수 없어요.", false);
            return;
        }

        long id = random.nextLong();
        Link link = hub.active();
        int kind = hub.kind();
        hub.log("파일 보내기 시작: " + name + " (" + human(size) + ", " + link.label() + ")");
        hub.send(Proto.FILE_OFFER, FileCodec.offer(id, size, name, mime));
        CRC32 crc = new CRC32();
        long sent = 0, start = SystemClock.elapsedRealtime(), lastUi = 0;
        byte[] buf = new byte[chunkSize(kind)];
        try (InputStream in = cr.openInputStream(uri)) {
            if (in == null) throw new IOException("열 수 없음");
            while (true) {
                if (gen != cancelGeneration) {
                    hub.send(Proto.FILE_CANCEL, FileCodec.idAndText(id, "보내는 쪽에서 취소했어요"));
                    setSend("'" + name + "' 보내기를 취소했어요.", false);
                    return;
                }
                if (hub.active() != link) throw new IOException("연결이 끊기거나 바뀌었어요");
                if (hub.pendingBytes() > window(kind)) { // 흐름 제어: 연결이 밀리면 잠깐 기다림
                    sleep(5);
                    continue;
                }
                int n = in.read(buf);
                if (n < 0) break;
                if (n == 0) continue;
                if (sent + n > size) throw new IOException("파일 크기가 바뀌었어요");
                crc.update(buf, 0, n);
                hub.send(Proto.FILE_CHUNK, FileCodec.chunk(id, sent, buf, n));
                sent += n;
                long now = SystemClock.elapsedRealtime();
                if (now - lastUi > 300) {
                    lastUi = now;
                    setSend(progress("보내는 중", name, sent, size, start, now) + queueNote(), true);
                }
            }
            if (sent != size) throw new IOException("파일 크기가 바뀌었어요");
            hub.send(Proto.FILE_END, FileCodec.end(id, size, crc.getValue()));
            setSend("'" + name + "' 을(를) 다 보냈어요. 상대 기기가 저장하는 중…" + queueNote(), waiting.get() > 0);
        } catch (Exception e) {
            if (hub.isReady()) hub.send(Proto.FILE_CANCEL, FileCodec.idAndText(id, "보내는 쪽 오류"));
            setSend("'" + name + "' 보내기 실패: " + (e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage())
                    + ". 다시 보내 주세요.", false);
            hub.log("파일 보내기 실패: " + name + " — " + e.getMessage());
        }
    }

    private String queueNote() {
        int w = waiting.get();
        return w > 0 ? " · 남은 파일 " + w + "개" : "";
    }

    private static long measure(ContentResolver cr, Uri uri) {
        try (InputStream in = cr.openInputStream(uri)) {
            if (in == null) return -1;
            byte[] b = new byte[65536];
            long t = 0;
            int n;
            while ((n = in.read(b)) > 0) t += n;
            return t;
        } catch (Exception e) {
            return -1;
        }
    }

    // ───────────────────────── 받기 ─────────────────────────

    @Override
    public void onMessage(byte type, byte[] p) {
        switch (type) {
            case Proto.FILE_OFFER:
            case Proto.FILE_CHUNK:
            case Proto.FILE_END:
            case Proto.FILE_CANCEL:
                receiver.execute(() -> handleIncoming(type, p));
                break;
            case Proto.FILE_DONE: {
                java.nio.ByteBuffer b = java.nio.ByteBuffer.wrap(p);
                b.getLong();
                boolean ok = b.get() == 1;
                byte[] t = new byte[b.remaining()];
                b.get(t);
                String where = Proto.str(t);
                String msg = ok ? "상대 기기에 저장됨: " + where : "상대 기기가 저장하지 못했어요: " + where;
                hub.log(msg);
                setSend(msg + queueNote(), waiting.get() > 0);
                break;
            }
            default:
                break;
        }
    }

    @Override
    public void onHubState() {
        if (!hub.isReady()) {
            receiver.execute(() -> {
                for (Long id : new ArrayList<>(incoming.keySet())) dropIncoming(id, "연결이 끊겨서 받던 파일을 지웠어요. 다시 보내 달라고 하세요.");
            });
        }
    }

    private void handleIncoming(byte type, byte[] p) {
        try {
            if (type == Proto.FILE_OFFER) {
                FileCodec.Offer o = FileCodec.readOffer(p);
                startIncoming(o);
                return;
            }
            long id = FileCodec.readId(p);
            FileCodec.Incoming in = incoming.get(id);
            if (in == null) return;
            if (type == Proto.FILE_CANCEL) {
                byte[] t = new byte[p.length - 8];
                System.arraycopy(p, 8, t, 0, t.length);
                dropIncoming(id, "'" + in.offer.name + "' 받기가 취소됐어요 (" + Proto.str(t) + ").");
                return;
            }
            try {
                if (type == Proto.FILE_CHUNK) {
                    in.onChunk(p);
                    long[] clk = incomingClock.get(id);
                    long now = SystemClock.elapsedRealtime();
                    if (now - clk[1] > 300) {
                        clk[1] = now;
                        setRecv(progress("받는 중", in.offer.name, in.written, in.offer.size, clk[0], now), true);
                    }
                } else if (type == Proto.FILE_END) {
                    in.onEnd(p);
                    finishIncoming(id, in);
                }
            } catch (IOException e) {
                hub.send(Proto.FILE_DONE, FileCodec.done(id, false, e.getMessage()));
                dropIncoming(id, "'" + in.offer.name + "' 받기 실패: " + e.getMessage() + ". 다시 보내 주세요.");
            }
        } catch (Exception e) {
            hub.log("파일 받기 오류: " + e.getClass().getSimpleName());
        }
    }

    private String where() {
        return Build.VERSION.SDK_INT >= 29 ? "다운로드/" + FOLDER : "Android/data/" + ctx.getPackageName() + "/files/Download/" + FOLDER;
    }

    private void startIncoming(FileCodec.Offer o) throws IOException {
        OutputStream out;
        if (Build.VERSION.SDK_INT >= 29) {
            ContentValues v = new ContentValues();
            v.put(MediaStore.Downloads.DISPLAY_NAME, o.name);
            v.put(MediaStore.Downloads.MIME_TYPE, o.mime != null ? o.mime : "application/octet-stream");
            v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + FOLDER);
            v.put(MediaStore.Downloads.IS_PENDING, 1);
            Uri uri = ctx.getContentResolver().insert(MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY), v);
            if (uri == null) throw new IOException("저장 공간에 파일을 만들 수 없어요");
            out = ctx.getContentResolver().openOutputStream(uri);
            if (out == null) throw new IOException("저장 공간에 쓸 수 없어요");
            incomingUri.put(o.id, uri);
        } else {
            File dir = new File(ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), FOLDER);
            //noinspection ResultOfMethodCallIgnored
            dir.mkdirs();
            File f = unique(dir, o.name);
            out = new FileOutputStream(f);
            incomingFile.put(o.id, f);
        }
        incoming.put(o.id, new FileCodec.Incoming(o, new java.io.BufferedOutputStream(out, 256 * 1024)));
        long now = SystemClock.elapsedRealtime();
        incomingClock.put(o.id, new long[]{now, 0});
        hub.log("파일 받는 중: " + o.name + " (" + human(o.size) + ")");
        setRecv("받는 중: " + o.name + " (" + human(o.size) + ")", true);
    }

    private static File unique(File dir, String name) {
        File f = new File(dir, name);
        int dot = name.lastIndexOf('.');
        String base = dot > 0 ? name.substring(0, dot) : name, ext = dot > 0 ? name.substring(dot) : "";
        for (int i = 1; f.exists(); i++) f = new File(dir, base + " (" + i + ")" + ext);
        return f;
    }

    private void finishIncoming(long id, FileCodec.Incoming in) {
        incoming.remove(id);
        incomingClock.remove(id);
        Uri uri = incomingUri.remove(id);
        File file = incomingFile.remove(id);
        if (uri != null && Build.VERSION.SDK_INT >= 29) {
            ContentValues v = new ContentValues();
            v.put(MediaStore.Downloads.IS_PENDING, 0);
            ctx.getContentResolver().update(uri, v, null, null);
        }
        String where = where() + "/" + (file != null ? file.getName() : in.offer.name);
        hub.send(Proto.FILE_DONE, FileCodec.done(id, true, where));
        hub.log("파일 받음: " + where + " (" + human(in.offer.size) + ")");
        Received r = new Received(uri, in.offer.name, in.offer.mime, where, in.offer.size);
        setRecv("받음: " + in.offer.name + " → " + where(), incoming.size() > 0);
        main.post(() -> {
            received.add(0, r);
            Ui u = ui;
            if (u != null) u.onReceived(r);
        });
    }

    private void dropIncoming(long id, String why) {
        FileCodec.Incoming in = incoming.remove(id);
        incomingClock.remove(id);
        if (in != null) in.abort();
        Uri uri = incomingUri.remove(id);
        File file = incomingFile.remove(id);
        try {
            if (uri != null) ctx.getContentResolver().delete(uri, null, null);
            if (file != null) //noinspection ResultOfMethodCallIgnored
                file.delete();
        } catch (Exception ignored) {
        }
        hub.log(why);
        setRecv(why, incoming.size() > 0);
    }

    // ───────────────────────── 표시 ─────────────────────────

    private void setSend(String t, boolean active) {
        sendText = t;
        sendActive = active;
        postText();
    }

    private void setRecv(String t, boolean active) {
        recvText = t;
        recvActive = active;
        postText();
    }

    private void postText() {
        main.post(() -> {
            Ui u = ui;
            if (u == null) return;
            String s = sendText;
            if (!recvText.isEmpty()) s = s.isEmpty() ? recvText : s + "\n" + recvText;
            u.onTransferText(s, sendActive || recvActive);
        });
    }

    static String progress(String verb, String name, long done, long size, long start, long now) {
        double sec = Math.max(0.001, (now - start) / 1000.0);
        double rate = done / sec;
        String eta = rate > 1 && size > done ? " · 남은 시간 " + duration((long) ((size - done) / rate)) : "";
        int pct = size > 0 ? (int) (done * 100 / size) : 100;
        return verb + ": " + name + " " + pct + "% (" + human(done) + "/" + human(size) + ") · " + human((long) rate) + "/s" + eta;
    }

    static String duration(long s) {
        if (s < 60) return s + "초";
        if (s < 3600) return (s / 60) + "분 " + (s % 60) + "초";
        return (s / 3600) + "시간 " + (s % 3600 / 60) + "분";
    }

    public static String human(long b) {
        if (b < 1024) return b + "B";
        if (b < 1024 * 1024) return String.format(Locale.US, "%.1fKB", b / 1024.0);
        if (b < 1024L * 1024 * 1024) return String.format(Locale.US, "%.1fMB", b / 1048576.0);
        return String.format(Locale.US, "%.2fGB", b / 1073741824.0);
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ignored) {
        }
    }
}

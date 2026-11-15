package kr.shwo.sitegrabber;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.JsonReader;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class MainActivity extends Activity {
    private static final int REQ_ZIP = 1, REQ_TXT = 2;

    private EditText urlIn, maxIn;
    private CheckBox whole, images, js;
    private Button start, stop, saveZip, saveTxt;
    private ProgressBar progress;
    private TextView status;
    private ArrayAdapter<Crawler.Page> adapter;
    private final ArrayList<Crawler.Page> shown = new ArrayList<>();
    private final Handler ui = new Handler(Looper.getMainLooper());
    private Crawler crawler;
    private WebView renderView;
    private String host = "site";

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.main);
        urlIn = findViewById(R.id.url);
        maxIn = findViewById(R.id.max);
        whole = findViewById(R.id.whole);
        images = findViewById(R.id.images);
        js = findViewById(R.id.js);
        start = findViewById(R.id.start);
        stop = findViewById(R.id.stop);
        saveZip = findViewById(R.id.saveZip);
        saveTxt = findViewById(R.id.saveTxt);
        progress = findViewById(R.id.progress);
        status = findViewById(R.id.status);
        ListView list = findViewById(R.id.list);
        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, shown);
        list.setAdapter(adapter);
        list.setOnItemClickListener((parent, view, pos, id) -> showPage(shown.get(pos)));

        start.setOnClickListener(v -> begin());
        urlIn.setOnEditorActionListener((v, action, e) -> { if (action == EditorInfo.IME_ACTION_GO) { begin(); return true; } return false; });
        stop.setOnClickListener(v -> { if (crawler != null) crawler.stop(); stop.setEnabled(false); status.setText("지금 페이지까지 받고 멈춥니다…"); });
        saveZip.setOnClickListener(v -> createDoc("application/zip", host + ".zip", REQ_ZIP));
        saveTxt.setOnClickListener(v -> createDoc("text/plain", host + ".txt", REQ_TXT));
        handleShare(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) { super.onNewIntent(intent); handleShare(intent); }

    private void handleShare(Intent i) {
        if (i == null || !Intent.ACTION_SEND.equals(i.getAction())) return;
        String text = i.getStringExtra(Intent.EXTRA_TEXT);
        if (text == null) return;
        Matcher m = Pattern.compile("https?://\\S+").matcher(text);
        if (m.find()) urlIn.setText(m.group());
    }

    private void begin() {
        if (crawler != null && stop.isEnabled()) return;
        String url = urlIn.getText().toString().trim();
        if (url.isEmpty()) { urlIn.setError("주소를 입력하세요"); return; }
        if (!url.matches("(?i)^https?://.*")) url = "https://" + url;
        int max;
        try { max = Math.max(1, Integer.parseInt(maxIn.getText().toString().trim())); } catch (Exception e) { max = 300; }
        shown.clear();
        adapter.notifyDataSetChanged();
        progress.setProgress(0);
        try {
            host = Crawler.safe(Uri.parse(url).getHost());
            Crawler.Renderer r = js.isChecked() ? this::renderWithWebView : null;
            crawler = new Crawler(url, max, whole.isChecked(), images.isChecked(), r, new File(getCacheDir(), "crawl"), listener);
        } catch (Exception e) {
            status.setText("주소 형식이 올바르지 않습니다: " + e.getMessage());
            return;
        }
        if (js.isChecked() && renderView == null) {
            renderView = new WebView(this);
            WebSettings s = renderView.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
            s.setUserAgentString(s.getUserAgentString().replace("; wv", ""));
        }
        setRunning(true);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        final Crawler c = crawler;
        new Thread(c::run, "crawler").start();
    }

    private final Crawler.Listener listener = new Crawler.Listener() {
        @Override public void onPage(Crawler.Page p, int done, int max, int queued) {
            ui.post(() -> {
                shown.add(p);
                adapter.notifyDataSetChanged();
                progress.setProgress(Math.round(done * 100f / max));
                status.setText(done + "/" + max + " 페이지 · 대기 " + queued + " · 파일 " + crawler.files.size() + "\n" + p.url);
            });
        }
        @Override public void onLog(String msg) { ui.post(() -> status.setText(msg)); }
        @Override public void onFinish(String summary) {
            ui.post(() -> {
                status.setText(summary + "\n'전부 저장'으로 ZIP 파일을 만드세요.");
                progress.setProgress(100);
                setRunning(false);
                getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }
    };

    private void setRunning(boolean r) {
        start.setEnabled(!r);
        stop.setEnabled(r);
        boolean has = !r && crawler != null && !crawler.pages.isEmpty();
        saveZip.setEnabled(has);
        saveTxt.setEnabled(has);
    }

    /** JS 모드: 숨은 WebView로 페이지를 열고, 다 그려진 뒤의 HTML을 가져온다. 크롤러 스레드에서 호출. */
    private String renderWithWebView(String url) throws Exception {
        final String[] out = {null};
        final CountDownLatch latch = new CountDownLatch(1);
        ui.post(() -> {
            renderView.setWebViewClient(new WebViewClient() {
                boolean fired;
                @Override public void onPageFinished(WebView view, String u) {
                    if (fired) return;
                    fired = true;
                    ui.postDelayed(() -> view.evaluateJavascript("document.documentElement.outerHTML", value -> {
                        try {
                            JsonReader jr = new JsonReader(new StringReader(value));
                            jr.setLenient(true);
                            out[0] = jr.nextString();
                        } catch (Exception e) { out[0] = null; }
                        latch.countDown();
                    }), 2000);
                }
            });
            renderView.loadUrl(url);
        });
        if (!latch.await(45, TimeUnit.SECONDS)) throw new Exception("시간 초과");
        return out[0];
    }

    private void showPage(Crawler.Page p) {
        TextView tv = new TextView(this);
        tv.setTextIsSelectable(true);
        tv.setPadding(48, 24, 48, 24);
        tv.setText(p.url + "\n\n" + (p.error != null ? p.error : p.text));
        ScrollView sv = new ScrollView(this);
        sv.addView(tv);
        new AlertDialog.Builder(this).setTitle(p.error != null ? "실패" : (p.title.isEmpty() ? "(제목 없음)" : p.title))
                .setView(sv).setPositiveButton("닫기", null)
                .setNeutralButton("브라우저로 열기", (d, w) -> {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(p.url))); } catch (Exception ignored) { }
                }).show();
    }

    // ---------- 저장 (파일 위치는 사용자가 고름: 권한 필요 없음) ----------
    private void createDoc(String mime, String name, int req) {
        Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType(mime);
        i.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(i, req);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (res != RESULT_OK || data == null || data.getData() == null || crawler == null) return;
        final Uri uri = data.getData();
        final boolean zip = req == REQ_ZIP;
        status.setText("저장 중…");
        new Thread(() -> {
            try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                if (zip) writeZip(os); else os.write(allText().getBytes(StandardCharsets.UTF_8));
                ui.post(() -> { status.setText("저장했습니다."); Toast.makeText(this, "저장했습니다", Toast.LENGTH_SHORT).show(); });
            } catch (Exception e) {
                ui.post(() -> status.setText("저장하지 못했습니다: " + e.getMessage()));
            }
        }).start();
    }

    private String allText() {
        StringBuilder sb = new StringBuilder();
        String bar = "================================================================================\n";
        for (Crawler.Page p : crawler.pages) {
            if (p.error != null) continue;
            sb.append(bar).append(p.title).append('\n').append(p.url).append('\n').append(bar).append(p.text).append("\n\n");
        }
        return sb.toString();
    }

    private void writeZip(OutputStream os) throws Exception {
        try (ZipOutputStream z = new ZipOutputStream(os)) {
            put(z, "all_text.txt", allText().getBytes(StandardCharsets.UTF_8));
            StringBuilder csv = new StringBuilder("﻿url,title,html,text,text_chars,error\n");
            int n = 0;
            for (Crawler.Page p : crawler.pages) {
                n++;
                String html = "", txt = "";
                if (p.error == null) {
                    html = "pages/" + n + ".html";
                    txt = "text/" + n + ".txt";
                    put(z, txt, (p.title + "\n" + p.url + "\n\n" + p.text + "\n").getBytes(StandardCharsets.UTF_8));
                    if (p.htmlFile != null) putFile(z, html, new File(p.htmlFile));
                }
                csv.append(q(p.url)).append(',').append(q(p.title)).append(',').append(q(html)).append(',').append(q(txt))
                        .append(',').append(p.text == null ? 0 : p.text.length()).append(',').append(q(p.error)).append('\n');
            }
            put(z, "pages.csv", csv.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder fl = new StringBuilder("﻿url,file\n");
            for (String[] f : crawler.files) {
                putFile(z, f[1], new File(crawler.workDir, f[1]));
                fl.append(q(f[0])).append(',').append(q(f[1])).append('\n');
            }
            put(z, "files.csv", fl.toString().getBytes(StandardCharsets.UTF_8));
        }
    }

    private static String q(String s) { return "\"" + (s == null ? "" : s.replace("\"", "\"\"")) + "\""; }

    private static void put(ZipOutputStream z, String name, byte[] data) throws Exception {
        z.putNextEntry(new ZipEntry(name));
        z.write(data);
        z.closeEntry();
    }

    private static void putFile(ZipOutputStream z, String name, File f) throws Exception {
        if (!f.exists()) return;
        z.putNextEntry(new ZipEntry(name));
        byte[] buf = new byte[65536];
        try (FileInputStream in = new FileInputStream(f)) {
            int r;
            while ((r = in.read(buf)) > 0) z.write(buf, 0, r);
        }
        z.closeEntry();
    }

    @Override
    protected void onDestroy() {
        if (crawler != null) crawler.stop();
        if (renderView != null) renderView.destroy();
        super.onDestroy();
    }
}

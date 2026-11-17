package kr.lckstove.app;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private WebView web;
    private final ExecutorService pool = Executors.newFixedThreadPool(4);
    private final Handler main = new Handler(Looper.getMainLooper());

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences("lckstove", MODE_PRIVATE);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(0xFF0E1116);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setTextZoom(100);

        web.addJavascriptInterface(new Bridge(), "Native");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("file".equals(u.getScheme())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
                return true;
            }
        });
        web.loadUrl("file:///android_asset/index.html");

        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
        WatchJob.schedule(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.onAppResume && window.onAppResume()", null);
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.onAppBack ? window.onAppBack() : false", v -> {
            if (!"true".equals(v)) MainActivity.super.onBackPressed();
        });
    }

    @Override
    protected void onDestroy() {
        pool.shutdownNow();
        super.onDestroy();
    }

    final class Bridge {
        @JavascriptInterface
        public void fetch(final String id, final String url) {
            pool.execute(() -> {
                boolean ok;
                String body;
                try {
                    body = Http.get(url);
                    ok = true;
                } catch (Exception e) {
                    body = String.valueOf(e.getMessage());
                    ok = false;
                }
                final String js = "window.__nativeCb(" + JSONObject.quote(id) + "," + ok + "," + JSONObject.quote(body) + ")";
                main.post(() -> { if (web != null) web.evaluateJavascript(js, null); });
            });
        }

        /** 백그라운드 알림 검사에 쓸 질의 주소와 필터 */
        @JavascriptInterface
        public void setWatch(String url, boolean lckOnly) {
            prefs(MainActivity.this).edit().putString("watchUrl", url).putBoolean("lckOnly", lckOnly).apply();
        }

        /** 앱에서 이미 본 항목(알림 중복 방지) */
        @JavascriptInterface
        public void syncSeen(String keysJson) {
            try {
                JSONArray a = new JSONArray(keysJson);
                Set<String> set = new HashSet<>(prefs(MainActivity.this).getStringSet("seen", new HashSet<>()));
                for (int i = 0; i < a.length(); i++) set.add(a.getString(i));
                prefs(MainActivity.this).edit().putStringSet("seen", set).apply();
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void setNotify(boolean on) {
            prefs(MainActivity.this).edit().putBoolean("notify", on).apply();
            if (on) WatchJob.schedule(MainActivity.this); else WatchJob.cancel(MainActivity.this);
        }

        @JavascriptInterface
        public boolean getNotify() {
            return prefs(MainActivity.this).getBoolean("notify", true);
        }

        @JavascriptInterface
        public String version() {
            return BuildConfigShim.VERSION;
        }
    }
}

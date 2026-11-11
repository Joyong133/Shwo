package app.shwo.bodymorph;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

/** Hosts the bundled page (assets/index.html) full-screen. Fully offline; no permissions. */
public class MainActivity extends Activity {
    private static final String HOME = "file:///android_asset/index.html";
    private static final int BACKGROUND = Color.rgb(0x12, 0x16, 0x1b);

    private WebView web;
    private boolean pageReady;
    private int insetLeft, insetTop, insetRight, insetBottom;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // The page draws behind the system bars and pads itself with the insets we pass in.
        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false);
        } else {
            window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        web = new WebView(this);
        web.setBackgroundColor(BACKGROUND);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);          // the viewer is a script; only bundled files are ever loaded
        settings.setDomStorageEnabled(true);          // remembers that the intro sheet was read
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);
        settings.setTextZoom(100);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith("file:///android_asset/");
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
                pushInsets();
            }
        });

        web.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                insetLeft = i.left;
                insetTop = i.top;
                insetRight = i.right;
                insetBottom = i.bottom;
            } else {
                insetLeft = insets.getSystemWindowInsetLeft();
                insetTop = insets.getSystemWindowInsetTop();
                insetRight = insets.getSystemWindowInsetRight();
                insetBottom = insets.getSystemWindowInsetBottom();
            }
            pushInsets();
            return insets;
        });

        setContentView(web, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        web.loadUrl(HOME);
    }

    /** Hands the system-bar insets to the page as CSS pixels. */
    private void pushInsets() {
        if (!pageReady) return;
        float density = getResources().getDisplayMetrics().density;
        String js = String.format(Locale.US,
                "window.__setInsets&&window.__setInsets(%.2f,%.2f,%.2f,%.2f)",
                insetTop / density, insetRight / density, insetBottom / density, insetLeft / density);
        web.evaluateJavascript(js, null);
    }

    /** Back closes the intro sheet if it is open, otherwise leaves the app. */
    @Override
    public void onBackPressed() {
        if (!pageReady) {
            finish();
            return;
        }
        web.evaluateJavascript("(window.__back&&window.__back())===true", handled -> {
            if (!"true".equals(handled)) finish();
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        ViewGroup parent = (ViewGroup) web.getParent();
        if (parent != null) parent.removeView(web);
        web.destroy();
        super.onDestroy();
    }
}

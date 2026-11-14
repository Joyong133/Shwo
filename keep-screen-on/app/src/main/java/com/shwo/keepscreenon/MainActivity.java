package com.shwo.keepscreenon;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {

    private TextView status;
    private Button toggle;
    private Button overlayBtn;
    private Button batteryBtn;
    private Button notifBtn;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        int pad = dp(24);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(pad, dp(48), pad, pad);
        root.setGravity(Gravity.CENTER_HORIZONTAL);

        TextView title = new TextView(this);
        title.setText("Keep Screen On");
        title.setTextSize(26);
        title.setTextColor(Color.parseColor("#1F2937"));
        title.setGravity(Gravity.CENTER);
        root.addView(title);

        status = new TextView(this);
        status.setTextSize(16);
        status.setGravity(Gravity.CENTER);
        status.setPadding(0, dp(12), 0, dp(32));
        root.addView(status);

        toggle = new Button(this);
        toggle.setTextSize(20);
        toggle.setTextColor(Color.WHITE);
        toggle.setAllCaps(false);
        toggle.setOnClickListener(v -> onToggle());
        root.addView(toggle, new LinearLayout.LayoutParams(dp(220), dp(220)));

        TextView setup = new TextView(this);
        setup.setText("Setup");
        setup.setTextSize(18);
        setup.setTextColor(Color.parseColor("#1F2937"));
        setup.setPadding(0, dp(40), 0, dp(8));
        root.addView(setup, fullWidth());

        overlayBtn = setupButton(root, v -> startActivity(new Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()))));
        batteryBtn = setupButton(root, v -> requestBatteryExemption());
        notifBtn = setupButton(root, v -> {
            if (Build.VERSION.SDK_INT >= 33) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
            }
        });

        TextView help = new TextView(this);
        help.setText("Once on, the screen stays awake in every app until you tap Off here, "
                + "tap Stop in the notification, or use the \"Screen On\" Quick Settings tile. "
                + "Pressing the power button still turns the screen off; it stays on again "
                + "after you wake the device.\n\nTip: add the tile by editing your Quick Settings panel.");
        help.setTextSize(14);
        help.setTextColor(Color.parseColor("#6B7280"));
        help.setPadding(0, dp(24), 0, 0);
        root.addView(help, fullWidth());

        ScrollView sv = new ScrollView(this);
        sv.setBackgroundColor(Color.parseColor("#FAFAF9"));
        sv.addView(root);
        setContentView(sv);
    }

    @Override
    protected void onResume() {
        super.onResume();
        refresh();
        // Service state can change from the notification / tile while we're visible.
        handler.postDelayed(poll, 1000);
    }

    @Override
    protected void onPause() {
        super.onPause();
        handler.removeCallbacks(poll);
    }

    private final Runnable poll = new Runnable() {
        @Override public void run() {
            refresh();
            handler.postDelayed(this, 1000);
        }
    };

    private void onToggle() {
        if (KeepAwakeService.isRunning()) {
            KeepAwakeService.stop(this);
        } else {
            if (Build.VERSION.SDK_INT >= 33
                    && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
            }
            KeepAwakeService.start(this);
        }
        handler.postDelayed(this::refresh, 300);
    }

    private void requestBatteryExemption() {
        Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                Uri.parse("package:" + getPackageName()));
        try {
            startActivity(i);
        } catch (Exception e) {
            startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
        }
    }

    private void refresh() {
        boolean on = KeepAwakeService.isRunning();
        boolean overlay = Settings.canDrawOverlays(this);
        boolean battery = getSystemService(PowerManager.class).isIgnoringBatteryOptimizations(getPackageName());
        boolean notif = Build.VERSION.SDK_INT < 33
                || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;

        GradientDrawable circle = new GradientDrawable();
        circle.setShape(GradientDrawable.OVAL);
        circle.setColor(Color.parseColor(on ? "#F59E0B" : "#9CA3AF"));
        toggle.setBackground(circle);
        toggle.setText(on ? "ON\ntap to turn off" : "OFF\ntap to turn on");

        if (on && !overlay) {
            status.setText("On (limited mode). Allow \"Display over other apps\" below so it works on every device.");
            status.setTextColor(Color.parseColor("#B45309"));
        } else {
            status.setText(on ? "The screen will stay on until you turn this off."
                    : "The screen turns off normally.");
            status.setTextColor(Color.parseColor(on ? "#B45309" : "#6B7280"));
        }

        label(overlayBtn, overlay, "Display over other apps (required)");
        label(batteryBtn, battery, "Ignore battery optimization (recommended)");
        label(notifBtn, notif, "Notifications (for the Stop button)");
        notifBtn.setVisibility(Build.VERSION.SDK_INT >= 33 ? View.VISIBLE : View.GONE);
    }

    private void label(Button b, boolean ok, String text) {
        b.setText((ok ? "✓  " : "•  ") + text + (ok ? "" : "  → tap to allow"));
        b.setEnabled(!ok);
        b.setTextColor(Color.parseColor(ok ? "#15803D" : "#1F2937"));
    }

    private Button setupButton(LinearLayout root, View.OnClickListener l) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
        b.setOnClickListener(l);
        root.addView(b, fullWidth());
        return b;
    }

    private LinearLayout.LayoutParams fullWidth() {
        return new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}

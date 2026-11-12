package com.questhider.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Shown in place of a blocked app. */
public class BlockedActivity extends Activity implements View.OnClickListener {

    public static final String EXTRA_PKG = "pkg";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String pkg = getIntent().getStringExtra(EXTRA_PKG);
        String name = pkg;
        try {
            PackageManager pm = getPackageManager();
            name = pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString();
        } catch (Exception ignored) {
        }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(Color.parseColor("#1B1B1F"));
        root.setPadding(48, 48, 48, 48);

        TextView icon = new TextView(this);
        icon.setText("🔒");
        icon.setTextSize(64);
        icon.setGravity(Gravity.CENTER);
        root.addView(icon);

        TextView msg = new TextView(this);
        msg.setText("관리자가 차단한 앱입니다");
        msg.setTextColor(Color.WHITE);
        msg.setTextSize(26);
        msg.setTypeface(Typeface.DEFAULT_BOLD);
        msg.setGravity(Gravity.CENTER);
        msg.setPadding(0, 24, 0, 8);
        root.addView(msg);

        TextView app = new TextView(this);
        app.setText(name == null ? "" : name);
        app.setTextColor(Color.parseColor("#BBBBBB"));
        app.setTextSize(18);
        app.setGravity(Gravity.CENTER);
        root.addView(app);

        Button close = new Button(this);
        close.setText("닫기");
        close.setOnClickListener(this);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.topMargin = 40;
        close.setLayoutParams(lp);
        root.addView(close);

        setContentView(root);
    }

    @Override
    public void onClick(View v) {
        Intent home = new Intent(Intent.ACTION_MAIN);
        home.addCategory(Intent.CATEGORY_HOME);
        home.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(home);
        } catch (Exception ignored) {
        }
        finish();
    }
}

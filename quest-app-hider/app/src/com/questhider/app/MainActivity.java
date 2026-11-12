package com.questhider.app;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Quest App Hider
 *
 * Hides / shows apps on a Meta Quest (Horizon OS = Android based) using the
 * Device Owner API: DevicePolicyManager.setApplicationHidden().
 *
 * One-time setup over ADB (no root, nothing kept running on a PC):
 *   adb install quest-app-hider.apk
 *   adb shell dpm set-device-owner com.questhider.app/.HiderAdminReceiver
 *
 * After that, toggling an app here hides it from the Quest app library
 * (e.g. the Meta Quest Browser, com.oculus.browser) until you show it again.
 */
public class MainActivity extends Activity
        implements View.OnClickListener, CompoundButton.OnCheckedChangeListener {

    private static final String TAG_REFRESH = "__refresh__";
    private static final String TAG_RELEASE = "__release__";
    private static final int PAD = 24;

    private DevicePolicyManager dpm;
    private ComponentName admin;
    private PackageManager pm;

    private boolean isOwner;
    private boolean showAll = false;

    private TextView statusView;
    private LinearLayout listContainer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        dpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
        admin = new ComponentName(this, HiderAdminReceiver.class);
        pm = getPackageManager();

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);
        root.setPadding(PAD, PAD, PAD, PAD);

        TextView title = new TextView(this);
        title.setText("Quest App Hider  —  앱 숨기기");
        title.setTextColor(Color.parseColor("#111111"));
        title.setTextSize(26);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        root.addView(title);

        statusView = new TextView(this);
        statusView.setTextSize(15);
        statusView.setPadding(0, 12, 0, 12);
        statusView.setTextIsSelectable(true);
        root.addView(statusView);

        LinearLayout controls = new LinearLayout(this);
        controls.setOrientation(LinearLayout.HORIZONTAL);
        controls.setGravity(Gravity.CENTER_VERTICAL);

        Button refresh = new Button(this);
        refresh.setText("새로고침");
        refresh.setTag(TAG_REFRESH);
        refresh.setOnClickListener(this);
        controls.addView(refresh);

        CheckBox allBox = new CheckBox(this);
        allBox.setText("모든 패키지 표시");
        allBox.setTextColor(Color.parseColor("#111111"));
        allBox.setPadding(24, 0, 0, 0);
        allBox.setOnCheckedChangeListener(this);
        controls.addView(allBox);

        Button release = new Button(this);
        release.setText("기기 소유자 해제");   // Release device owner
        release.setTag(TAG_RELEASE);
        release.setOnClickListener(this);
        LinearLayout.LayoutParams rlp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        rlp.leftMargin = 24;
        release.setLayoutParams(rlp);
        controls.addView(release);

        root.addView(controls);

        ScrollView scroll = new ScrollView(this);
        scroll.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        listContainer = new LinearLayout(this);
        listContainer.setOrientation(LinearLayout.VERTICAL);
        scroll.addView(listContainer);
        root.addView(scroll);

        setContentView(root);

        refresh();
    }

    @Override
    protected void onResume() {
        super.onResume();
        refresh();
    }

    // Refresh button + every app toggle button route here.
    @Override
    public void onClick(View v) {
        Object tag = v.getTag();
        if (TAG_REFRESH.equals(tag)) {
            refresh();
        } else if (TAG_RELEASE.equals(tag)) {
            releaseOwner();
        } else if (tag instanceof String) {
            onToggle((String) tag, (Button) v);
        }
    }

    // "Show all packages" checkbox.
    @Override
    public void onCheckedChanged(CompoundButton buttonView, boolean checked) {
        showAll = checked;
        refresh();
    }

    private void refresh() {
        isOwner = dpm.isDeviceOwnerApp(getPackageName());
        updateStatus();
        buildList();
    }

    private void updateStatus() {
        if (isOwner) {
            statusView.setTextColor(Color.parseColor("#0A7D28"));
            statusView.setText("✓ 기기 소유자(Device Owner)로 설정됨. "
                    + "아래 목록에서 앱을 숨기거나 복원할 수 있어요.");
        } else {
            statusView.setTextColor(Color.parseColor("#B00020"));
            statusView.setText("⚠ 아직 기기 소유자가 아닙니다. PC에서 ADB로 한 번만 실행하세요:\n\n"
                    + "adb shell dpm set-device-owner com.questhider.app/.HiderAdminReceiver\n\n"
                    + "(기기에 다른 계정이 없어야 합니다.) 설정 후 '새로고침'.");
        }
    }

    private void buildList() {
        listContainer.removeAllViews();

        List<ApplicationInfo> apps = pm.getInstalledApplications(
                PackageManager.MATCH_UNINSTALLED_PACKAGES);
        List<ApplicationInfo> filtered = new ArrayList<ApplicationInfo>();
        String self = getPackageName();
        for (int i = 0; i < apps.size(); i++) {
            ApplicationInfo ai = apps.get(i);
            if (ai.packageName.equals(self)) continue;
            boolean launchable = pm.getLaunchIntentForPackage(ai.packageName) != null;
            if (showAll || launchable) {
                filtered.add(ai);
            }
        }

        Collections.sort(filtered, new AppLabelComparator(pm));

        if (filtered.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("표시할 앱이 없습니다.");
            empty.setTextColor(Color.parseColor("#111111"));
            listContainer.addView(empty);
            return;
        }

        for (int i = 0; i < filtered.size(); i++) {
            listContainer.addView(makeRow(filtered.get(i)));
        }
    }

    private String label(ApplicationInfo ai) {
        CharSequence l = ai.loadLabel(pm);
        return l == null ? ai.packageName : l.toString();
    }

    private View makeRow(ApplicationInfo ai) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(0, 16, 0, 16);

        LinearLayout textCol = new LinearLayout(this);
        textCol.setOrientation(LinearLayout.VERTICAL);
        textCol.setLayoutParams(new LinearLayout.LayoutParams(0,
                ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView name = new TextView(this);
        name.setText(label(ai));
        name.setTextColor(Color.parseColor("#111111"));
        name.setTextSize(18);
        name.setTypeface(Typeface.DEFAULT_BOLD);
        textCol.addView(name);

        TextView pkg = new TextView(this);
        pkg.setText(ai.packageName);
        pkg.setTextColor(Color.parseColor("#666666"));
        pkg.setTextSize(13);
        textCol.addView(pkg);

        row.addView(textCol);

        boolean hidden = isHidden(ai.packageName);

        Button toggle = new Button(this);
        toggle.setTag(ai.packageName);
        toggle.setOnClickListener(this);
        styleToggle(toggle, hidden);
        row.addView(toggle);

        return row;
    }

    private void styleToggle(Button b, boolean hidden) {
        if (hidden) {
            b.setText("복원");          // Restore
            b.setTextColor(Color.WHITE);
            b.getBackground().setTint(Color.parseColor("#0A7D28"));
        } else {
            b.setText("숨기기");      // Hide
            b.setTextColor(Color.WHITE);
            b.getBackground().setTint(Color.parseColor("#B00020"));
        }
    }

    private boolean isHidden(String packageName) {
        if (!isOwner) return false;
        try {
            return dpm.isApplicationHidden(admin, packageName);
        } catch (Exception e) {
            return false;
        }
    }

    private void onToggle(String packageName, Button toggle) {
        if (!isOwner) {
            Toast.makeText(this,
                    "먼저 ADB로 기기 소유자 설정이 필요합니다.",
                    Toast.LENGTH_LONG).show();
            return;
        }
        boolean currentlyHidden = isHidden(packageName);
        boolean wantHidden = !currentlyHidden;
        boolean ok;
        try {
            ok = dpm.setApplicationHidden(admin, packageName, wantHidden);
        } catch (Exception e) {
            ok = false;
        }
        if (ok) {
            styleToggle(toggle, wantHidden);
            Toast.makeText(this,
                    (wantHidden ? "숨김: " : "복원: ") + packageName,
                    Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this,
                    "변경 실패 (시스템 보호 앱일 수 있음): " + packageName,
                    Toast.LENGTH_LONG).show();
        }
    }

    /**
     * Un-hide every app, then relinquish Device Owner so the app can be
     * uninstalled normally (otherwise removing a device owner needs a factory
     * reset). Call this before uninstalling.
     */
    private void releaseOwner() {
        if (!isOwner) {
            Toast.makeText(this, "기기 소유자가 아닙니다.",
                    Toast.LENGTH_SHORT).show();
            return;
        }
        // Restore everything first so no app is left stuck hidden.
        List<ApplicationInfo> apps = pm.getInstalledApplications(
                PackageManager.MATCH_UNINSTALLED_PACKAGES);
        for (int i = 0; i < apps.size(); i++) {
            String p = apps.get(i).packageName;
            try {
                if (dpm.isApplicationHidden(admin, p)) {
                    dpm.setApplicationHidden(admin, p, false);
                }
            } catch (Exception ignored) {
            }
        }
        try {
            dpm.clearDeviceOwnerApp(getPackageName());
            Toast.makeText(this,
                    "기기 소유자 해제 완료. 이제 앱을 삭제할 수 있어요.",
                    Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, "해제 실패: " + e.getMessage(),
                    Toast.LENGTH_LONG).show();
        }
        refresh();
    }
}

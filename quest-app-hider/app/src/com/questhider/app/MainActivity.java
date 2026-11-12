package com.questhider.app;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Quest App Hider
 *
 * Mode 1 (no ADB, default): an accessibility service closes blocked apps
 *   (e.g. Meta Quest Browser, com.oculus.browser) the moment they open.
 * Mode 2 (optional, needs ADB once): if the app is Device Owner, apps can be
 *   truly hidden from the library with DevicePolicyManager.setApplicationHidden().
 *
 * The management screen is protected by an admin PIN.
 */
public class MainActivity extends Activity
        implements View.OnClickListener, CompoundButton.OnCheckedChangeListener {

    private static final String T_REFRESH = "__refresh__";
    private static final String T_RELEASE = "__release__";
    private static final String T_A11Y = "__a11y__";
    private static final String T_APPINFO = "__appinfo__";
    private static final String T_PIN_OK = "__pin_ok__";
    private static final String T_PIN_CHANGE = "__pin_change__";
    private static final String P_BLOCK = "b:";
    private static final String P_HIDE = "h:";
    private static final int PAD = 24;

    private DevicePolicyManager dpm;
    private ComponentName admin;
    private PackageManager pm;

    private boolean unlocked = false;
    private boolean settingPin = false;
    private boolean isOwner;
    private boolean showAll = false;
    private Set<String> protectedPkgs = new HashSet<String>();

    private EditText pinInput;
    private EditText pinConfirm;
    private TextView statusView;
    private LinearLayout listContainer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        dpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
        admin = new ComponentName(this, HiderAdminReceiver.class);
        pm = getPackageManager();
        buildProtectedList();
        showGate(!Prefs.hasPin(this));
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (unlocked) refresh();
    }

    @Override
    protected void onStop() {
        super.onStop();
        // Re-lock whenever the screen is left, so a child can't just reopen it.
        if (unlocked) {
            unlocked = false;
            showGate(false);
        }
    }

    // ---------------------------------------------------------------- PIN gate

    private void showGate(boolean setMode) {
        settingPin = setMode;

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setBackgroundColor(Color.WHITE);
        root.setPadding(PAD * 2, PAD * 3, PAD * 2, PAD * 2);

        root.addView(title("Quest App Hider"));

        TextView msg = new TextView(this);
        msg.setTextColor(Color.parseColor("#333333"));
        msg.setTextSize(17);
        msg.setGravity(Gravity.CENTER);
        msg.setPadding(0, 16, 0, 24);
        msg.setText(setMode
                ? "관리자 PIN을 정해주세요 (숫자 4자리 이상).\n이 PIN이 있어야 차단 설정을 바꿀 수 있어요."
                : "관리자 PIN을 입력하세요.");
        root.addView(msg);

        pinInput = pinField("PIN");
        root.addView(pinInput);

        pinConfirm = null;
        if (setMode) {
            pinConfirm = pinField("PIN 확인");
            root.addView(pinConfirm);
        }

        Button ok = new Button(this);
        ok.setText(setMode ? "PIN 저장" : "열기");
        ok.setTag(T_PIN_OK);
        ok.setOnClickListener(this);
        root.addView(ok);

        setContentView(root);
    }

    private EditText pinField(String hint) {
        EditText e = new EditText(this);
        e.setHint(hint);
        e.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_VARIATION_PASSWORD);
        e.setTextSize(22);
        e.setGravity(Gravity.CENTER);
        e.setTextColor(Color.BLACK);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(420,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.bottomMargin = 16;
        e.setLayoutParams(lp);
        return e;
    }

    private void onPinOk() {
        String pin = pinInput.getText().toString().trim();
        if (settingPin) {
            String again = pinConfirm == null ? "" : pinConfirm.getText().toString().trim();
            if (pin.length() < 4) {
                toast("PIN은 4자리 이상이어야 해요.");
                return;
            }
            if (!pin.equals(again)) {
                toast("PIN이 서로 달라요.");
                return;
            }
            Prefs.setPin(this, pin);
            toast("PIN 저장됨");
        } else if (!Prefs.checkPin(this, pin)) {
            toast("PIN이 틀렸어요.");
            pinInput.setText("");
            return;
        }
        unlocked = true;
        showMain();
    }

    // ------------------------------------------------------------- main screen

    private void showMain() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);
        root.setPadding(PAD, PAD, PAD, PAD);

        root.addView(title("Quest App Hider  —  앱 차단"));

        statusView = new TextView(this);
        statusView.setTextSize(15);
        statusView.setPadding(0, 12, 0, 12);
        root.addView(statusView);

        LinearLayout row1 = hRow();
        row1.addView(button("① 접근성에서 차단 켜기", T_A11Y));
        row1.addView(button("앱 정보 (제한된 설정 허용)", T_APPINFO));
        root.addView(row1);

        LinearLayout row2 = hRow();
        row2.addView(button("새로고침", T_REFRESH));
        row2.addView(button("PIN 변경", T_PIN_CHANGE));
        CheckBox allBox = new CheckBox(this);
        allBox.setText("모든 패키지 표시");
        allBox.setTextColor(Color.parseColor("#111111"));
        allBox.setChecked(showAll);
        allBox.setOnCheckedChangeListener(this);
        row2.addView(allBox);
        if (dpm.isDeviceOwnerApp(getPackageName())) {
            row2.addView(button("기기 소유자 해제", T_RELEASE));
        }
        root.addView(row2);

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

    private void refresh() {
        if (!unlocked || statusView == null) return;
        isOwner = dpm.isDeviceOwnerApp(getPackageName());
        boolean a11y = isA11yEnabled();

        StringBuilder sb = new StringBuilder();
        if (a11y) {
            sb.append("✓ 차단 서비스 켜짐 — '차단'한 앱은 열리자마자 닫혔요.");
            statusView.setTextColor(Color.parseColor("#0A7D28"));
        } else {
            sb.append("⚠ 차단 서비스가 꺼져 있어요. ① 버튼 → '설치된 앱/서비스' → "
                    + "'Quest App Hider 차단' 켜기.\n"
                    + "회색으로 막혀 있으면 '앱 정보' → 오른쪽 위 ⋮ → '제한된 설정 허용' 후 다시.");
            statusView.setTextColor(Color.parseColor("#B00020"));
        }
        if (isOwner) {
            sb.append("\n✓ 기기 소유자 모드: '숨기기'로 아이콘까지 숨길 수 있어요.");
        }
        statusView.setText(sb.toString());
        buildList();
    }

    private void buildList() {
        listContainer.removeAllViews();
        List<ApplicationInfo> apps = pm.getInstalledApplications(
                PackageManager.MATCH_UNINSTALLED_PACKAGES);
        List<ApplicationInfo> filtered = new ArrayList<ApplicationInfo>();
        for (int i = 0; i < apps.size(); i++) {
            ApplicationInfo ai = apps.get(i);
            if (ai.packageName.equals(getPackageName())) continue;
            boolean launchable = pm.getLaunchIntentForPackage(ai.packageName) != null;
            boolean blocked = Prefs.isBlocked(this, ai.packageName);
            if (showAll || launchable || blocked || isHidden(ai.packageName)) filtered.add(ai);
        }
        Collections.sort(filtered, new AppLabelComparator(pm));

        if (filtered.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("표시할 앱이 없습니다.");
            empty.setTextColor(Color.BLACK);
            listContainer.addView(empty);
            return;
        }
        for (int i = 0; i < filtered.size(); i++) listContainer.addView(makeRow(filtered.get(i)));
    }

    private View makeRow(ApplicationInfo ai) {
        LinearLayout row = hRow();
        row.setPadding(0, 14, 0, 14);

        LinearLayout textCol = new LinearLayout(this);
        textCol.setOrientation(LinearLayout.VERTICAL);
        textCol.setLayoutParams(new LinearLayout.LayoutParams(0,
                ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView name = new TextView(this);
        CharSequence l = ai.loadLabel(pm);
        name.setText(l == null ? ai.packageName : l);
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

        if (protectedPkgs.contains(ai.packageName)) {
            TextView prot = new TextView(this);
            prot.setText("시스템 보호됨");
            prot.setTextColor(Color.parseColor("#888888"));
            row.addView(prot);
            return row;
        }

        Button block = new Button(this);
        block.setTag(P_BLOCK + ai.packageName);
        block.setOnClickListener(this);
        styleBlock(block, Prefs.isBlocked(this, ai.packageName));
        row.addView(block);

        if (isOwner) {
            Button hide = new Button(this);
            hide.setTag(P_HIDE + ai.packageName);
            hide.setOnClickListener(this);
            styleHide(hide, isHidden(ai.packageName));
            row.addView(hide);
        }
        return row;
    }

    private void styleBlock(Button b, boolean blocked) {
        b.setText(blocked ? "차단됨 · 해제" : "차단");
        b.setTextColor(Color.WHITE);
        b.getBackground().setTint(Color.parseColor(blocked ? "#B00020" : "#5F6368"));
    }

    private void styleHide(Button b, boolean hidden) {
        b.setText(hidden ? "숨김 · 복원" : "숨기기");
        b.setTextColor(Color.WHITE);
        b.getBackground().setTint(Color.parseColor(hidden ? "#0A7D28" : "#3949AB"));
    }

    // ------------------------------------------------------------------ events

    @Override
    public void onClick(View v) {
        Object t = v.getTag();
        if (!(t instanceof String)) return;
        String tag = (String) t;
        if (T_PIN_OK.equals(tag)) {
            onPinOk();
        } else if (!unlocked) {
            return;
        } else if (T_REFRESH.equals(tag)) {
            refresh();
        } else if (T_A11Y.equals(tag)) {
            openSettings(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
        } else if (T_APPINFO.equals(tag)) {
            openSettings(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.parse("package:" + getPackageName())));
        } else if (T_PIN_CHANGE.equals(tag)) {
            unlocked = false;
            showGate(true);
        } else if (T_RELEASE.equals(tag)) {
            releaseOwner();
        } else if (tag.startsWith(P_BLOCK)) {
            String pkg = tag.substring(P_BLOCK.length());
            boolean now = !Prefs.isBlocked(this, pkg);
            Prefs.setBlocked(this, pkg, now);
            styleBlock((Button) v, now);
            if (now && !isA11yEnabled()) {
                toast("차단 목록에 추가됨. 접근성에서 차단 서비스를 켜야 작동해요.");
            }
        } else if (tag.startsWith(P_HIDE)) {
            toggleHidden(tag.substring(P_HIDE.length()), (Button) v);
        }
    }

    @Override
    public void onCheckedChanged(CompoundButton buttonView, boolean checked) {
        showAll = checked;
        refresh();
    }

    // ----------------------------------------------------------------- helpers

    private void openSettings(Intent i) {
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(i);
        } catch (Exception e) {
            try {
                startActivity(new Intent(Settings.ACTION_SETTINGS)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (Exception e2) {
                toast("설정 화면을 열 수 없어요.");
            }
        }
    }

    private boolean isA11yEnabled() {
        String enabled = Settings.Secure.getString(getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (enabled == null) return false;
        ComponentName me = new ComponentName(this, BlockerService.class);
        String[] parts = enabled.split(":");
        for (int i = 0; i < parts.length; i++) {
            ComponentName c = ComponentName.unflattenFromString(parts[i]);
            if (me.equals(c)) return true;
        }
        return false;
    }

    /** Packages that must never be blocked (system UI, launchers, ourselves). */
    private void buildProtectedList() {
        protectedPkgs.add(getPackageName());
        protectedPkgs.add("android");
        protectedPkgs.add("com.android.systemui");
        protectedPkgs.add("com.android.settings");
        protectedPkgs.add("com.oculus.vrshell");
        protectedPkgs.add("com.oculus.systemux");
        protectedPkgs.add("com.oculus.shellenv");
        protectedPkgs.add("com.oculus.systemdriver");
        protectedPkgs.add("com.oculus.os.vrlockscreen");
        try {
            Intent home = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME);
            List<ResolveInfo> homes = pm.queryIntentActivities(home, 0);
            for (int i = 0; i < homes.size(); i++) {
                protectedPkgs.add(homes.get(i).activityInfo.packageName);
            }
        } catch (Exception ignored) {
        }
    }

    private boolean isHidden(String pkg) {
        if (!isOwner) return false;
        try {
            return dpm.isApplicationHidden(admin, pkg);
        } catch (Exception e) {
            return false;
        }
    }

    private void toggleHidden(String pkg, Button b) {
        boolean want = !isHidden(pkg);
        boolean ok;
        try {
            ok = dpm.setApplicationHidden(admin, pkg, want);
        } catch (Exception e) {
            ok = false;
        }
        if (ok) styleHide(b, want);
        else toast("변경 실패: " + pkg);
    }

    private void releaseOwner() {
        if (!dpm.isDeviceOwnerApp(getPackageName())) return;
        List<ApplicationInfo> apps = pm.getInstalledApplications(
                PackageManager.MATCH_UNINSTALLED_PACKAGES);
        for (int i = 0; i < apps.size(); i++) {
            try {
                String p = apps.get(i).packageName;
                if (dpm.isApplicationHidden(admin, p)) dpm.setApplicationHidden(admin, p, false);
            } catch (Exception ignored) {
            }
        }
        try {
            dpm.clearDeviceOwnerApp(getPackageName());
            toast("기기 소유자 해제 완료");
        } catch (Exception e) {
            toast("해제 실패: " + e.getMessage());
        }
        showMain();
    }

    private TextView title(String s) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextColor(Color.parseColor("#111111"));
        t.setTextSize(26);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private LinearLayout hRow() {
        LinearLayout r = new LinearLayout(this);
        r.setOrientation(LinearLayout.HORIZONTAL);
        r.setGravity(Gravity.CENTER_VERTICAL);
        return r;
    }

    private Button button(String text, String tag) {
        Button b = new Button(this);
        b.setText(text);
        b.setTag(tag);
        b.setOnClickListener(this);
        b.setAllCaps(false);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.rightMargin = 12;
        b.setLayoutParams(lp);
        return b;
    }

    private void toast(String s) {
        Toast.makeText(this, s, Toast.LENGTH_LONG).show();
    }
}

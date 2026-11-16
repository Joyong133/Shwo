package kr.shwo.fmviewer;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.text.InputType;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.security.MessageDigest;
import java.security.SecureRandom;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/**
 * 앱 잠금 화면. 처음 실행하면 비밀번호를 만들고, 그 뒤로는 앱이 화면에서 사라질 때마다
 * (홈 버튼, 다른 앱으로 전환, 화면 꺼짐) 다시 비밀번호를 넣어야 한다.
 * 비밀번호는 PBKDF2(SHA-256) 해시로만 저장한다.
 */
public class AppLock {
    public interface Callback {
        void onUnlocked();
        /** 비밀번호를 잊어 초기화할 때: 사이트 로그인 정보 등 앱 데이터를 지운다. */
        void onReset();
    }

    private static final String PREFS = "app_lock";
    private static final int MIN_LEN = 4;
    private static final int ITER = 20000;
    private static final int MAX_TRIES = 5;
    private static final long LOCKOUT_MS = 30_000;

    private enum Mode { CREATE, UNLOCK, CHANGE_OLD, CHANGE_NEW, RESET_CONFIRM }

    private final Activity act;
    private final SharedPreferences prefs;
    private final Callback cb;
    private final FrameLayout overlay;
    private final TextView title, message, error;
    private final EditText pw, pw2;
    private final Button ok;
    private final TextView linkChange, linkForgot;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Mode mode;
    private int tries;
    private long lockedUntil;

    public AppLock(Activity act, FrameLayout root, Callback cb) {
        this.act = act;
        this.cb = cb;
        this.prefs = act.getSharedPreferences(PREFS, Context.MODE_PRIVATE);

        overlay = new FrameLayout(act);
        overlay.setBackgroundColor(Color.parseColor("#F4F6FA"));
        overlay.setClickable(true); // 아래 웹 화면 터치 차단
        overlay.setFocusable(true);

        LinearLayout box = new LinearLayout(act);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER_HORIZONTAL);
        int pad = dp(28);
        box.setPadding(pad, pad, pad, pad);

        TextView icon = new TextView(act);
        icon.setText("🔒");
        icon.setTextSize(40);
        icon.setGravity(Gravity.CENTER);

        title = text(22, true, "#17212B");
        message = text(14, false, "#5D6B78");
        pw = input("비밀번호");
        pw2 = input("비밀번호 확인");
        error = text(13, false, "#C0392B");

        ok = new Button(act);
        ok.setAllCaps(false);
        ok.setTextColor(Color.WHITE);
        ok.setTextSize(16);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#3A6FD8"));
        bg.setCornerRadius(dp(10));
        ok.setBackground(bg);
        ok.setOnClickListener(v -> submit());

        linkChange = link("비밀번호 바꾸기");
        linkChange.setOnClickListener(v -> setMode(Mode.CHANGE_OLD));
        linkForgot = link("비밀번호를 잊었어요");
        linkForgot.setOnClickListener(v -> setMode(mode == Mode.RESET_CONFIRM ? Mode.UNLOCK : Mode.RESET_CONFIRM));

        box.addView(icon, lp(-2, dp(8)));
        box.addView(title, lp(-2, dp(6)));
        box.addView(message, lp(-2, dp(20)));
        box.addView(pw, lp(-1, dp(10)));
        box.addView(pw2, lp(-1, dp(10)));
        box.addView(error, lp(-2, dp(10)));
        box.addView(ok, new LinearLayout.LayoutParams(-1, dp(50)));
        box.addView(linkChange, lp(-2, 0));
        box.addView(linkForgot, lp(-2, 0));
        ((LinearLayout.LayoutParams) linkChange.getLayoutParams()).topMargin = dp(18);

        FrameLayout.LayoutParams blp = new FrameLayout.LayoutParams(Math.min(dp(380), act.getResources().getDisplayMetrics().widthPixels), -2);
        blp.gravity = Gravity.CENTER;
        overlay.addView(box, blp);
        root.addView(overlay, new FrameLayout.LayoutParams(-1, -1));

        pw.setOnEditorActionListener((v, id, e) -> {
            if (id == EditorInfo.IME_ACTION_DONE && pw2.getVisibility() == View.VISIBLE) { pw2.requestFocus(); return true; }
            submit();
            return true;
        });
        pw2.setOnEditorActionListener((v, id, e) -> { submit(); return true; });
    }

    public boolean isLocked() { return overlay.getVisibility() == View.VISIBLE; }

    /** 잠금 화면을 띄운다 (비밀번호가 아직 없으면 만들기 화면). */
    public void lock() {
        setMode(hasPassword() ? Mode.UNLOCK : Mode.CREATE);
        overlay.setVisibility(View.VISIBLE);
        overlay.bringToFront();
    }

    /** 화면이 다시 보일 때 키보드를 올린다. */
    public void focus() {
        if (!isLocked()) return;
        handler.postDelayed(() -> {
            pw.requestFocus();
            InputMethodManager imm = (InputMethodManager) act.getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null) imm.showSoftInput(pw, InputMethodManager.SHOW_IMPLICIT);
        }, 250);
    }

    private void setMode(Mode m) {
        mode = m;
        pw.setText("");
        pw2.setText("");
        error.setText("");
        boolean two = m == Mode.CREATE || m == Mode.CHANGE_NEW;
        pw2.setVisibility(two ? View.VISIBLE : View.GONE);
        pw.setVisibility(m == Mode.RESET_CONFIRM ? View.GONE : View.VISIBLE);
        pw.setImeOptions(two ? EditorInfo.IME_ACTION_NEXT : EditorInfo.IME_ACTION_DONE);
        linkChange.setVisibility(m == Mode.UNLOCK ? View.VISIBLE : View.GONE);
        linkForgot.setVisibility(m == Mode.UNLOCK || m == Mode.RESET_CONFIRM ? View.VISIBLE : View.GONE);
        linkForgot.setText(m == Mode.RESET_CONFIRM ? "취소" : "비밀번호를 잊었어요");
        switch (m) {
            case CREATE:
                title.setText("비밀번호 만들기");
                message.setText("앱을 열 때마다 이 비밀번호를 넣어야 합니다.\n" + MIN_LEN + "자 이상으로 정하세요.");
                ok.setText("만들기");
                break;
            case UNLOCK:
                title.setText("잠겨 있습니다");
                message.setText("비밀번호를 입력하세요.");
                ok.setText("열기");
                break;
            case CHANGE_OLD:
                title.setText("비밀번호 바꾸기");
                message.setText("지금 비밀번호를 먼저 입력하세요.");
                ok.setText("다음");
                linkForgot.setVisibility(View.VISIBLE);
                linkForgot.setText("취소");
                linkForgot.setOnClickListener(v -> setMode(Mode.UNLOCK));
                break;
            case CHANGE_NEW:
                title.setText("새 비밀번호");
                message.setText(MIN_LEN + "자 이상으로 정하세요.");
                ok.setText("바꾸기");
                break;
            case RESET_CONFIRM:
                title.setText("비밀번호 초기화");
                message.setText("비밀번호를 지우고 새로 만듭니다.\n보안을 위해 사이트 로그인 정보와 방문 기록도 모두 지워집니다.");
                ok.setText("초기화하기");
                break;
        }
        if (m != Mode.CHANGE_OLD) linkForgot.setOnClickListener(v -> setMode(mode == Mode.RESET_CONFIRM ? Mode.UNLOCK : Mode.RESET_CONFIRM));
        if (m != Mode.RESET_CONFIRM) pw.requestFocus();
    }

    private void submit() {
        String a = pw.getText().toString();
        String b = pw2.getText().toString();
        switch (mode) {
            case CREATE:
            case CHANGE_NEW:
                if (a.length() < MIN_LEN) { error.setText(MIN_LEN + "자 이상 입력하세요."); return; }
                if (!a.equals(b)) { error.setText("두 비밀번호가 다릅니다."); pw2.setText(""); pw2.requestFocus(); return; }
                savePassword(a);
                unlock();
                return;
            case UNLOCK:
            case CHANGE_OLD:
                long now = SystemClock.elapsedRealtime();
                if (now < lockedUntil) {
                    error.setText("너무 많이 틀렸습니다. " + ((lockedUntil - now) / 1000 + 1) + "초 뒤에 다시 하세요.");
                    return;
                }
                if (!check(a)) {
                    tries++;
                    pw.setText("");
                    if (tries >= MAX_TRIES) {
                        tries = 0;
                        lockedUntil = now + LOCKOUT_MS;
                        error.setText(MAX_TRIES + "번 틀렸습니다. 30초 뒤에 다시 하세요.");
                    } else {
                        error.setText("비밀번호가 틀렸습니다. (" + tries + "/" + MAX_TRIES + ")");
                    }
                    return;
                }
                tries = 0;
                if (mode == Mode.CHANGE_OLD) setMode(Mode.CHANGE_NEW);
                else unlock();
                return;
            case RESET_CONFIRM:
                prefs.edit().clear().apply();
                cb.onReset();
                setMode(Mode.CREATE);
        }
    }

    private void unlock() {
        InputMethodManager imm = (InputMethodManager) act.getSystemService(Context.INPUT_METHOD_SERVICE);
        if (imm != null) imm.hideSoftInputFromWindow(pw.getWindowToken(), 0);
        pw.setText("");
        pw2.setText("");
        overlay.setVisibility(View.GONE);
        cb.onUnlocked();
    }

    // ---------- 저장 / 확인 ----------
    private boolean hasPassword() { return prefs.contains("hash"); }

    private void savePassword(String p) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        prefs.edit()
                .putString("salt", Base64.encodeToString(salt, Base64.NO_WRAP))
                .putString("hash", Base64.encodeToString(hash(p, salt), Base64.NO_WRAP))
                .apply();
    }

    private boolean check(String p) {
        try {
            byte[] salt = Base64.decode(prefs.getString("salt", ""), Base64.NO_WRAP);
            byte[] want = Base64.decode(prefs.getString("hash", ""), Base64.NO_WRAP);
            return MessageDigest.isEqual(want, hash(p, salt));
        } catch (Exception e) {
            return false;
        }
    }

    private static byte[] hash(String p, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(p.toCharArray(), salt, ITER, 256);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ---------- 화면 도우미 ----------
    private TextView text(int sp, boolean bold, String color) {
        TextView t = new TextView(act);
        t.setTextSize(sp);
        t.setTextColor(Color.parseColor(color));
        t.setGravity(Gravity.CENTER);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private TextView link(String s) {
        TextView t = text(14, false, "#3A6FD8");
        t.setText(s);
        t.setPadding(dp(12), dp(10), dp(12), dp(10));
        return t;
    }

    private EditText input(String hint) {
        EditText e = new EditText(act);
        e.setHint(hint);
        e.setSingleLine(true);
        e.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        e.setTextSize(18);
        e.setGravity(Gravity.CENTER);
        e.setTextColor(Color.parseColor("#17212B"));
        e.setHintTextColor(Color.parseColor("#93A1AD"));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.WHITE);
        bg.setStroke(dp(1), Color.parseColor("#D5DCE4"));
        bg.setCornerRadius(dp(10));
        e.setBackground(bg);
        e.setPadding(dp(14), dp(12), dp(14), dp(12));
        return e;
    }

    private LinearLayout.LayoutParams lp(int w, int bottom) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(w, -2);
        p.bottomMargin = bottom;
        return p;
    }

    private int dp(int v) { return Math.round(v * act.getResources().getDisplayMetrics().density); }
}

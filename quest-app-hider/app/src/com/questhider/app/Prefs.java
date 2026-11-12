package com.questhider.app;

import android.content.Context;
import android.content.SharedPreferences;

import java.security.MessageDigest;
import java.util.HashSet;
import java.util.Set;

/** Stored settings: blocked package set + admin PIN hash. */
public final class Prefs {
    private static final String FILE = "quest_app_hider";
    private static final String KEY_BLOCKED = "blocked";
    private static final String KEY_PIN = "pin_hash";

    private Prefs() {}

    private static SharedPreferences sp(Context c) {
        return c.getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }

    public static Set<String> blocked(Context c) {
        return new HashSet<String>(sp(c).getStringSet(KEY_BLOCKED, new HashSet<String>()));
    }

    public static boolean isBlocked(Context c, String pkg) {
        return sp(c).getStringSet(KEY_BLOCKED, new HashSet<String>()).contains(pkg);
    }

    public static void setBlocked(Context c, String pkg, boolean block) {
        Set<String> s = blocked(c);
        if (block) s.add(pkg); else s.remove(pkg);
        sp(c).edit().putStringSet(KEY_BLOCKED, s).apply();
    }

    public static boolean hasPin(Context c) {
        return sp(c).getString(KEY_PIN, null) != null;
    }

    public static void setPin(Context c, String pin) {
        sp(c).edit().putString(KEY_PIN, hash(pin)).apply();
    }

    public static boolean checkPin(Context c, String pin) {
        String h = sp(c).getString(KEY_PIN, null);
        return h != null && h.equals(hash(pin));
    }

    private static String hash(String pin) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(("qah:" + pin).getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < d.length; i++) sb.append(String.format("%02x", d[i]));
            return sb.toString();
        } catch (Exception e) {
            return pin;
        }
    }
}

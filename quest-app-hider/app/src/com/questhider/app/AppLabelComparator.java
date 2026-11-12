package com.questhider.app;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;

import java.util.Comparator;

/** Sorts apps by their visible label, case-insensitively. */
public class AppLabelComparator implements Comparator<ApplicationInfo> {
    private final PackageManager pm;

    public AppLabelComparator(PackageManager pm) {
        this.pm = pm;
    }

    private String label(ApplicationInfo ai) {
        CharSequence l = ai.loadLabel(pm);
        return l == null ? ai.packageName : l.toString();
    }

    @Override
    public int compare(ApplicationInfo a, ApplicationInfo b) {
        return label(a).compareToIgnoreCase(label(b));
    }
}

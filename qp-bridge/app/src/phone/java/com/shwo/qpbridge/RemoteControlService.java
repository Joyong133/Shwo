package com.shwo.qpbridge;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.content.Intent;
import android.graphics.Path;
import android.os.Build;
import android.os.Bundle;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

/** 퀘스트에서 온 터치·버튼·글자 입력을 휴대폰에서 실행하는 접근성 서비스. */
public final class RemoteControlService extends AccessibilityService {

    static volatile RemoteControlService instance;

    public static boolean isOn() {
        return instance != null;
    }

    @Override
    protected void onServiceConnected() {
        instance = this;
        PhoneController.get(this).onAccessibilityChanged();
    }

    @Override
    public boolean onUnbind(Intent intent) {
        instance = null;
        PhoneController.get(this).onAccessibilityChanged();
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy() {
        instance = null;
        super.onDestroy();
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {}

    @Override
    public void onInterrupt() {}

    void gesture(Path path, long durationMs) {
        long d = Math.max(1, Math.min(durationMs, GestureDescription.getMaxGestureDuration()));
        GestureDescription g = new GestureDescription.Builder()
                .addStroke(new GestureDescription.StrokeDescription(path, 0, d))
                .build();
        dispatchGesture(g, null, null);
    }

    void global(int action) {
        performGlobalAction(action);
    }

    /** 포커스된 입력칸 끝에 글자 추가. 입력칸이 없으면 false */
    boolean typeText(String text) {
        AccessibilityNodeInfo n = findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
        if (n == null || !n.isEditable()) return false;
        String cur = currentText(n);
        return setText(n, cur + text);
    }

    boolean backspace() {
        AccessibilityNodeInfo n = findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
        if (n == null || !n.isEditable()) return false;
        String cur = currentText(n);
        if (cur.isEmpty()) return true;
        return setText(n, cur.substring(0, cur.offsetByCodePoints(cur.length(), -1)));
    }

    private static String currentText(AccessibilityNodeInfo n) {
        if (Build.VERSION.SDK_INT >= 26 && n.isShowingHintText()) return "";
        CharSequence t = n.getText();
        return t == null ? "" : t.toString();
    }

    private static boolean setText(AccessibilityNodeInfo n, String s) {
        Bundle args = new Bundle();
        args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, s);
        return n.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
    }
}

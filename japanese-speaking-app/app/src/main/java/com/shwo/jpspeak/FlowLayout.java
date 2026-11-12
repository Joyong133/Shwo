package com.shwo.jpspeak;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;

/** 자식 뷰를 왼쪽부터 채우고 넘치면 다음 줄로 넘기는 레이아웃 (후리가나 문장 표시용). */
public class FlowLayout extends ViewGroup {
    private int lineGap;

    public FlowLayout(Context c) { this(c, null); }

    public FlowLayout(Context c, AttributeSet a) {
        super(c, a);
        lineGap = (int) (6 * c.getResources().getDisplayMetrics().density);
    }

    @Override
    protected void onMeasure(int wSpec, int hSpec) {
        int maxW = MeasureSpec.getSize(wSpec) - getPaddingLeft() - getPaddingRight();
        if (MeasureSpec.getMode(wSpec) == MeasureSpec.UNSPECIFIED) maxW = (1 << 24);
        int x = 0, y = 0, lineH = 0, usedW = 0;
        for (int i = 0; i < getChildCount(); i++) {
            View ch = getChildAt(i);
            if (ch.getVisibility() == GONE) continue;
            ch.measure(MeasureSpec.makeMeasureSpec(maxW, MeasureSpec.AT_MOST),
                    MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED));
            int w = ch.getMeasuredWidth(), h = ch.getMeasuredHeight();
            if (x > 0 && x + w > maxW) { x = 0; y += lineH + lineGap; lineH = 0; }
            x += w;
            usedW = Math.max(usedW, x);
            lineH = Math.max(lineH, h);
        }
        int totalH = y + lineH + getPaddingTop() + getPaddingBottom();
        int totalW = usedW + getPaddingLeft() + getPaddingRight();
        setMeasuredDimension(resolveSize(totalW, wSpec), resolveSize(totalH, hSpec));
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int maxW = r - l - getPaddingLeft() - getPaddingRight();
        // 줄마다 가운데 정렬
        int start = 0;
        int y = getPaddingTop();
        while (start < getChildCount()) {
            int x = 0, lineH = 0, end = start;
            while (end < getChildCount()) {
                View ch = getChildAt(end);
                if (ch.getVisibility() == GONE) { end++; continue; }
                int w = ch.getMeasuredWidth();
                if (x > 0 && x + w > maxW) break;
                x += w;
                lineH = Math.max(lineH, ch.getMeasuredHeight());
                end++;
            }
            int cx = getPaddingLeft() + Math.max(0, (maxW - x) / 2);
            for (int i = start; i < end; i++) {
                View ch = getChildAt(i);
                if (ch.getVisibility() == GONE) continue;
                int w = ch.getMeasuredWidth(), h = ch.getMeasuredHeight();
                int cy = y + (lineH - h);   // 아래 기준 정렬
                ch.layout(cx, cy, cx + w, cy + h);
                cx += w;
            }
            y += lineH + lineGap;
            start = end;
        }
    }
}

package com.shwo.qpbridge;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.FrameLayout;

/** 영상 비율(가로/세로)을 유지하며 가능한 한 크게 그리는 틀 */
public final class AspectFrame extends FrameLayout {
    private float aspect = 9f / 19.5f;

    public AspectFrame(Context c, AttributeSet a) {
        super(c, a);
    }

    public void setAspect(float a) {
        if (a > 0 && Math.abs(a - aspect) > 0.001f) {
            aspect = a;
            requestLayout();
        }
    }

    @Override
    protected void onMeasure(int wSpec, int hSpec) {
        int maxW = MeasureSpec.getSize(wSpec), maxH = MeasureSpec.getSize(hSpec);
        int w = maxW, h = Math.round(maxW / aspect);
        if (h > maxH) {
            h = maxH;
            w = Math.round(maxH * aspect);
        }
        super.onMeasure(MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY), MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY));
    }
}

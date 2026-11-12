package com.shwo.jpspeak;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import java.util.List;

public class MainActivity extends Activity {

    private Progress progress;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_main);
        progress = new Progress(this);
        findViewById(R.id.btnSettings).setOnClickListener(v -> showSettings());
        findViewById(R.id.btnReview).setOnClickListener(v -> open(PracticeActivity.MODE_REVIEW));
        findViewById(R.id.btnContinue).setOnClickListener(v -> open(recommendedLevel()));
    }

    @Override
    protected void onResume() {
        super.onResume();
        refresh();
    }

    private void open(String levelOrMode) {
        Intent i = new Intent(this, PracticeActivity.class);
        i.putExtra(PracticeActivity.EXTRA_LEVEL, levelOrMode);
        startActivity(i);
    }

    private int passedCount(String level) {
        int c = 0;
        for (Sentence s : Levels.sentences(this, level)) if (progress.passed(s.id)) c++;
        return c;
    }

    /** 통과율 80% 미만인 가장 낮은 레벨 = 지금 공부할 레벨. */
    private String recommendedLevel() {
        for (String code : Levels.CODES) {
            int total = Levels.sentences(this, code).size();
            if (passedCount(code) < total * 0.8) return code;
        }
        return Levels.CODES[Levels.CODES.length - 1];
    }

    private int reviewCount() {
        int c = 0;
        for (Sentence s : Levels.all(this)) if (PracticeActivity.needsReview(progress, s)) c++;
        return c;
    }

    private void refresh() {
        int total = 0, passed = 0;
        for (Sentence s : Levels.all(this)) {
            total++;
            if (progress.passed(s.id)) passed++;
        }
        ((TextView) findViewById(R.id.statToday)).setText("오늘 통과\n" + progress.todayCount() + "문장");
        ((TextView) findViewById(R.id.statStreak)).setText("연속 학습\n" + progress.streak() + "일");
        ((TextView) findViewById(R.id.statTotal)).setText("전체 통과\n" + passed + " / " + total);

        String rec = recommendedLevel();
        ((TextView) findViewById(R.id.btnContinue)).setText("▶  " + Levels.name(rec) + " 이어서 연습하기");

        int review = reviewCount();
        TextView reviewBtn = findViewById(R.id.btnReview);
        reviewBtn.setText(review > 0 ? "🔁  약한 문장 복습 (" + review + "문장)" : "🔁  약한 문장 복습 (아직 없음)");
        reviewBtn.setEnabled(review > 0);
        reviewBtn.setAlpha(review > 0 ? 1f : 0.5f);

        LinearLayout list = findViewById(R.id.levelList);
        list.removeAllViews();
        for (int i = 0; i < Levels.CODES.length; i++) list.addView(levelCard(i, rec));
    }

    private int dp(float v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    private View levelCard(int i, String recommended) {
        String code = Levels.CODES[i];
        List<Sentence> list = Levels.sentences(this, code);
        int passed = passedCount(code);
        int bestSum = 0, tried = 0;
        for (Sentence s : list) {
            int b = progress.best(s.id);
            if (b >= 0) { bestSum += b; tried++; }
        }

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setBackgroundResource(R.drawable.bg_card);
        card.setPadding(dp(16), dp(14), dp(16), dp(14));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.bottomMargin = dp(10);
        card.setLayoutParams(lp);
        card.setClickable(true);
        card.setForeground(getDrawable(getThemeResId(android.R.attr.selectableItemBackground)));
        card.setOnClickListener(v -> open(code));

        LinearLayout row = new LinearLayout(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        TextView name = new TextView(this);
        name.setText(Levels.NAMES[i]);
        name.setTextSize(18);
        name.setTypeface(Typeface.DEFAULT_BOLD);
        name.setTextColor(getColor(R.color.text));
        row.addView(name);

        if (code.equals(recommended)) {
            TextView badge = new TextView(this);
            badge.setText("추천");
            badge.setTextSize(11);
            badge.setTextColor(0xFFFFFFFF);
            badge.setBackgroundResource(R.drawable.bg_btn_primary);
            badge.setPadding(dp(8), dp(2), dp(8), dp(2));
            LinearLayout.LayoutParams blp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            blp.leftMargin = dp(8);
            row.addView(badge, blp);
        }

        TextView count = new TextView(this);
        count.setText(passed == list.size() ? "완료 ✓" : passed + " / " + list.size());
        count.setTextSize(14);
        count.setTextColor(getColor(passed == list.size() ? R.color.ok : R.color.text_sub));
        count.setGravity(Gravity.END);
        row.addView(count, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        card.addView(row);

        TextView desc = new TextView(this);
        String avg = tried > 0 ? "  ·  평균 최고점 " + Math.round(bestSum / (float) tried) + "%" : "";
        desc.setText(Levels.DESCS[i] + avg);
        desc.setTextSize(13);
        desc.setTextColor(getColor(R.color.text_sub));
        desc.setPadding(0, dp(4), 0, dp(10));
        card.addView(desc);

        ProgressBar bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setProgressDrawable(getDrawable(R.drawable.progress_bar));
        bar.setMax(list.size());
        bar.setProgress(passed);
        card.addView(bar, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(6)));
        return card;
    }

    private int getThemeResId(int attr) {
        TypedValue tv = new TypedValue();
        getTheme().resolveAttribute(attr, tv, true);
        return tv.resourceId;
    }

    private void showSettings() {
        final int[] thresholds = {60, 70, 80, 90};
        String[] labels = new String[thresholds.length];
        int checked = 2;
        for (int i = 0; i < thresholds.length; i++) {
            labels[i] = thresholds[i] + "% 이상이면 통과" + (thresholds[i] == 80 ? " (기본)" : "");
            if (thresholds[i] == progress.threshold()) checked = i;
        }
        String[] items = {
                "통과 기준: " + progress.threshold() + "%",
                "새 문장에서 자동으로 발음 듣기: " + (progress.autoPlay() ? "켜짐" : "꺼짐"),
                "구글 음성 입력 창 사용: " + (progress.usePopup() ? "켜짐" : "꺼짐") + "\n(인식이 잘 안 될 때 켜 보세요)",
                "학습 기록 초기화",
        };
        final int checkedFinal = checked;
        new AlertDialog.Builder(this)
                .setTitle("설정")
                .setItems(items, (d, which) -> {
                    switch (which) {
                        case 0:
                            new AlertDialog.Builder(this).setTitle("통과 기준")
                                    .setSingleChoiceItems(labels, checkedFinal, (d2, w) -> {
                                        progress.setThreshold(thresholds[w]);
                                        d2.dismiss();
                                    }).show();
                            break;
                        case 1:
                            progress.setAutoPlay(!progress.autoPlay());
                            showSettings();
                            break;
                        case 2:
                            progress.setUsePopup(!progress.usePopup());
                            showSettings();
                            break;
                        case 3:
                            new AlertDialog.Builder(this).setTitle("학습 기록 초기화")
                                    .setMessage("모든 점수와 통과 기록을 지울까요? 되돌릴 수 없습니다.")
                                    .setPositiveButton("지우기", (d2, w) -> { progress.resetAll(); refresh(); })
                                    .setNegativeButton("취소", null).show();
                            break;
                    }
                })
                .setNegativeButton("닫기", null)
                .show();
    }
}

package com.shwo.jpspeak;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class PracticeActivity extends Activity {

    public static final String EXTRA_LEVEL = "level";
    public static final String MODE_REVIEW = "review";

    private static final int REQ_MIC = 1;
    private static final int REQ_POPUP = 2;
    private static final long AUTO_NEXT_MS = 1800;

    private Progress progress;
    private String mode;                  // 레벨 코드 또는 MODE_REVIEW
    private final ArrayList<Sentence> queue = new ArrayList<>();
    private int pos;
    private Sentence cur;
    private boolean passedNow;            // 지금 문장을 이번에 통과했는지
    private int passedThisRound;
    private boolean[] lastOk;             // 마지막 채점에서 조각별 정답 여부

    private TextToSpeech tts;
    private boolean ttsReady;
    private SpeechRecognizer recognizer;
    private boolean listening;
    private ToneGenerator tone;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable autoNext = this::next;

    private FlowLayout sentenceView;
    private TextView meaning, bestInfo, chip, counter, status, percent, verdict, heard, btnNext, toggleFuri, toggleMeaning;
    private LinearLayout resultBox;
    private ProgressBar bar;
    private ImageButton btnMic;
    private ImageView micRing;

    /** 복습이 필요한 문장: 시도했지만 아직 통과 못 했거나 최고점이 90% 미만. */
    public static boolean needsReview(Progress p, Sentence s) {
        return p.attempts(s.id) > 0 && (!p.passed(s.id) || p.best(s.id) < 90);
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_practice);
        progress = new Progress(this);
        mode = getIntent().getStringExtra(EXTRA_LEVEL);
        if (mode == null) mode = Levels.CODES[0];

        sentenceView = findViewById(R.id.sentence);
        meaning = findViewById(R.id.meaning);
        bestInfo = findViewById(R.id.bestInfo);
        chip = findViewById(R.id.chip);
        counter = findViewById(R.id.counter);
        status = findViewById(R.id.status);
        percent = findViewById(R.id.percent);
        verdict = findViewById(R.id.verdict);
        heard = findViewById(R.id.heard);
        resultBox = findViewById(R.id.resultBox);
        bar = findViewById(R.id.progress);
        btnMic = findViewById(R.id.btnMic);
        micRing = findViewById(R.id.micRing);
        btnNext = findViewById(R.id.btnNext);
        toggleFuri = findViewById(R.id.toggleFuri);
        toggleMeaning = findViewById(R.id.toggleMeaning);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
        findViewById(R.id.btnListen).setOnClickListener(v -> speak(1.0f));
        findViewById(R.id.btnSlow).setOnClickListener(v -> speak(0.6f));
        sentenceView.setOnClickListener(v -> speak(1.0f));
        findViewById(R.id.btnSkip).setOnClickListener(v -> skip());
        btnNext.setOnClickListener(v -> { if (passedNow) next(); });
        btnMic.setOnClickListener(v -> onMic());
        toggleFuri.setOnClickListener(v -> { progress.setFurigana(!progress.furigana()); renderSentence(lastOk); updateToggles(); });
        toggleMeaning.setOnClickListener(v -> { progress.setMeaning(!progress.meaning()); updateToggles(); });

        try {
            tone = new ToneGenerator(AudioManager.STREAM_MUSIC, 70);
        } catch (RuntimeException ignored) {
        }

        buildQueue();
        if (queue.isEmpty()) {
            Toast.makeText(this, "복습할 문장이 아직 없어요. 먼저 레벨 연습을 해 보세요!", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
        ((TextView) findViewById(R.id.title)).setText(
                MODE_REVIEW.equals(mode) ? "약한 문장 복습" : Levels.name(mode));

        tts = new TextToSpeech(this, st -> {
            if (st != TextToSpeech.SUCCESS) {
                status.setText("음성 합성(TTS)을 사용할 수 없어요.");
                return;
            }
            int r = tts.setLanguage(Locale.JAPAN);
            if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) {
                askInstallJapaneseVoice();
                return;
            }
            ttsReady = true;
            if (progress.autoPlay() && cur != null && !listening) handler.postDelayed(() -> speak(1.0f), 300);
        });

        pos = 0;
        show();
    }

    // ---------------------------------------------------------------- 문장 순서

    private void buildQueue() {
        queue.clear();
        if (MODE_REVIEW.equals(mode)) {
            for (Sentence s : Levels.all(this)) if (needsReview(progress, s)) queue.add(s);
            queue.sort((a, c) -> Integer.compare(progress.best(a.id), progress.best(c.id)));
        } else {
            List<Sentence> all = Levels.sentences(this, mode);
            ArrayList<Sentence> done = new ArrayList<>();
            for (Sentence s : all) {
                if (progress.passed(s.id)) done.add(s);
                else queue.add(s);                 // 아직 통과 못 한 문장을 먼저 (순서대로)
            }
            done.sort((a, c) -> Integer.compare(progress.best(a.id), progress.best(c.id)));
            queue.addAll(done);                    // 그다음 통과한 문장을 점수 낮은 순으로 복습
        }
        passedThisRound = 0;
    }

    private void show() {
        handler.removeCallbacks(autoNext);
        stopListening();
        if (tts != null) tts.stop();
        cur = queue.get(pos);
        passedNow = false;
        lastOk = null;

        chip.setText(Levels.name(cur.level) + " · " + cur.number + "번");
        updateCounter();
        meaning.setText(cur.korean);
        resultBox.setVisibility(View.GONE);
        status.setText("🔊 발음을 듣고, 🎤를 눌러 따라 말해 보세요");
        updateBestInfo();
        updateToggles();
        updateNextButton();
        renderSentence(null);

        if (ttsReady && progress.autoPlay()) handler.postDelayed(() -> speak(1.0f), 350);
    }

    private void next() {
        handler.removeCallbacks(autoNext);
        if (pos + 1 >= queue.size()) {
            roundFinished();
            return;
        }
        pos++;
        show();
    }

    /** 건너뛴 문장은 3문장 뒤에 다시 나온다. */
    private void skip() {
        handler.removeCallbacks(autoNext);
        if (pos >= queue.size() - 1) {
            roundFinished();
            return;
        }
        Sentence s = queue.remove(pos);
        queue.add(Math.min(pos + 3, queue.size()), s);
        show();
    }

    private void roundFinished() {
        stopListening();
        if (tts != null) tts.stop();
        StringBuilder msg = new StringBuilder("이번에 통과한 문장: " + passedThisRound + "개");
        String nextLevel = null;
        if (!MODE_REVIEW.equals(mode)) {
            List<Sentence> all = Levels.sentences(this, mode);
            int p = 0;
            for (Sentence s : all) if (progress.passed(s.id)) p++;
            msg.append("\n").append(Levels.name(mode)).append(" 통과: ").append(p).append(" / ").append(all.size());
            int i = Levels.indexOf(mode);
            if (i >= 0 && i + 1 < Levels.CODES.length) nextLevel = Levels.CODES[i + 1];
            if (p < all.size()) msg.append("\n\n아직 통과 못 한 문장이 있어요. 한 번 더 도전해 볼까요?");
            else if (nextLevel != null) msg.append("\n\n이 레벨을 모두 통과했어요! 다음 레벨에 도전해 보세요.");
        }
        AlertDialog.Builder d = new AlertDialog.Builder(this)
                .setTitle("한 바퀴 완료! 🎉")
                .setMessage(msg)
                .setCancelable(false)
                .setPositiveButton("다시 연습", (x, w) -> {
                    buildQueue();
                    if (queue.isEmpty()) { finish(); return; }
                    pos = 0;
                    show();
                })
                .setNegativeButton("목록으로", (x, w) -> finish());
        if (nextLevel != null) {
            final String nl = nextLevel;
            d.setNeutralButton(Levels.name(nl) + " 도전", (x, w) -> {
                mode = nl;
                ((TextView) findViewById(R.id.title)).setText(Levels.name(nl));
                buildQueue();
                pos = 0;
                show();
            });
        }
        d.show();
    }

    // ---------------------------------------------------------------- 화면 그리기

    private int dp(float v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    /** 문장을 후리가나와 함께 그린다. ok 가 주어지면 맞은 조각은 초록, 틀린 조각은 빨강. */
    private void renderSentence(boolean[] ok) {
        lastOk = ok;
        sentenceView.removeAllViews();
        int len = cur.text().length();
        float size = len <= 14 ? 30 : len <= 22 ? 26 : 22;
        boolean furi = progress.furigana();
        for (int i = 0; i < cur.segs.size(); i++) {
            Sentence.Seg s = cur.segs.get(i);
            LinearLayout unit = new LinearLayout(this);
            unit.setOrientation(LinearLayout.VERTICAL);
            unit.setGravity(Gravity.CENTER_HORIZONTAL);

            TextView ruby = new TextView(this);
            ruby.setTextSize(size * 0.42f);
            ruby.setTextColor(getColor(R.color.text_sub));
            ruby.setText(s.ruby != null ? s.ruby : " ");
            ruby.setIncludeFontPadding(false);
            ruby.setVisibility(furi ? View.VISIBLE : View.GONE);
            unit.addView(ruby);

            TextView base = new TextView(this);
            base.setTextSize(size);
            base.setText(s.display);
            base.setIncludeFontPadding(false);
            int color = R.color.text;
            if (ok != null && s.scored) color = ok[i] ? R.color.ok : R.color.ng;
            base.setTextColor(getColor(color));
            unit.addView(base);

            unit.setPadding(s.ruby != null ? dp(1) : 0, 0, s.ruby != null ? dp(1) : 0, 0);
            sentenceView.addView(unit);
        }
    }

    private void updateToggles() {
        toggleFuri.setText(progress.furigana() ? "후리가나 숨기기" : "후리가나 보기");
        toggleMeaning.setText(progress.meaning() ? "뜻 숨기기" : "뜻 보기");
        meaning.setVisibility(progress.meaning() ? View.VISIBLE : View.INVISIBLE);
    }

    private void updateBestInfo() {
        int best = progress.best(cur.id), tries = progress.attempts(cur.id);
        if (tries == 0) bestInfo.setText("처음 보는 문장");
        else bestInfo.setText("최고 " + Math.max(0, best) + "% · " + tries + "회 시도" + (progress.passed(cur.id) ? " · 통과 ✓" : ""));
    }

    /** 레벨 연습: 이 레벨에서 통과한 문장 수 / 복습: 몇 번째 문장인지. */
    private void updateCounter() {
        if (MODE_REVIEW.equals(mode)) {
            counter.setText((pos + 1) + " / " + queue.size());
            bar.setMax(queue.size());
            bar.setProgress(pos);
        } else {
            List<Sentence> all = Levels.sentences(this, mode);
            int p = 0;
            for (Sentence x : all) if (progress.passed(x.id)) p++;
            counter.setText("통과 " + p + " / " + all.size());
            bar.setMax(all.size());
            bar.setProgress(p);
        }
    }

    private void updateNextButton() {
        btnNext.setAlpha(passedNow ? 1f : 0.35f);
        btnNext.setEnabled(passedNow);
    }

    private void showResult(Scorer.Result r) {
        int threshold = progress.threshold();
        boolean pass = r.percent >= threshold;
        boolean first = progress.record(cur.id, r.percent, pass);
        renderSentence(r.segOk);
        updateBestInfo();
        updateCounter();

        resultBox.setVisibility(View.VISIBLE);
        resultBox.setBackgroundResource(pass ? R.drawable.bg_result_ok : R.drawable.bg_result_ng);
        percent.setText(r.percent + "%");
        percent.setTextColor(getColor(pass ? R.color.ok : r.percent >= threshold - 15 ? R.color.warn : R.color.ng));
        verdict.setTextColor(getColor(pass ? R.color.ok : R.color.ng));
        heard.setText(r.heard == null || r.heard.isEmpty() ? "" : "들린 말: " + r.heard);

        if (pass) {
            if (!passedNow) passedThisRound++;
            passedNow = true;
            verdict.setText(first ? "통과! 🎉 새 문장을 익혔어요" : "통과! 🎉");
            status.setText("잠시 후 다음 문장으로 넘어가요…");
            beep(ToneGenerator.TONE_PROP_ACK);
            handler.postDelayed(autoNext, AUTO_NEXT_MS);
        } else {
            verdict.setText(r.percent >= threshold - 15
                    ? "아까워요! 빨간 글자 부분을 다시 말해 보세요"
                    : "🔊 발음을 다시 듣고 천천히 말해 보세요");
            status.setText("통과 기준 " + threshold + "% · 🎤를 눌러 다시 도전");
            beep(ToneGenerator.TONE_PROP_NACK);
        }
        updateNextButton();
    }

    private void beep(int type) {
        if (tone != null) {
            try { tone.startTone(type, 150); } catch (RuntimeException ignored) { }
        }
    }

    // ---------------------------------------------------------------- 음성 합성 (듣기)

    private void speak(float rate) {
        if (cur == null) return;
        if (!ttsReady) {
            Toast.makeText(this, "일본어 음성을 준비 중이거나 설치되지 않았어요.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (listening) return;
        tts.stop();
        tts.setSpeechRate(rate);
        tts.speak(cur.text(), TextToSpeech.QUEUE_FLUSH, null, "sentence");
    }

    private void askInstallJapaneseVoice() {
        new AlertDialog.Builder(this)
                .setTitle("일본어 음성이 없어요")
                .setMessage("발음 듣기를 하려면 일본어 음성 데이터가 필요해요.\n설정 → 텍스트 음성 변환(TTS)에서 일본어를 설치해 주세요. (따라 말하기 채점은 지금도 사용할 수 있어요)")
                .setPositiveButton("설치하기", (d, w) -> {
                    try {
                        startActivity(new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA));
                    } catch (ActivityNotFoundException e) {
                        Toast.makeText(this, "설정 앱에서 직접 설치해 주세요.", Toast.LENGTH_LONG).show();
                    }
                })
                .setNegativeButton("나중에", null)
                .show();
    }

    // ---------------------------------------------------------------- 음성 인식 (따라 말하기)

    private void onMic() {
        if (listening) {
            if (recognizer != null) recognizer.stopListening();
            status.setText("인식 중…");
            return;
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
            return;
        }
        startListening();
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
        super.onRequestPermissionsResult(req, perms, results);
        if (req != REQ_MIC) return;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
            startListening();
        } else if (!shouldShowRequestPermissionRationale(Manifest.permission.RECORD_AUDIO)) {
            new AlertDialog.Builder(this)
                    .setTitle("마이크 권한이 필요해요")
                    .setMessage("따라 말한 발음을 확인하려면 마이크 권한을 허용해 주세요.")
                    .setPositiveButton("설정 열기", (d, w) -> startActivity(new Intent(
                            Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()))))
                    .setNegativeButton("취소", null)
                    .show();
        } else {
            status.setText("마이크 권한이 있어야 발음을 확인할 수 있어요.");
        }
    }

    private Intent recognizeIntent() {
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ja-JP");
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ja-JP");
        i.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, true);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        i.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);
        i.putExtra(RecognizerIntent.EXTRA_PROMPT, cur.text());
        return i;
    }

    private void startListening() {
        handler.removeCallbacks(autoNext);
        if (tts != null) tts.stop();
        if (progress.usePopup() || !SpeechRecognizer.isRecognitionAvailable(this)) {
            startPopup();
            return;
        }
        if (recognizer == null) {
            recognizer = SpeechRecognizer.createSpeechRecognizer(this);
            recognizer.setRecognitionListener(listener);
        }
        setListeningUi(true);
        status.setText("준비 중…");
        try {
            recognizer.startListening(recognizeIntent());
        } catch (RuntimeException e) {
            setListeningUi(false);
            startPopup();
        }
    }

    private void startPopup() {
        try {
            startActivityForResult(recognizeIntent(), REQ_POPUP);
        } catch (ActivityNotFoundException e) {
            new AlertDialog.Builder(this)
                    .setTitle("음성 인식을 사용할 수 없어요")
                    .setMessage("이 기기에 음성 인식 서비스가 없어요.\nPlay 스토어에서 'Google' 앱을 설치하거나 업데이트한 뒤 다시 시도해 주세요.")
                    .setPositiveButton("확인", null)
                    .show();
        }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req != REQ_POPUP) return;
        if (res == RESULT_OK && data != null) {
            ArrayList<String> list = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (list != null && !list.isEmpty()) {
                showResult(Scorer.best(cur, list));
                return;
            }
        }
        status.setText("인식된 말이 없어요. 🎤를 눌러 다시 말해 보세요.");
    }

    private void stopListening() {
        if (listening && recognizer != null) recognizer.cancel();
        setListeningUi(false);
    }

    private void setListeningUi(boolean on) {
        listening = on;
        btnMic.setBackgroundResource(on ? R.drawable.bg_mic_on : R.drawable.bg_mic);
        btnMic.setImageResource(on ? R.drawable.ic_stop : R.drawable.ic_mic);
        micRing.setAlpha(on ? 0.25f : 0f);
        micRing.setScaleX(1f);
        micRing.setScaleY(1f);
    }

    private final RecognitionListener listener = new RecognitionListener() {
        @Override public void onReadyForSpeech(Bundle params) { status.setText("🎤 듣고 있어요… 문장을 읽어 주세요"); }
        @Override public void onBeginningOfSpeech() { }
        @Override public void onBufferReceived(byte[] buffer) { }
        @Override public void onEndOfSpeech() { status.setText("채점 중…"); }
        @Override public void onEvent(int eventType, Bundle params) { }

        @Override
        public void onRmsChanged(float rms) {
            if (!listening) return;
            float lv = Math.max(0f, Math.min(1f, (rms + 2f) / 12f));
            micRing.setAlpha(0.2f + 0.5f * lv);
            micRing.setScaleX(0.85f + 0.2f * lv);
            micRing.setScaleY(0.85f + 0.2f * lv);
        }

        @Override
        public void onPartialResults(Bundle partial) {
            ArrayList<String> l = partial.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            if (l != null && !l.isEmpty() && !l.get(0).isEmpty()) status.setText("… " + l.get(0));
        }

        @Override
        public void onResults(Bundle results) {
            setListeningUi(false);
            ArrayList<String> l = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            if (l == null || l.isEmpty() || l.get(0).trim().isEmpty()) {
                status.setText("잘 알아듣지 못했어요. 조금 더 크고 또박또박 말해 보세요.");
                return;
            }
            showResult(Scorer.best(cur, l));
        }

        @Override
        public void onError(int error) {
            setListeningUi(false);
            switch (error) {
                case SpeechRecognizer.ERROR_NO_MATCH:
                    status.setText("잘 알아듣지 못했어요. 조금 더 크고 또박또박 말해 보세요.");
                    break;
                case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                    status.setText("말소리가 들리지 않았어요. 🎤를 누르고 바로 말해 보세요.");
                    break;
                case SpeechRecognizer.ERROR_NETWORK:
                case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                    status.setText("인터넷 연결을 확인해 주세요. (음성 인식에 필요해요)");
                    break;
                case SpeechRecognizer.ERROR_AUDIO:
                    status.setText("마이크를 사용할 수 없어요. 다른 앱이 마이크를 쓰고 있는지 확인해 주세요.");
                    break;
                case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                    status.setText("마이크 권한이 필요해요.");
                    break;
                case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                case SpeechRecognizer.ERROR_CLIENT:
                    recreateRecognizer();
                    status.setText("음성 인식을 다시 준비했어요. 🎤를 다시 눌러 주세요.");
                    break;
                case 12: // ERROR_LANGUAGE_NOT_SUPPORTED (Android 12+)
                case 13: // ERROR_LANGUAGE_UNAVAILABLE
                case 11: // ERROR_SERVER_DISCONNECTED
                    offerPopupMode();
                    break;
                default:
                    status.setText("음성 인식 오류(" + error + "). 🎤를 다시 눌러 주세요.");
            }
        }
    };

    private void recreateRecognizer() {
        if (recognizer != null) recognizer.destroy();
        recognizer = null;
    }

    private void offerPopupMode() {
        status.setText("기본 음성 인식기가 일본어를 지원하지 않아요.");
        new AlertDialog.Builder(this)
                .setTitle("구글 음성 입력으로 바꿀까요?")
                .setMessage("이 기기의 기본 음성 인식기가 일본어를 지원하지 않는 것 같아요. 구글 음성 입력 창으로 바꿔서 시도할까요? (설정에서 다시 바꿀 수 있어요)")
                .setPositiveButton("바꾸기", (d, w) -> { progress.setUsePopup(true); startPopup(); })
                .setNegativeButton("취소", null)
                .show();
    }

    // ---------------------------------------------------------------- 생명주기

    @Override
    protected void onPause() {
        super.onPause();
        handler.removeCallbacks(autoNext);
        stopListening();
        if (tts != null) tts.stop();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacksAndMessages(null);
        if (recognizer != null) recognizer.destroy();
        if (tts != null) tts.shutdown();
        if (tone != null) tone.release();
    }
}

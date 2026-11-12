package com.shwo.animeshadow

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.graphics.Typeface
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.google.android.material.chip.Chip
import com.google.android.material.materialswitch.MaterialSwitch
import com.google.android.material.progressindicator.LinearProgressIndicator
import com.google.android.material.slider.Slider
import java.util.Locale

class PracticeActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    private lateinit var prefs: Prefs
    private lateinit var quotes: List<Quote>
    private var idx = 0
    private val q get() = quotes[idx]

    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var recognizer: SpeechRecognizer? = null
    private var listening = false
    private var pendingListen = false
    private val main = Handler(Looper.getMainLooper())

    // views
    private lateinit var tvCounter: TextView
    private lateinit var tvFav: TextView
    private lateinit var tvSource: TextView
    private lateinit var tvJp: TextView
    private lateinit var tvKana: TextView
    private lateinit var tvHangul: TextView
    private lateinit var tvKo: TextView
    private lateinit var tvBest: TextView
    private lateinit var chipKana: Chip
    private lateinit var chipHangul: Chip
    private lateinit var chipKo: Chip
    private lateinit var slider: Slider
    private lateinit var tvSpeed: TextView
    private lateinit var btnListen: MaterialButton
    private lateinit var btnSlow: MaterialButton
    private lateinit var btnMic: MaterialButton
    private lateinit var tvMicState: TextView
    private lateinit var level: LinearProgressIndicator
    private lateinit var swShadow: MaterialSwitch
    private lateinit var cardResult: MaterialCardView
    private lateinit var tvScore: TextView
    private lateinit var tvMsg: TextView
    private lateinit var tvHeard: TextView
    private lateinit var tvDiff: TextView
    private lateinit var btnPrev: MaterialButton
    private lateinit var btnNext: MaterialButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_practice)
        prefs = Prefs(this)

        val byId = QuoteRepo.byId(this)
        quotes = intent.getStringArrayListExtra(EXTRA_IDS)?.mapNotNull { byId[it] }
            ?.takeIf { it.isNotEmpty() } ?: QuoteRepo.all(this)
        idx = (savedInstanceState?.getInt(EXTRA_INDEX) ?: intent.getIntExtra(EXTRA_INDEX, 0))
            .coerceIn(0, quotes.size - 1)

        bindViews()
        setupControls()

        tts = TextToSpeech(this, this, GOOGLE_TTS)
        show(autoPlay = false)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putInt(EXTRA_INDEX, idx)
    }

    private fun bindViews() {
        tvCounter = findViewById(R.id.tvCounter)
        tvFav = findViewById(R.id.tvFav)
        tvSource = findViewById(R.id.tvSource)
        tvJp = findViewById(R.id.tvJp)
        tvKana = findViewById(R.id.tvKana)
        tvHangul = findViewById(R.id.tvHangul)
        tvKo = findViewById(R.id.tvKo)
        tvBest = findViewById(R.id.tvBest)
        chipKana = findViewById(R.id.chipKana)
        chipHangul = findViewById(R.id.chipHangul)
        chipKo = findViewById(R.id.chipKo)
        slider = findViewById(R.id.slider)
        tvSpeed = findViewById(R.id.tvSpeed)
        btnListen = findViewById(R.id.btnListen)
        btnSlow = findViewById(R.id.btnSlow)
        btnMic = findViewById(R.id.btnMic)
        tvMicState = findViewById(R.id.tvMicState)
        level = findViewById(R.id.level)
        swShadow = findViewById(R.id.swShadow)
        cardResult = findViewById(R.id.cardResult)
        tvScore = findViewById(R.id.tvScore)
        tvMsg = findViewById(R.id.tvMsg)
        tvHeard = findViewById(R.id.tvHeard)
        tvDiff = findViewById(R.id.tvDiff)
        btnPrev = findViewById(R.id.btnPrev)
        btnNext = findViewById(R.id.btnNext)
    }

    private fun setupControls() {
        findViewById<View>(R.id.btnBack).setOnClickListener { finish() }
        tvFav.setOnClickListener {
            prefs.toggleFav(q.id); updateFav()
        }

        chipKana.isChecked = prefs.showKana
        chipHangul.isChecked = prefs.showHangul
        chipKo.isChecked = prefs.showKo
        chipKana.setOnCheckedChangeListener { _, b -> prefs.showKana = b; applyVisibility() }
        chipHangul.setOnCheckedChangeListener { _, b -> prefs.showHangul = b; applyVisibility() }
        chipKo.setOnCheckedChangeListener { _, b -> prefs.showKo = b; applyVisibility() }

        slider.value = prefs.speed.coerceIn(slider.valueFrom, slider.valueTo)
        updateSpeedLabel()
        slider.addOnChangeListener { _, v, _ -> prefs.speed = v; updateSpeedLabel() }

        swShadow.isChecked = prefs.shadowing
        swShadow.setOnCheckedChangeListener { _, b ->
            prefs.shadowing = b
            if (b) Toast.makeText(this, "듣기가 끝나면 바로 마이크가 켜져요. 넘기면 자동 재생!", Toast.LENGTH_SHORT).show()
        }

        btnListen.setOnClickListener { speak(prefs.speed) }
        btnSlow.setOnClickListener { speak(prefs.speed * 0.6f) }
        btnMic.setOnClickListener { if (listening) recognizer?.stopListening() else startListening() }

        btnPrev.setOnClickListener { move(-1) }
        btnNext.setOnClickListener { move(+1) }
    }

    private fun updateSpeedLabel() {
        tvSpeed.text = String.format(Locale.US, "속도 %.1fx", slider.value)
    }

    private fun move(d: Int) {
        val n = idx + d
        if (n !in quotes.indices) {
            Toast.makeText(this, if (d > 0) "마지막 대사예요! 수고했어요 👏" else "첫 대사예요", Toast.LENGTH_SHORT).show()
            return
        }
        idx = n
        show(autoPlay = swShadow.isChecked)
    }

    private fun show(autoPlay: Boolean) {
        stopAll()
        tvCounter.text = "${idx + 1} / ${quotes.size}"
        tvSource.text = "${q.anime} · ${q.who}  [${levelLabel(q.level)}]"
        tvJp.text = q.jp
        tvKana.text = q.kana
        tvHangul.text = q.hangul
        tvKo.text = q.ko
        updateFav()
        updateBest()
        applyVisibility()
        cardResult.visibility = View.GONE
        tvMicState.text = "🔊 먼저 듣고, 🎤 따라 말해보세요"
        btnPrev.isEnabled = idx > 0
        btnNext.isEnabled = idx < quotes.size - 1
        if (autoPlay) main.postDelayed({ speak(prefs.speed) }, 350)
    }

    private fun updateFav() {
        tvFav.text = if (prefs.isFav(q.id)) "★" else "☆"
    }

    private fun updateBest() {
        val b = prefs.best(q.id)
        tvBest.text = if (b < 0) "아직 도전 전" else "내 최고 점수 ${b}점" + if (b >= Prefs.PASS) " ✅" else ""
    }

    private fun applyVisibility() {
        tvKana.visibility = if (chipKana.isChecked && q.needsReading) View.VISIBLE else View.GONE
        tvHangul.visibility = if (chipHangul.isChecked) View.VISIBLE else View.GONE
        tvKo.visibility = if (chipKo.isChecked) View.VISIBLE else View.GONE
    }

    // ───────────────────────── TTS

    override fun onInit(status: Int) {
        val t = tts ?: return
        if (status != TextToSpeech.SUCCESS) {
            ttsReady = false
            showTtsHelp(); return
        }
        val r = t.setLanguage(Locale.JAPAN)
        if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) {
            ttsReady = false
            showTtsHelp(); return
        }
        ttsReady = true
        t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(id: String?) {
                runOnUiThread { tvMicState.text = "🔊 원어민 발음 재생 중…" }
            }

            override fun onDone(id: String?) {
                runOnUiThread {
                    if (swShadow.isChecked && !isFinishing) {
                        tvMicState.text = "🎤 이제 따라 말하세요!"
                        main.postDelayed({ if (!isFinishing) startListening() }, 250)
                    } else {
                        tvMicState.text = "🎤 버튼을 누르고 따라 말해보세요"
                    }
                }
            }

            @Deprecated("Deprecated in Java")
            override fun onError(id: String?) {
                runOnUiThread { tvMicState.text = "재생 오류가 났어요. 다시 눌러주세요" }
            }
        })
    }

    private fun showTtsHelp() {
        AlertDialog.Builder(this)
            .setTitle("일본어 음성이 없어요")
            .setMessage("원어민 발음을 들으려면 일본어 음성 데이터가 필요해요.\n\n설정 → 일반 → 텍스트 음성 변환(TTS)에서 'Google 음성 서비스'를 선택하고 일본어 음성을 설치해주세요.")
            .setPositiveButton("설치하러 가기") { _, _ ->
                try {
                    startActivity(Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA))
                } catch (e: ActivityNotFoundException) {
                    try {
                        startActivity(Intent("com.android.settings.TTS_SETTINGS"))
                    } catch (_: Exception) {
                    }
                }
            }
            .setNegativeButton("닫기", null)
            .show()
    }

    private fun speak(rate: Float) {
        if (listening) cancelListening()
        val t = tts
        if (t == null || !ttsReady) {
            showTtsHelp(); return
        }
        t.setSpeechRate(rate)
        t.setPitch(1.0f)
        t.speak(q.speakText, TextToSpeech.QUEUE_FLUSH, null, "utt_${q.id}")
    }

    // ───────────────────────── 음성 인식

    private fun startListening() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingListen = true
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), REQ_MIC)
            return
        }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            AlertDialog.Builder(this)
                .setTitle("음성 인식을 쓸 수 없어요")
                .setMessage("이 기기에 음성 인식 서비스가 없어요. Play 스토어에서 'Google' 앱(또는 'Speech Recognition & Synthesis')을 설치/업데이트한 뒤 다시 시도해주세요.")
                .setPositiveButton("확인", null)
                .show()
            return
        }
        tts?.stop()
        val rec = recognizer ?: SpeechRecognizer.createSpeechRecognizer(this).also {
            it.setRecognitionListener(listener)
            recognizer = it
        }
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ja-JP")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ja-JP")
            putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, true)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, packageName)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L)
        }
        listening = true
        setMicUi(true)
        tvMicState.text = "준비 중…"
        cardResult.visibility = View.GONE
        rec.startListening(intent)
    }

    private fun cancelListening() {
        listening = false
        recognizer?.cancel()
        setMicUi(false)
    }

    private fun setMicUi(on: Boolean) {
        btnMic.text = if (on) "⏹  말하기 끝 (탭)" else "🎤  따라 말하기"
        btnMic.backgroundTintList = ColorStateList.valueOf(
            ContextCompat.getColor(this, if (on) R.color.score_bad else R.color.brand))
        level.visibility = if (on) View.VISIBLE else View.INVISIBLE
        level.progress = 0
    }

    private val listener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            tvMicState.text = "🎤 듣고 있어요… 말하세요!"
        }

        override fun onBeginningOfSpeech() {}

        override fun onRmsChanged(rmsdB: Float) {
            level.progress = ((rmsdB + 2f) * 8f).toInt().coerceIn(0, 100)
        }

        override fun onBufferReceived(buffer: ByteArray?) {}

        override fun onEndOfSpeech() {
            tvMicState.text = "채점 중…"
        }

        override fun onError(error: Int) {
            if (!listening) return
            listening = false
            setMicUi(false)
            tvMicState.text = when (error) {
                SpeechRecognizer.ERROR_NO_MATCH, SpeechRecognizer.ERROR_SPEECH_TIMEOUT ->
                    "잘 안 들렸어요 😅 조금 더 크게 다시 말해봐요"
                SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT ->
                    "인터넷 연결을 확인해주세요 (음성 인식에 필요해요)"
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "마이크 권한이 필요해요"
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "음성 인식이 바빠요. 잠시 후 다시!"
                12, 13 -> "일본어 음성 인식이 지원되지 않아요. Google 앱 설정 → 음성에서 일본어를 추가해주세요"
                else -> "음성 인식 오류($error). 다시 시도해주세요"
            }
            if (error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY || error == SpeechRecognizer.ERROR_CLIENT) {
                recognizer?.destroy(); recognizer = null
            }
        }

        override fun onResults(results: Bundle?) {
            listening = false
            setMicUi(false)
            val list = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION).orEmpty()
            showResult(list)
        }

        override fun onPartialResults(partialResults: Bundle?) {
            val p = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()
            if (!p.isNullOrBlank()) tvMicState.text = "🎤 $p"
        }

        override fun onEvent(eventType: Int, params: Bundle?) {}
    }

    private fun showResult(heard: List<String>) {
        val r = Scorer.evaluate(heard.filter { it.isNotBlank() }, q.jp, q.kana)
        if (r == null) {
            tvMicState.text = "잘 안 들렸어요 😅 다시 말해봐요"
            return
        }
        val isBest = prefs.saveScore(q.id, r.score)
        updateBest()

        val color = ContextCompat.getColor(this, when {
            r.score >= Prefs.PASS -> R.color.score_good
            r.score >= 40 -> R.color.score_mid
            else -> R.color.score_bad
        })
        tvScore.text = "${r.score}점"
        tvScore.setTextColor(color)
        tvMsg.text = Scorer.message(r.score) + if (isBest && r.score > 0) "\n🏆 최고 기록 갱신!" else ""
        tvHeard.text = "내 발음 인식 결과: 「${r.heard}」"

        val good = ContextCompat.getColor(this, R.color.score_good)
        val bad = ContextCompat.getColor(this, R.color.score_bad)
        val sb = SpannableStringBuilder(r.target)
        r.hit.forEachIndexed { i, h ->
            if (h != null) {
                sb.setSpan(ForegroundColorSpan(if (h) good else bad), i, i + 1, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
                if (!h) sb.setSpan(StyleSpan(Typeface.BOLD), i, i + 1, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            }
        }
        tvDiff.text = sb
        cardResult.visibility = View.VISIBLE
        tvMicState.text = if (r.score >= Prefs.PASS) "통과! 다음 대사로 넘어가볼까요? ▶" else "빨간 글자 부분을 신경 써서 다시 해봐요"
        cardResult.post {
            findViewById<androidx.core.widget.NestedScrollView>(R.id.scroll).smoothScrollTo(0, cardResult.top)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQ_MIC) {
            if (grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
                if (pendingListen) startListening()
            } else {
                Toast.makeText(this, "따라 말하기 채점에는 마이크 권한이 필요해요", Toast.LENGTH_LONG).show()
            }
            pendingListen = false
        }
    }

    private fun stopAll() {
        main.removeCallbacksAndMessages(null)
        tts?.stop()
        if (listening) cancelListening()
    }

    override fun onPause() {
        super.onPause()
        stopAll()
    }

    override fun onDestroy() {
        super.onDestroy()
        tts?.shutdown()
        recognizer?.destroy()
    }

    companion object {
        const val EXTRA_IDS = "ids"
        const val EXTRA_INDEX = "index"
        private const val REQ_MIC = 7
        private const val GOOGLE_TTS = "com.google.android.tts"
    }
}

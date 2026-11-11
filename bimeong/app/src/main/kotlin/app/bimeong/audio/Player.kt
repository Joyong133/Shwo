package app.bimeong.audio

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.AudioTrack
import android.os.SystemClock
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.core.content.edit
import app.bimeong.data.Presets
import app.bimeong.engine.Catalog
import app.bimeong.engine.Mixer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

data class SavedMix(val name: String, val levels: Map<String, Float>)

/**
 * A running focus timer.
 *
 * @param endsAt end of the current block, on the [SystemClock.elapsedRealtime] clock
 * @param round which focus block this is, starting at 1
 */
data class FocusState(val focusMin: Int, val breakMin: Int, val onBreak: Boolean, val endsAt: Long, val round: Int)

data class PlayerState(
    /** Sounds that are switched on, with their slider position (0..1). */
    val levels: Map<String, Float> = emptyMap(),
    val playing: Boolean = false,
    /** True from the first play until the user stops: while it is, the playback service stays up. */
    val sessionActive: Boolean = false,
    val master: Float = 0.9f,
    val warmth: Float = 0.25f,
    /** End of the sleep timer on the elapsedRealtime clock, or 0 when off. */
    val sleepEndsAt: Long = 0L,
    val focus: FocusState? = null,
    val saved: List<SavedMix> = emptyList(),
    val mixWithOthers: Boolean = false,
)

/**
 * The single source of truth for what is playing. The UI and the playback service both
 * observe [state] and call the functions here; all of them must be called on the main thread.
 */
// The only context kept here is the application context, which lives as long as the process does.
@SuppressLint("StaticFieldLeak")
object Player {
    const val DEFAULT_LEVEL = 0.7f
    const val MIN_LEVEL = 0.05f
    private const val SLEEP_FADE_MS = 60_000L
    private const val PAUSE_TIMEOUT_MS = 10 * 60_000L
    private const val TAG = "Player"

    private var app: Context? = null
    private var prefs: SharedPreferences? = null
    private val _state = MutableStateFlow(PlayerState())
    val state: StateFlow<PlayerState> = _state.asStateFlow()

    private val _now = MutableStateFlow(0L)

    /** Current elapsedRealtime, refreshed twice a second while anything is running. */
    val now: StateFlow<Long> = _now.asStateFlow()

    private var mixer: Mixer? = null
    private var output: Output? = null

    /** Replaced in tests so that nothing touches a real audio device. */
    internal var outputFactory: (Mixer) -> Output = ::AudioOutput
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private var ticker: Job? = null
    private var persistJob: Job? = null
    private var pausedAt = 0L

    private var audioManager: AudioManager? = null
    private var focusRequest: AudioFocusRequest? = null
    private var resumeOnFocusGain = false

    private val focusListener = AudioManager.OnAudioFocusChangeListener { change ->
        when (change) {
            AudioManager.AUDIOFOCUS_LOSS -> {
                resumeOnFocusGain = false
                pause()
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                // A phone call or a navigation prompt: step aside, come back afterwards.
                val wasPlaying = _state.value.playing
                pause(keepFocus = true)
                resumeOnFocusGain = wasPlaying
            }
            AudioManager.AUDIOFOCUS_GAIN -> if (resumeOnFocusGain) {
                resumeOnFocusGain = false
                play()
            }
        }
    }

    fun init(context: Context) {
        if (app != null) return
        val ctx = context.applicationContext
        app = ctx
        audioManager = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val p = ctx.getSharedPreferences("bimeong", Context.MODE_PRIVATE)
        prefs = p
        _now.value = SystemClock.elapsedRealtime()
        _state.value = PlayerState(
            levels = parseLevels(p.getString(KEY_LEVELS, null)),
            master = p.getFloat(KEY_MASTER, 0.9f).coerceIn(0f, 1f),
            warmth = p.getFloat(KEY_WARMTH, 0.25f).coerceIn(0f, 1f),
            saved = parseSaved(p.getString(KEY_SAVED, null)),
            mixWithOthers = p.getBoolean(KEY_MIX_WITH_OTHERS, false),
        )
    }

    /** Forgets everything so that a test can start from a clean, freshly installed state. */
    internal fun resetForTest() {
        ticker?.cancel()
        persistJob?.cancel()
        output?.stop()
        output = null
        mixer = null
        app = null
        prefs = null
        pausedAt = 0L
        resumeOnFocusGain = false
        focusRequest = null
        _state.value = PlayerState()
    }

    /** Writes pending changes to storage immediately (normally done a moment after the last change). */
    internal fun flush() {
        persistJob?.cancel()
        persistNow()
    }

    // --- mix ----------------------------------------------------------------

    fun toggle(id: String) {
        if (Catalog.indexOf(id) < 0) return
        val cur = _state.value.levels
        val next = if (id in cur) cur - id else cur + (id to DEFAULT_LEVEL)
        setLevels(next)
        if (next.isEmpty()) stop() else if (!_state.value.playing) play()
    }

    fun setLevel(id: String, level: Float) {
        val cur = _state.value.levels
        if (id !in cur) return
        setLevels(cur + (id to level.coerceIn(MIN_LEVEL, 1f)))
    }

    /** Replaces the whole mix and starts playing it. */
    fun applyMix(levels: Map<String, Float>) {
        setLevels(levels.filterKeys { Catalog.indexOf(it) >= 0 }.mapValues { it.value.coerceIn(MIN_LEVEL, 1f) })
        if (_state.value.levels.isNotEmpty()) play()
    }

    fun clear() {
        setLevels(emptyMap())
        stop()
    }

    private fun setLevels(levels: Map<String, Float>) {
        _state.update { it.copy(levels = levels) }
        syncMixer()
        persistSoon()
    }

    fun setMaster(value: Float) {
        _state.update { it.copy(master = value.coerceIn(0f, 1f)) }
        syncMixer()
        persistSoon()
    }

    fun setWarmth(value: Float) {
        _state.update { it.copy(warmth = value.coerceIn(0f, 1f)) }
        syncMixer()
        persistSoon()
    }

    fun setMixWithOthers(enabled: Boolean) {
        _state.update { it.copy(mixWithOthers = enabled) }
        if (enabled) abandonFocus() else if (_state.value.playing) requestFocus()
        persistSoon()
    }

    // --- saved mixes ----------------------------------------------------------

    fun saveMix(name: String) {
        val trimmed = name.trim()
        val levels = _state.value.levels
        if (trimmed.isEmpty() || levels.isEmpty()) return
        _state.update { s -> s.copy(saved = listOf(SavedMix(trimmed, levels)) + s.saved.filter { it.name != trimmed }) }
        persistSoon()
    }

    fun deleteMix(name: String) {
        _state.update { s -> s.copy(saved = s.saved.filter { it.name != name }) }
        persistSoon()
    }

    // --- transport ------------------------------------------------------------

    fun play() {
        val ctx = app ?: return
        if (_state.value.levels.isEmpty()) setLevels(Presets.default.levels)
        if (!_state.value.mixWithOthers && !requestFocus()) return
        val out = output ?: run {
            val native = AudioTrack.getNativeOutputSampleRate(AudioManager.STREAM_MUSIC)
            val m = Mixer(if (native in 32000..48000) native else 48000)
            mixer = m
            outputFactory(m).also { output = it }
        }
        syncMixer()
        out.start()
        pausedAt = 0L
        _state.update { it.copy(playing = true, sessionActive = true) }
        try {
            ContextCompat.startForegroundService(ctx, Intent(ctx, PlaybackService::class.java))
        } catch (e: RuntimeException) {
            // Not allowed to start from the background: the sound still plays for as long as the app lives.
            Log.w(TAG, "Could not start playback service", e)
        }
        ensureTicker()
    }

    fun pause(keepFocus: Boolean = false) {
        output?.stop()
        if (!keepFocus) {
            resumeOnFocusGain = false
            abandonFocus()
        }
        if (_state.value.playing) pausedAt = SystemClock.elapsedRealtime()
        _state.update { it.copy(playing = false) }
    }

    /** Ends the session: silence, timers cleared, notification gone. */
    fun stop() {
        pause()
        mixer?.fade = 1f
        _state.update { it.copy(sessionActive = false, sleepEndsAt = 0L, focus = null) }
    }

    // --- timers ---------------------------------------------------------------

    fun startSleepTimer(minutes: Int) {
        if (minutes <= 0) return
        _state.update { it.copy(sleepEndsAt = SystemClock.elapsedRealtime() + minutes * 60_000L) }
        mixer?.fade = 1f
        if (!_state.value.playing) play()
        ensureTicker()
    }

    fun cancelSleepTimer() {
        _state.update { it.copy(sleepEndsAt = 0L) }
        mixer?.fade = 1f
    }

    fun startFocus(focusMin: Int, breakMin: Int) {
        if (focusMin <= 0 || breakMin <= 0) return
        val ends = SystemClock.elapsedRealtime() + focusMin * 60_000L
        _state.update { it.copy(focus = FocusState(focusMin, breakMin, onBreak = false, endsAt = ends, round = 1)) }
        if (!_state.value.playing) play()
        ensureTicker()
    }

    fun stopFocus() {
        _state.update { it.copy(focus = null) }
    }

    private fun ensureTicker() {
        if (ticker?.isActive == true) return
        ticker = scope.launch {
            while (true) {
                tick(SystemClock.elapsedRealtime())
                val s = _state.value
                if (!s.playing && !s.sessionActive && s.sleepEndsAt == 0L && s.focus == null) break
                delay(500)
            }
        }
    }

    internal fun tick(t: Long) {
        _now.value = t
        val s = _state.value
        if (s.sleepEndsAt != 0L) {
            val remaining = s.sleepEndsAt - t
            if (remaining <= 0L) {
                stop()
                return
            }
            // Squared, so the last seconds sink away gently instead of dropping off.
            val x = (remaining.toFloat() / SLEEP_FADE_MS).coerceIn(0f, 1f)
            mixer?.fade = x * x
        }
        val f = s.focus
        if (f != null && t >= f.endsAt) {
            // Only while sound is running: a bell queued during a pause would ring at some random later moment.
            if (s.playing) mixer?.ringBell()
            val next = if (f.onBreak) {
                f.copy(onBreak = false, endsAt = t + f.focusMin * 60_000L, round = f.round + 1)
            } else {
                f.copy(onBreak = true, endsAt = t + f.breakMin * 60_000L)
            }
            _state.update { it.copy(focus = next) }
        }
        if (!s.playing && s.sessionActive && pausedAt != 0L && t - pausedAt > PAUSE_TIMEOUT_MS) {
            // Paused and forgotten: let go of the notification and the service.
            stop()
        }
    }

    // --- audio focus ----------------------------------------------------------

    private fun requestFocus(): Boolean {
        val am = audioManager ?: return true
        val req = focusRequest ?: AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build(),
            )
            .setOnAudioFocusChangeListener(focusListener)
            .build()
            .also { focusRequest = it }
        return am.requestAudioFocus(req) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    }

    private fun abandonFocus() {
        val am = audioManager ?: return
        focusRequest?.let { am.abandonAudioFocusRequest(it) }
    }

    // --- engine & storage -----------------------------------------------------

    private fun syncMixer() {
        val m = mixer ?: return
        val s = _state.value
        Catalog.sounds.forEachIndexed { index, def -> m.setLevel(index, s.levels[def.id] ?: 0f) }
        m.master = s.master
        m.warmth = s.warmth
    }

    private fun persistSoon() {
        persistJob?.cancel()
        persistJob = scope.launch {
            delay(300)
            persistNow()
        }
    }

    private fun persistNow() {
        val p = prefs ?: return
        val s = _state.value
        p.edit {
            putString(KEY_LEVELS, levelsJson(s.levels).toString())
            putFloat(KEY_MASTER, s.master)
            putFloat(KEY_WARMTH, s.warmth)
            putBoolean(KEY_MIX_WITH_OTHERS, s.mixWithOthers)
            putString(
                KEY_SAVED,
                JSONArray().apply {
                    s.saved.forEach { put(JSONObject().put("name", it.name).put("levels", levelsJson(it.levels))) }
                }.toString(),
            )
        }
    }

    private fun levelsJson(levels: Map<String, Float>) = JSONObject().apply {
        levels.forEach { (id, v) -> put(id, v.toDouble()) }
    }

    private fun parseLevels(json: String?): Map<String, Float> = try {
        if (json.isNullOrEmpty()) emptyMap() else parseLevels(JSONObject(json))
    } catch (e: Exception) {
        emptyMap()
    }

    private fun parseLevels(o: JSONObject): Map<String, Float> {
        val out = LinkedHashMap<String, Float>()
        for (key in o.keys()) {
            if (Catalog.indexOf(key) >= 0) out[key] = o.optDouble(key, DEFAULT_LEVEL.toDouble()).toFloat().coerceIn(MIN_LEVEL, 1f)
        }
        return out
    }

    private fun parseSaved(json: String?): List<SavedMix> = try {
        if (json.isNullOrEmpty()) emptyList() else {
            val arr = JSONArray(json)
            (0 until arr.length()).mapNotNull { i ->
                val o = arr.getJSONObject(i)
                val levels = parseLevels(o.getJSONObject("levels"))
                if (levels.isEmpty()) null else SavedMix(o.getString("name"), levels)
            }
        }
    } catch (e: Exception) {
        emptyList()
    }

    private const val KEY_LEVELS = "levels"
    private const val KEY_MASTER = "master"
    private const val KEY_WARMTH = "warmth"
    private const val KEY_SAVED = "saved"
    private const val KEY_MIX_WITH_OTHERS = "mixWithOthers"
}

package app.bimeong.engine

import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicIntegerArray
import kotlin.math.abs
import kotlin.math.exp
import kotlin.math.pow
import kotlin.math.tanh

/**
 * Renders the whole mix. All setters may be called from any thread; [render] belongs to the audio thread.
 *
 * Every level change is smoothed, so nothing ever clicks: sounds fade in and out,
 * the sleep timer can fade the whole mix, and stopping lets the mix die away first.
 */
class Mixer(val sampleRate: Int, private val seed: Long = System.nanoTime()) {
    private val defs = Catalog.sounds
    private val count = defs.size
    private val targets = AtomicIntegerArray(count)
    private val voices = arrayOfNulls<Voice>(count)
    private val gains = FloatArray(count)
    private var spawned = 0L

    private val vl = FloatArray(BLOCK)
    private val vr = FloatArray(BLOCK)
    private val sl = FloatArray(BLOCK)
    private val sr = FloatArray(BLOCK)
    private val ml = FloatArray(BLOCK)
    private val mr = FloatArray(BLOCK)
    private val msl = FloatArray(BLOCK)
    private val msr = FloatArray(BLOCK)

    private val reverb = Reverb(sampleRate)
    private var reverbTail = 0

    private val chime = Bowl(sampleRate, seed xor 0x51ED, interval = false, base = 528f)
    private val chimeRequests = AtomicInteger(0)
    private var chimeTail = 0

    private val toneL = Biquad()
    private val toneR = Biquad()
    private var warmNow = -1f
    private var masterNow = 0f
    private var limiterEnv = 0f
    private val attackK = 1f - exp(-1f / (0.001f * sampleRate))
    private val releaseK = 1f - exp(-1f / (0.25f * sampleRate))

    /** Master volume slider, 0..1. */
    @Volatile var master = 0.85f

    /** 0 = full, bright sound; 1 = dark and muffled, easier on the ears at night. */
    @Volatile var warmth = 0f

    /** Extra gain applied on top of the master volume, used by the sleep timer to fade out. */
    @Volatile var fade = 1f

    /** While false the mix fades to silence. */
    @Volatile var playing = true

    /** True once the mix has completely faded after [playing] was set to false. */
    @Volatile var silent = true
        private set

    fun setLevel(index: Int, slider: Float) {
        if (index in 0 until count) targets.set(index, slider.coerceIn(0f, 1f).toRawBits())
    }

    fun level(index: Int): Float = Float.fromBits(targets.get(index))

    /** Rings a soft bell once, independent of the mix (focus timer). */
    fun ringBell() {
        chimeRequests.incrementAndGet()
    }

    fun render(outL: FloatArray, outR: FloatArray, frames: Int) {
        var o = 0
        while (o < frames) {
            val n = minOf(BLOCK, frames - o)
            block(n)
            System.arraycopy(ml, 0, outL, o, n)
            System.arraycopy(mr, 0, outR, o, n)
            o += n
        }
    }

    private fun block(n: Int) {
        java.util.Arrays.fill(ml, 0, n, 0f)
        java.util.Arrays.fill(mr, 0, n, 0f)
        java.util.Arrays.fill(msl, 0, n, 0f)
        java.util.Arrays.fill(msr, 0, n, 0f)
        val k = 1f - exp(-n / (LEVEL_TIME * sampleRate))

        for (i in 0 until count) {
            val slider = Float.fromBits(targets.get(i))
            val tgt = if (slider <= 0f) 0f else slider * slider * defs[i].trim
            val cur = gains[i]
            if (tgt == 0f && cur < 1e-4f) {
                gains[i] = 0f
                voices[i] = null
                continue
            }
            val voice = voices[i] ?: defs[i].make(sampleRate, seed + (++spawned) * 7919L).also { voices[i] = it }
            java.util.Arrays.fill(vl, 0, n, 0f)
            java.util.Arrays.fill(vr, 0, n, 0f)
            val wet = defs[i].reverb
            if (wet) {
                java.util.Arrays.fill(sl, 0, n, 0f)
                java.util.Arrays.fill(sr, 0, n, 0f)
            }
            voice.render(vl, vr, sl, sr, n)
            val nxt = cur + (tgt - cur) * k
            val dg = (nxt - cur) / n
            var g = cur
            if (wet) {
                for (j in 0 until n) {
                    ml[j] += vl[j] * g
                    mr[j] += vr[j] * g
                    msl[j] += sl[j] * g
                    msr[j] += sr[j] * g
                    g += dg
                }
                reverbTail = sampleRate * 5
            } else {
                for (j in 0 until n) {
                    ml[j] += vl[j] * g
                    mr[j] += vr[j] * g
                    g += dg
                }
            }
            gains[i] = nxt
        }

        if (chimeRequests.get() > 0) {
            chimeRequests.set(0)
            chime.strike(1f)
            chimeTail = sampleRate * 9
        }
        if (chimeTail > 0) {
            java.util.Arrays.fill(vl, 0, n, 0f)
            java.util.Arrays.fill(vr, 0, n, 0f)
            java.util.Arrays.fill(sl, 0, n, 0f)
            java.util.Arrays.fill(sr, 0, n, 0f)
            chime.render(vl, vr, sl, sr, n)
            for (j in 0 until n) {
                ml[j] += vl[j] * BELL_GAIN
                mr[j] += vr[j] * BELL_GAIN
                msl[j] += sl[j] * BELL_GAIN
                msr[j] += sr[j] * BELL_GAIN
            }
            chimeTail -= n
            reverbTail = sampleRate * 5
        }

        if (reverbTail > 0) {
            reverb.process(msl, msr, ml, mr, n)
            reverbTail -= n
        }

        // Tone: glide towards the requested warmth and retune the low-pass as it moves.
        val w = warmth.coerceIn(0f, 1f)
        if (warmNow < 0f || abs(w - warmNow) > 0.001f) {
            warmNow = if (warmNow < 0f) w else warmNow + (w - warmNow) * 0.25f
            val cutoff = 19000f * 0.055f.pow(warmNow)
            toneL.lowpass(sampleRate, cutoff, 0.62f)
            toneR.lowpass(sampleRate, cutoff, 0.62f)
        }

        val m = master.coerceIn(0f, 1f)
        val masterTarget = if (playing) m * m * fade.coerceIn(0f, 1f) else 0f
        val km = 1f - exp(-n / (MASTER_TIME * sampleRate))
        val nextMaster = masterNow + (masterTarget - masterNow) * km
        val dm = (nextMaster - masterNow) / n
        var g = masterNow
        var env = limiterEnv
        for (j in 0 until n) {
            var a = toneL.process(ml[j]) * g
            var b = toneR.process(mr[j]) * g
            g += dm
            val peak = maxOf(abs(a), abs(b))
            env += (peak - env) * (if (peak > env) attackK else releaseK)
            if (env > CEILING) {
                val red = CEILING / env
                a *= red
                b *= red
            }
            ml[j] = soft(a)
            mr[j] = soft(b)
        }
        limiterEnv = env
        masterNow = nextMaster
        silent = !playing && nextMaster < 2e-4f
    }

    private fun soft(x: Float): Float = when {
        x > KNEE -> KNEE + (1f - KNEE) * tanh((x - KNEE) / (1f - KNEE))
        x < -KNEE -> -KNEE - (1f - KNEE) * tanh((-x - KNEE) / (1f - KNEE))
        else -> x
    }

    private companion object {
        const val BLOCK = 256
        const val LEVEL_TIME = 0.14f
        const val MASTER_TIME = 0.09f
        const val CEILING = 0.8f
        const val KNEE = 0.85f
        const val BELL_GAIN = 0.5f
    }
}

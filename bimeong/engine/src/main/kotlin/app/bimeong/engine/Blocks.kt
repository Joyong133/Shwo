package app.bimeong.engine

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt

/*
 * Larger building blocks: noisy impacts, small rooms, the voice source and a melody maker.
 */

/**
 * Pool of short noise bursts, each ringing through its own resonance.
 *
 * Where [GrainPool] makes clean tones (a bubble, a bell), this makes the dull, breathy,
 * pitch-less impacts most real things produce: a drop on cloth, a key bottoming out, a twig snapping.
 */
internal class NoiseGrains(private val fs: Int, seed: Long, private val cap: Int = 48) {
    private val rng = Rng(seed)
    private val c1 = FloatArray(cap)
    private val c2 = FloatArray(cap)
    private val gin = FloatArray(cap)
    private val y1 = FloatArray(cap)
    private val y2 = FloatArray(cap)
    private val env = FloatArray(cap)
    private val dec = FloatArray(cap)
    private val att = FloatArray(cap)
    private val attK = FloatArray(cap)
    private val gl = FloatArray(cap)
    private val gr = FloatArray(cap)
    private val start = IntArray(cap)
    private var count = 0

    /**
     * @param q sharpness of the resonance: about 1 is a soft thud or hiss, above 5 starts to ring
     * @param t60 seconds for the burst to fall by 60 dB
     */
    fun spawn(offset: Int, freq: Float, q: Float, t60: Float, amp: Float, pan: Float, attackMs: Float = 0f) {
        if (count >= cap) return
        val g = count++
        val f = freq.coerceIn(30f, fs * 0.42f)
        val w = 2.0 * PI * f / fs
        val r = exp(-PI * (f / q) / fs)
        c1[g] = (2.0 * r * cos(w)).toFloat()
        c2[g] = (-r * r).toFloat()
        // Scaled so the output is about as loud as the envelope says, whatever the resonance.
        gin[g] = (sqrt(2.0 * (1.0 - r * r)) * sin(w)).toFloat() * 1.732f
        y1[g] = 0f
        y2[g] = 0f
        env[g] = amp
        dec[g] = exp(-6.908 / (t60 * fs)).toFloat()
        if (attackMs > 0f) {
            att[g] = 0f
            attK[g] = 1f - exp(-1.0 / (attackMs * 0.001 * fs)).toFloat()
        } else {
            att[g] = 1f
            attK[g] = 0f
        }
        gl[g] = panL(pan)
        gr[g] = panR(pan)
        start[g] = offset.coerceAtLeast(0)
    }

    fun render(l: FloatArray, r: FloatArray, n: Int) {
        var g = 0
        while (g < count) {
            val s0 = start[g]
            if (s0 >= n) {
                start[g] = s0 - n
                g++
                continue
            }
            val a1 = c1[g]
            val a2 = c2[g]
            val gi = gin[g]
            var p1 = y1[g]
            var p2 = y2[g]
            var e = env[g]
            val d = dec[g]
            var at = att[g]
            val ak = attK[g]
            val pl = gl[g]
            val pr = gr[g]
            for (i in s0 until n) {
                val y = rng.bi() * e * at * gi + a1 * p1 + a2 * p2
                p2 = p1
                p1 = y
                l[i] += y * pl
                r[i] += y * pr
                e *= d
                at += (1f - at) * ak
            }
            if (e < 1e-5f) {
                val last = --count
                if (g != last) {
                    c1[g] = c1[last]; c2[g] = c2[last]; gin[g] = gin[last]; y1[g] = y1[last]; y2[g] = y2[last]
                    env[g] = env[last]; dec[g] = dec[last]; att[g] = att[last]; attK[g] = attK[last]
                    gl[g] = gl[last]; gr[g] = gr[last]; start[g] = start[last]
                }
            } else {
                y1[g] = p1; y2[g] = p2; env[g] = e; att[g] = at; start[g] = 0
                g++
            }
        }
    }
}

/**
 * The first few echoes of a small enclosed space: a tent, a car, a room behind a window.
 * They are what tells the ear "indoors" long before any reverb tail does.
 *
 * @param tapsMs delay of each echo; they alternate between the left and right wall
 * @param gains level of each echo
 * @param lpHz how much the walls dull the echoes
 */
internal class Room(private val fs: Int, tapsMs: FloatArray, private val gains: FloatArray, lpHz: Float) {
    private val taps = IntArray(tapsMs.size) { (tapsMs[it] * 0.001f * fs).toInt().coerceAtLeast(1) }
    private val size = Integer.highestOneBit(taps.max() + 2) * 2
    private val mask = size - 1
    private val buf = FloatArray(size)
    private val damp = OnePole().set(fs, lpHz)
    private var pos = 0

    fun process(l: FloatArray, r: FloatArray, n: Int, wet: Float = 1f) {
        var p = pos
        for (i in 0 until n) {
            buf[p] = damp.lp((l[i] + r[i]) * 0.5f)
            var a = 0f
            var b = 0f
            var k = 0
            while (k < taps.size) {
                val v = buf[(p - taps[k]) and mask] * gains[k]
                if (k and 1 == 0) a += v else b += v
                k++
            }
            l[i] += a * wet
            r[i] += b * wet
            p = (p + 1) and mask
        }
        pos = p
    }
}

/** One cycle of the buzz the vocal folds make, in a soft and a brighter flavour. */
internal object Glottal {
    const val SIZE = 2048
    const val MASK = SIZE - 1

    /** Gentle, breathy voice: humming, lullabies. */
    @JvmField
    val soft: FloatArray = build(2.1, 24)

    /** Fuller voice: singing out, speaking. */
    @JvmField
    val full: FloatArray = build(1.45, 40)

    private fun build(tilt: Double, harmonics: Int): FloatArray {
        val t = FloatArray(SIZE)
        var peak = 0f
        for (i in 0 until SIZE) {
            var v = 0.0
            for (k in 1..harmonics) v += sin(2.0 * PI * k * i / SIZE + k * 0.6) / k.toDouble().pow(tilt)
            t[i] = v.toFloat()
            if (kotlin.math.abs(t[i]) > peak) peak = kotlin.math.abs(t[i])
        }
        for (i in 0 until SIZE) t[i] /= peak
        return t
    }
}

/** A few resonances in parallel that can glide between vowels: the mouth that shapes the voice. */
internal class Formants(private val fs: Int, val count: Int) {
    private val filters = Array(count) { Svf() }
    private val gain = FloatArray(count)

    fun set(i: Int, freq: Float, q: Float, level: Float) {
        filters[i].set(fs, freq, q)
        gain[i] = level / q
    }

    fun process(x: Float): Float {
        var s = 0f
        for (i in 0 until count) {
            val f = filters[i]
            f.process(x)
            s += f.bp * gain[i]
        }
        return s
    }
}

/** Formant frequencies of a few vowels, roughly as an adult speaks them. Index with [Vowels]. */
internal object Vowels {
    const val A = 0
    const val E = 1
    const val I = 2
    const val O = 3
    const val U = 4
    const val EU = 5
    const val EO = 6
    const val COUNT = 7

    @JvmField val f1 = floatArrayOf(800f, 480f, 300f, 460f, 330f, 380f, 600f)
    @JvmField val f2 = floatArrayOf(1250f, 1950f, 2300f, 820f, 760f, 1400f, 1000f)
    @JvmField val f3 = floatArrayOf(2600f, 2600f, 3000f, 2550f, 2500f, 2500f, 2600f)
}

/**
 * Makes up a calm tune that never ends and never quite repeats: three beats to the bar,
 * four bars to the phrase, a little idea stated, answered, and brought home.
 *
 * Call [next] for each note and read [freq], [seconds], [rest] and [phraseEnd].
 *
 * @param root pitch of the lowest note of the scale
 * @param beat seconds per beat
 */
internal class Melody(private val rng: Rng, private val root: Float, private val beat: Float, private val range: Int = 8) {
    private val scale = intArrayOf(0, 2, 4, 7, 9)
    private val pattern = arrayOf(
        floatArrayOf(3f), floatArrayOf(2f, 1f), floatArrayOf(1f, 2f), floatArrayOf(1f, 1f, 1f),
        floatArrayOf(1.5f, 0.5f, 1f), floatArrayOf(1f, 0.5f, 0.5f, 1f), floatArrayOf(2f, 0.5f, 0.5f),
    )
    private val queueDeg = IntArray(24)
    private val queueLen = FloatArray(24)
    private var queued = 0
    private var at = 0
    private var degree = range / 2
    private val motifDeg = IntArray(4)
    private var motifPattern = 3
    private var bar = 0

    @JvmField var freq = root
    @JvmField var seconds = beat
    @JvmField var rest = false
    @JvmField var phraseEnd = false

    private fun step(): Int {
        // Small steps, pulled gently back toward the middle of the range.
        val pull = if (degree > range * 2 / 3) -1 else if (degree < range / 3) 1 else 0
        val move = rng.int(5) - 2 + (if (rng.chance(0.5f)) pull else 0)
        degree = (degree + move).coerceIn(0, range)
        return degree
    }

    private fun push(deg: Int, beats: Float) {
        if (queued < queueDeg.size) {
            queueDeg[queued] = deg
            queueLen[queued] = beats
            queued++
        }
    }

    private fun fillBar() {
        queued = 0
        at = 0
        when (bar) {
            0 -> { // state the idea
                motifPattern = 1 + rng.int(pattern.size - 1)
                val p = pattern[motifPattern]
                for (k in p.indices) {
                    motifDeg[k] = step()
                    push(motifDeg[k], p[k])
                }
            }
            1 -> { // answer it, a step away
                val p = pattern[motifPattern]
                val shift = if (rng.chance(0.5f)) 1 else -1
                for (k in p.indices) {
                    degree = (motifDeg[k] + shift).coerceIn(0, range)
                    push(degree, p[k])
                }
            }
            2 -> { // say it again, or wander
                if (rng.chance(0.55f)) {
                    val p = pattern[motifPattern]
                    for (k in p.indices) {
                        degree = motifDeg[k]
                        push(degree, p[k])
                    }
                } else {
                    val p = pattern[1 + rng.int(pattern.size - 1)]
                    for (k in p.indices) push(step(), p[k])
                }
            }
            else -> { // come home: the keynote or the fifth, held, then a breath
                val home = if (rng.chance(0.65f)) 0 else 3
                var target = home
                while (target + 5 <= range && kotlin.math.abs(target + 5 - degree) < kotlin.math.abs(target - degree)) target += 5
                degree = target
                push(degree, 2f)
                push(-1, 1f)
            }
        }
        bar = (bar + 1) % 4
    }

    fun next() {
        if (at >= queued) fillBar()
        val d = queueDeg[at]
        seconds = queueLen[at] * beat
        rest = d < 0
        if (!rest) freq = root * 2f.pow((12 * (d / 5) + scale[d % 5]) / 12f)
        at++
        phraseEnd = at >= queued && bar == 0
    }
}

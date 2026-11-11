package app.bimeong.engine

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.ln
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.tan

/*
 * Small allocation-free DSP building blocks shared by every voice.
 * Everything here runs on the audio thread, so nothing allocates after construction.
 */

internal object Sine {
    const val SIZE = 4096
    const val MASK = SIZE - 1

    @JvmField
    val table: FloatArray = build()

    private fun build(): FloatArray {
        val t = FloatArray(SIZE)
        for (i in 0 until SIZE) t[i] = sin(2.0 * PI * i / SIZE).toFloat()
        return t
    }

    /** Sine of a phase given in cycles (1.0 = one full turn). */
    fun of(cycles: Float): Float = table[(cycles * SIZE).toInt() and MASK]
}

/** xorshift64 generator: fast, good enough for audio noise, and deterministic per seed. */
internal class Rng(seed: Long) {
    private var s = seed xor 0x5DEECE66DL

    init {
        if (s == 0L) s = 0x2545F4914F6CDD1DL
        repeat(12) { next() }
    }

    fun next(): Long {
        var x = s
        x = x xor (x shl 13)
        x = x xor (x ushr 7)
        x = x xor (x shl 17)
        s = x
        return x
    }

    /** Uniform in [0, 1). */
    fun uni(): Float = (next() ushr 40).toFloat() * (1f / 16777216f)

    /** Uniform in [-1, 1). */
    fun bi(): Float = (next() shr 40).toFloat() * (1f / 8388608f)

    fun range(lo: Float, hi: Float): Float = lo + (hi - lo) * uni()

    /** Log-uniform, for frequencies and time scales. */
    fun logRange(lo: Float, hi: Float): Float = lo * (hi / lo).pow(uni())

    /** Exponentially distributed waiting time with the given mean. */
    fun expo(mean: Float): Float = -mean * ln(1f - uni())

    fun chance(p: Float): Boolean = uni() < p

    fun int(n: Int): Int = (uni() * n).toInt()

    fun sign(): Float = if (next() < 0) -1f else 1f

    /**
     * Heavy-tailed size of a single drop: many small ones, a few big ones.
     * Squared exponential, mean 2, mean square 24.
     */
    fun heavy(): Float {
        val e = -ln(1f - uni())
        return e * e
    }
}

internal class Biquad {
    private var b0 = 1f
    private var b1 = 0f
    private var b2 = 0f
    private var a1 = 0f
    private var a2 = 0f
    private var z1 = 0f
    private var z2 = 0f

    fun process(input: Float): Float {
        // The inaudible offset keeps the filter state out of the denormal range during silence.
        val x = input + 1e-18f
        val y = b0 * x + z1
        z1 = b1 * x - a1 * y + z2
        z2 = b2 * x - a2 * y
        return y
    }

    fun reset() {
        z1 = 0f
        z2 = 0f
    }

    private fun set(nb0: Double, nb1: Double, nb2: Double, a0: Double, na1: Double, na2: Double): Biquad {
        b0 = (nb0 / a0).toFloat()
        b1 = (nb1 / a0).toFloat()
        b2 = (nb2 / a0).toFloat()
        a1 = (na1 / a0).toFloat()
        a2 = (na2 / a0).toFloat()
        return this
    }

    private fun omega(fs: Int, f: Float): Double = 2.0 * PI * f.coerceIn(5f, fs * 0.45f) / fs

    fun lowpass(fs: Int, f: Float, q: Float = 0.7071f): Biquad {
        val w = omega(fs, f)
        val c = cos(w)
        val al = sin(w) / (2.0 * q)
        return set((1 - c) / 2, 1 - c, (1 - c) / 2, 1 + al, -2 * c, 1 - al)
    }

    fun highpass(fs: Int, f: Float, q: Float = 0.7071f): Biquad {
        val w = omega(fs, f)
        val c = cos(w)
        val al = sin(w) / (2.0 * q)
        return set((1 + c) / 2, -(1 + c), (1 + c) / 2, 1 + al, -2 * c, 1 - al)
    }

    /** Band-pass with 0 dB gain at the centre frequency. */
    fun bandpass(fs: Int, f: Float, q: Float): Biquad {
        val w = omega(fs, f)
        val c = cos(w)
        val al = sin(w) / (2.0 * q)
        return set(al, 0.0, -al, 1 + al, -2 * c, 1 - al)
    }

    fun peak(fs: Int, f: Float, q: Float, db: Float): Biquad {
        val w = omega(fs, f)
        val c = cos(w)
        val al = sin(w) / (2.0 * q)
        val a = 10.0.pow(db / 40.0)
        return set(1 + al * a, -2 * c, 1 - al * a, 1 + al / a, -2 * c, 1 - al / a)
    }

    fun highShelf(fs: Int, f: Float, db: Float): Biquad {
        val w = omega(fs, f)
        val c = cos(w)
        val a = 10.0.pow(db / 40.0)
        val al = sin(w) / 2.0 * sqrt(2.0)
        val k = 2.0 * sqrt(a) * al
        return set(
            a * ((a + 1) + (a - 1) * c + k), -2 * a * ((a - 1) + (a + 1) * c), a * ((a + 1) + (a - 1) * c - k),
            (a + 1) - (a - 1) * c + k, 2 * ((a - 1) - (a + 1) * c), (a + 1) - (a - 1) * c - k,
        )
    }

    fun lowShelf(fs: Int, f: Float, db: Float): Biquad {
        val w = omega(fs, f)
        val c = cos(w)
        val a = 10.0.pow(db / 40.0)
        val al = sin(w) / 2.0 * sqrt(2.0)
        val k = 2.0 * sqrt(a) * al
        return set(
            a * ((a + 1) - (a - 1) * c + k), 2 * a * ((a - 1) - (a + 1) * c), a * ((a + 1) - (a - 1) * c - k),
            (a + 1) + (a - 1) * c + k, -2 * ((a - 1) + (a + 1) * c), (a + 1) + (a - 1) * c - k,
        )
    }
}

/** State-variable filter that stays stable while its cutoff is being swept. */
internal class Svf {
    private var k = 1f
    private var a1 = 0f
    private var a2 = 0f
    private var a3 = 0f
    private var ic1 = 0f
    private var ic2 = 0f

    @JvmField var lp = 0f
    @JvmField var bp = 0f
    @JvmField var hp = 0f

    fun set(fs: Int, f: Float, q: Float) {
        val g = tan(PI * f.coerceIn(10f, fs * 0.45f) / fs).toFloat()
        k = 1f / q
        a1 = 1f / (1f + g * (g + k))
        a2 = g * a1
        a3 = g * a2
    }

    fun process(x: Float) {
        val v3 = x - ic2
        val v1 = a1 * ic1 + a2 * v3
        val v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2f * v1 - ic1
        ic2 = 2f * v2 - ic2
        lp = v2
        bp = v1
        hp = x - k * v1 - v2
    }
}

internal class OnePole {
    private var a = 1f
    private var y = 0f

    fun set(fs: Int, f: Float): OnePole {
        a = 1f - exp(-2.0 * PI * f / fs).toFloat()
        return this
    }

    fun lp(x: Float): Float {
        y += a * (x - y)
        return y
    }

    fun hp(x: Float): Float {
        y += a * (x - y)
        return x - y
    }
}

/** Pink (1/f) noise, level-matched to [Rng.bi] white noise. */
internal class Pink(private val rng: Rng) {
    private var b0 = 0f
    private var b1 = 0f
    private var b2 = 0f

    fun next(): Float {
        val w = rng.bi()
        b0 = 0.99765f * b0 + w * 0.0990460f
        b1 = 0.96300f * b1 + w * 0.2965164f
        b2 = 0.57000f * b2 + w * 1.0526913f
        return (b0 + b1 + b2 + w * 0.1848f) * NORM
    }

    companion object {
        const val NORM = 0.2577f
    }
}

/** Brown (1/f²) noise, level-matched to white. */
internal class Brown(private val rng: Rng, fs: Int) {
    private val p = exp(-2.0 * PI * 24.0 / fs).toFloat()
    private val g = sqrt(1f - p * p)
    private var y = 0f

    fun next(): Float {
        y = p * y + rng.bi() * g
        return y
    }
}

/** Very slow, smooth, never-repeating movement in 0..1. Used for gusts and swells. */
internal class Wander(rng: Rng, minPeriodSec: Float, maxPeriodSec: Float) {
    private val ph = FloatArray(3) { rng.uni() }
    private val inc = FloatArray(3) { 1f / rng.logRange(minPeriodSec, maxPeriodSec) }

    fun advance(dtSec: Float): Float {
        var s = 0f
        for (i in 0..2) {
            var p = ph[i] + inc[i] * dtSec
            if (p >= 1f) p -= 1f
            ph[i] = p
            s += Sine.of(p)
        }
        return (0.5f + s * 0.25f).coerceIn(0f, 1f)
    }
}

/** Random value in 0..1 that glides to a new target several times a second. */
internal class Flutter(private val rng: Rng, fs: Int, rateHz: Float) {
    private val meanLen = fs / rateHz
    private var cur = rng.uni()
    private var step = 0f
    private var left = 0

    fun next(): Float {
        if (left <= 0) {
            left = (meanLen * rng.range(0.5f, 1.5f)).toInt().coerceAtLeast(1)
            step = (rng.uni() - cur) / left
        }
        cur += step
        left--
        return cur
    }
}

/**
 * Pool of short decaying sine "grains". One grain is one resonance of one impact:
 * a bubble ringing under water, a pane of glass ticking, a tent panel thumping.
 */
internal class GrainPool(private val fs: Int, private val cap: Int = 64) {
    private val phase = FloatArray(cap)
    private val inc = FloatArray(cap)
    private val chirp = FloatArray(cap)
    private val amp = FloatArray(cap)
    private val dec = FloatArray(cap)
    private val att = FloatArray(cap)
    private val attK = FloatArray(cap)
    private val gl = FloatArray(cap)
    private val gr = FloatArray(cap)
    private val start = IntArray(cap)
    private var count = 0

    /**
     * @param offset frames from the start of the next render call (may exceed one block)
     * @param t60 seconds for the ring to fall by 60 dB
     * @param pan -1 (left) .. 1 (right)
     * @param riseRate relative pitch rise per second (bubbles chirp upwards)
     * @param attackMs soft onset; 0 for a hard tick
     */
    fun spawn(
        offset: Int, freq: Float, t60: Float, a: Float, pan: Float,
        riseRate: Float = 0f, attackMs: Float = 0f,
    ) {
        if (count >= cap || freq >= fs * 0.45f) return
        val g = count++
        phase[g] = 0f
        inc[g] = freq * Sine.SIZE / fs
        chirp[g] = 1f + riseRate / fs
        amp[g] = a
        dec[g] = exp(-6.908 / (t60 * fs)).toFloat()
        if (attackMs > 0f) {
            att[g] = 0f
            attK[g] = 1f - exp(-1.0 / (attackMs * 0.001 * fs)).toFloat()
        } else {
            att[g] = 1f
            attK[g] = 0f
        }
        val ang = (pan.coerceIn(-1f, 1f) + 1f) * (PI.toFloat() / 4f)
        gl[g] = cos(ang)
        gr[g] = sin(ang)
        start[g] = offset.coerceAtLeast(0)
    }

    fun render(l: FloatArray, r: FloatArray, n: Int) {
        val tbl = Sine.table
        var g = 0
        while (g < count) {
            val s0 = start[g]
            if (s0 >= n) {
                start[g] = s0 - n
                g++
                continue
            }
            var ph = phase[g]
            var ic = inc[g]
            val ch = chirp[g]
            var a = amp[g]
            val d = dec[g]
            var at = att[g]
            val ak = attK[g]
            val pl = gl[g]
            val pr = gr[g]
            for (i in s0 until n) {
                val s = tbl[ph.toInt() and Sine.MASK] * a * at
                l[i] += s * pl
                r[i] += s * pr
                a *= d
                at += (1f - at) * ak
                ph += ic
                ic *= ch
                if (ph >= Sine.SIZE) ph -= Sine.SIZE
            }
            if (a < 2e-5f) {
                // Finished: move the last grain into this slot.
                val last = --count
                if (g != last) {
                    phase[g] = phase[last]; inc[g] = inc[last]; chirp[g] = chirp[last]
                    amp[g] = amp[last]; dec[g] = dec[last]; att[g] = att[last]; attK[g] = attK[last]
                    gl[g] = gl[last]; gr[g] = gr[last]; start[g] = start[last]
                }
            } else {
                phase[g] = ph; inc[g] = ic; amp[g] = a; att[g] = at; start[g] = 0
                g++
            }
        }
    }
}

/**
 * Bank of high-Q resonators struck by impulses: chime tubes, a singing bowl.
 * Kept in double precision so that very long rings stay clean.
 */
internal class Modes(private val fs: Int, val size: Int) {
    private val a1 = DoubleArray(size)
    private val a2 = DoubleArray(size)
    private val y1 = DoubleArray(size)
    private val y2 = DoubleArray(size)
    private val gain = DoubleArray(size)
    private val gl = FloatArray(size)
    private val gr = FloatArray(size)

    fun set(i: Int, freq: Float, t60: Float, level: Float, pan: Float = 0f) {
        val w = 2.0 * PI * freq / fs
        val r = exp(-6.908 / (t60 * fs))
        a1[i] = 2.0 * r * cos(w)
        a2[i] = -r * r
        gain[i] = level * sin(w)
        val ang = (pan.coerceIn(-1f, 1f) + 1f) * (PI.toFloat() / 4f)
        gl[i] = cos(ang)
        gr[i] = sin(ang)
    }

    fun strike(i: Int, amp: Float) {
        y1[i] += amp * gain[i]
    }

    fun render(l: FloatArray, r: FloatArray, n: Int) {
        for (m in 0 until size) {
            var p1 = y1[m]
            var p2 = y2[m]
            if (p1 == 0.0 && p2 == 0.0) continue
            val c1 = a1[m]
            val c2 = a2[m]
            val pl = gl[m]
            val pr = gr[m]
            for (i in 0 until n) {
                val y = c1 * p1 + c2 * p2
                p2 = p1
                p1 = y
                val s = y.toFloat()
                l[i] += s * pl
                r[i] += s * pr
            }
            if (p1 > -1e-9 && p1 < 1e-9 && p2 > -1e-9 && p2 < 1e-9) {
                p1 = 0.0
                p2 = 0.0
            }
            y1[m] = p1
            y2[m] = p2
        }
    }
}

/**
 * The body of a rain sound: smooth hiss plus a spray of tiny random impacts,
 * shaped by the surface the rain is falling on.
 *
 * @param white level of flat noise
 * @param pink level of 1/f noise (weight, body)
 * @param grainRate tiny impacts per second
 * @param grainAmp level of the impacts; 1 carries the same power as white = 1
 */
internal class Texture(
    fs: Int, private val rng: Rng,
    private val white: Float, pink: Float,
    grainRate: Float, grainAmp: Float,
    hp: Float, lp: Float,
    peakHz: Float = 0f, peakDb: Float = 0f, peakQ: Float = 0.7f,
) {
    private val fHp = Biquad().highpass(fs, hp)
    private val fLp = Biquad().lowpass(fs, lp)
    private val fPk = Biquad().also { if (peakDb != 0f) it.peak(fs, peakHz, peakQ, peakDb) }
    private val pinkLevel = pink * Pink.NORM
    private val hasGrains = grainRate > 0f && grainAmp > 0f
    private val meanGap = if (hasGrains) fs / grainRate else 1e9f
    private val gAmp = grainAmp * sqrt(meanGap) * 1.5275f
    private var gap = rng.expo(meanGap)
    private var b0 = 0f
    private var b1 = 0f
    private var b2 = 0f

    fun render(out: FloatArray, n: Int, gain: Float, density: Float = 1f) {
        val wl = white
        val pk = pinkLevel
        var p0 = b0
        var p1 = b1
        var p2 = b2
        var gp = gap
        for (i in 0 until n) {
            val w = rng.bi()
            p0 = 0.99765f * p0 + w * 0.0990460f
            p1 = 0.96300f * p1 + w * 0.2965164f
            p2 = 0.57000f * p2 + w * 1.0526913f
            var x = w * wl + (p0 + p1 + p2 + w * 0.1848f) * pk
            gp -= density
            if (gp <= 0f) {
                gp += rng.expo(meanGap)
                // Cubed uniform: mostly faint impacts, a few clear ones, never a spike.
                val u = rng.uni()
                x += u * u * u * gAmp * rng.sign()
            }
            out[i] += fLp.process(fPk.process(fHp.process(x))) * gain
        }
        b0 = p0
        b1 = p1
        b2 = p2
        gap = if (hasGrains) gp else 1e9f
    }
}

/** Equal-power pan gains without allocating. */
internal fun panL(pan: Float): Float = cos((pan.coerceIn(-1f, 1f) + 1f) * (PI.toFloat() / 4f))
internal fun panR(pan: Float): Float = sin((pan.coerceIn(-1f, 1f) + 1f) * (PI.toFloat() / 4f))

internal fun smoothstep(x: Float): Float {
    val t = x.coerceIn(0f, 1f)
    return t * t * (3f - 2f * t)
}

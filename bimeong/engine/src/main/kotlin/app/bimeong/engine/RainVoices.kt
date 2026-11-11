package app.bimeong.engine

import kotlin.math.exp
import kotlin.math.pow

/** One layer of the mix. Voices add their signal on top of what is already in the buffers. */
abstract class Voice(protected val fs: Int) {
    /**
     * @param l dry left, @param r dry right
     * @param sl reverb send left, @param sr reverb send right
     */
    abstract fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int)
}

/**
 * Shared skeleton of every rain voice: a noise texture for the thousands of far drops,
 * plus individually modelled near drops whose rate breathes with slow gusts.
 */
internal abstract class RainBase(fs: Int, seed: Long, private val gustDepth: Float, private val dropRate: Float) : Voice(fs) {
    protected val rng = Rng(seed)
    protected val grains = GrainPool(fs, 96)
    private val gust = Wander(rng, 8f, 41f)
    private var dropT = 0f

    protected abstract fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float)
    protected abstract fun drop(offset: Int)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val level = 1f + gustDepth * (2f * gust.advance(n.toFloat() / fs) - 1f)
        textures(l, r, n, level)
        if (dropRate > 0f) {
            val meanGap = fs / (dropRate * level * level)
            var t = dropT
            while (t < n) {
                drop(t.toInt())
                t += rng.expo(meanGap)
            }
            dropT = t - n
        }
        grains.render(l, r, n)
    }

    // --- single-drop models -------------------------------------------------

    /** Drop into standing water: an air bubble rings and chirps upwards. */
    protected fun plink(off: Int, amp: Float, pan: Float, fLo: Float, fHi: Float) {
        val f = rng.logRange(fLo, fHi)
        val d = 0.043f * f + 0.0014f * f.pow(1.5f)
        grains.spawn(off, f, 6.908f / d, amp, pan, riseRate = 0.12f * d, attackMs = 0.25f)
    }

    /** Drop on a hard surface: a dry, very short tick. */
    protected fun tick(off: Int, amp: Float, pan: Float, fLo: Float = 2500f, fHi: Float = 7500f) {
        // Three very short, unrelated partials read as a click rather than a pitch.
        grains.spawn(off, rng.logRange(fLo, fHi), rng.range(0.002f, 0.005f), amp, pan)
        grains.spawn(off, rng.logRange(fLo, fHi) * 1.37f, rng.range(0.0015f, 0.004f), amp * 0.7f, pan)
        grains.spawn(off, rng.logRange(fLo, fHi) * 0.61f, rng.range(0.002f, 0.005f), amp * 0.6f, pan)
    }

    /** Fat drop on the ground: tick plus a short low body. */
    protected fun splat(off: Int, amp: Float, pan: Float) {
        tick(off, amp * 0.7f, pan, 1800f, 5000f)
        grains.spawn(off, rng.logRange(280f, 800f), rng.range(0.02f, 0.035f), amp, pan, attackMs = 0.4f)
    }

    protected fun randomPan(width: Float = 0.9f): Float = rng.range(-width, width)

    /** Loudness of one near drop, heavy-tailed and capped. */
    protected fun dropAmp(scale: Float): Float = (rng.heavy() * 0.18f).coerceAtMost(1f) * scale
}

/** Open-air rain of a given strength, falling on ground, puddles and foliage. */
internal class OpenRain(
    fs: Int, seed: Long, gustDepth: Float, dropRate: Float,
    private val gain: Float,
    private val pPlink: Float, private val pTick: Float,
    private val plinkLo: Float, private val plinkHi: Float,
    private val dropScale: Float,
    rumble: Float,
    tex: (Rng) -> Texture,
) : RainBase(fs, seed, gustDepth, dropRate) {
    private val texL = tex(Rng(seed * 31 + 1))
    private val texR = tex(Rng(seed * 31 + 2))
    private val rumbleLevel = rumble
    private val brown = Brown(Rng(seed * 31 + 3), fs)
    private val rumLp = Biquad().lowpass(fs, 170f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        texL.render(l, n, gain * level, level)
        texR.render(r, n, gain * level, level)
        if (rumbleLevel > 0f) {
            val g = rumbleLevel * level
            // Deep rumble is kept centred: wide stereo down there is tiring on headphones.
            for (i in 0 until n) {
                val v = rumLp.process(brown.next()) * g
                l[i] += v
                r[i] += v
            }
        }
    }

    override fun drop(offset: Int) {
        val a = dropAmp(dropScale)
        val pan = randomPan()
        val u = rng.uni()
        when {
            u < pPlink -> plink(offset, a, pan, plinkLo, plinkHi)
            u < pPlink + pTick -> tick(offset, a * 0.8f, pan)
            else -> splat(offset, a, pan)
        }
    }
}

internal fun drizzle(fs: Int, seed: Long): Voice = OpenRain(
    fs, seed, gustDepth = 0.15f, dropRate = 6f, gain = 0.5f,
    pPlink = 0.3f, pTick = 0.7f, plinkLo = 2200f, plinkHi = 5500f, dropScale = 0.12f, rumble = 0f,
) { Texture(fs, it, white = 0.10f, pink = 0.6f, grainRate = 1200f, grainAmp = 0.38f, hp = 1100f, lp = 10000f, peakHz = 4500f, peakDb = 4f, peakQ = 0.8f) }

internal fun steadyRain(fs: Int, seed: Long): Voice = OpenRain(
    fs, seed, gustDepth = 0.2f, dropRate = 16f, gain = 0.5f,
    pPlink = 0.5f, pTick = 0.35f, plinkLo = 1000f, plinkHi = 4200f, dropScale = 0.16f, rumble = 0f,
) { Texture(fs, it, white = 0.10f, pink = 0.9f, grainRate = 2600f, grainAmp = 0.36f, hp = 480f, lp = 8000f, peakHz = 2600f, peakDb = 2.5f, peakQ = 0.7f) }

internal fun heavyRain(fs: Int, seed: Long): Voice = OpenRain(
    fs, seed, gustDepth = 0.28f, dropRate = 38f, gain = 0.5f,
    pPlink = 0.4f, pTick = 0.2f, plinkLo = 700f, plinkHi = 3000f, dropScale = 0.18f, rumble = 0.18f,
) { Texture(fs, it, white = 0.08f, pink = 1f, grainRate = 5200f, grainAmp = 0.32f, hp = 110f, lp = 7000f, peakHz = 1300f, peakDb = 2f, peakQ = 0.6f) }

/** Rain in a forest: soft pats on leaves and the occasional heavy drip from the canopy. */
internal class LeafRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.25f, dropRate = 12f) {
    private val texL = tex(Rng(seed * 31 + 1))
    private val texR = tex(Rng(seed * 31 + 2))

    private fun tex(r: Rng) = Texture(fs, r, white = 0.10f, pink = 0.6f, grainRate = 1500f, grainAmp = 0.45f, hp = 700f, lp = 7500f, peakHz = 2600f, peakDb = 3f, peakQ = 0.9f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        texL.render(l, n, 0.5f * level, level)
        texR.render(r, n, 0.5f * level, level)
    }

    override fun drop(offset: Int) {
        val pan = randomPan()
        if (rng.chance(0.14f)) {
            // Fat drip landing on leaf litter.
            val a = rng.range(0.12f, 0.3f)
            grains.spawn(offset, rng.logRange(380f, 900f), rng.range(0.03f, 0.05f), a, pan, attackMs = 0.6f)
            grains.spawn(offset, rng.logRange(1200f, 2400f), 0.012f, a * 0.5f, pan, attackMs = 0.3f)
        } else {
            // Drop hitting a leaf: dull, no ring.
            val a = dropAmp(0.16f)
            grains.spawn(offset, rng.logRange(700f, 1900f), rng.range(0.010f, 0.018f), a, pan, attackMs = 0.4f)
            grains.spawn(offset, rng.logRange(2400f, 5200f), rng.range(0.004f, 0.007f), a * 0.5f, pan)
        }
    }
}

/** Indoors by a window: the storm muffled by glass, and drops tapping the pane in gusts. */
internal class WindowRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.45f, dropRate = 10f) {
    private val outL = outside(Rng(seed * 31 + 1))
    private val outR = outside(Rng(seed * 31 + 2))
    private val sprayL = spray(Rng(seed * 31 + 3))
    private val sprayR = spray(Rng(seed * 31 + 4))

    // A real pane has fixed resonances; every tap excites a few of them.
    private val paneModes = FloatArray(14) { 900f * 1.13f.pow(it) * rng.range(0.97f, 1.03f) }

    private fun outside(r: Rng) = Texture(fs, r, white = 0.3f, pink = 0.8f, grainRate = 1500f, grainAmp = 0.3f, hp = 120f, lp = 2400f, peakHz = 700f, peakDb = 2f, peakQ = 0.7f)
    private fun spray(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 420f, grainAmp = 1f, hp = 2200f, lp = 9000f, peakHz = 4800f, peakDb = 5f, peakQ = 1.2f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        outL.render(l, n, 0.55f * level, level)
        outR.render(r, n, 0.55f * level, level)
        val s = 0.11f * level * level
        sprayL.render(l, n, s, level * level)
        sprayR.render(r, n, s, level * level)
    }

    override fun drop(offset: Int) {
        val a = dropAmp(0.3f)
        val pan = randomPan(0.75f)
        val m = rng.int(paneModes.size - 3)
        grains.spawn(offset, paneModes[m], rng.range(0.008f, 0.016f), a, pan)
        grains.spawn(offset, paneModes[m + 1 + rng.int(2)], rng.range(0.005f, 0.010f), a * 0.7f, pan)
        grains.spawn(offset, paneModes[m + 3] * 1.6f, rng.range(0.003f, 0.006f), a * 0.5f, pan)
        // The pane itself gives a faint low knock.
        grains.spawn(offset, rng.range(210f, 430f), 0.045f, a * 0.3f, pan, attackMs = 0.5f)
    }
}

/** Inside a tent: taut fabric right above your head turns each drop into a soft pop. */
internal class TentRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.25f, dropRate = 30f) {
    private val outL = outside(Rng(seed * 31 + 1))
    private val outR = outside(Rng(seed * 31 + 2))
    private val patL = patter(Rng(seed * 31 + 3))
    private val patR = patter(Rng(seed * 31 + 4))

    private fun outside(r: Rng) = Texture(fs, r, white = 0.35f, pink = 0.5f, grainRate = 1200f, grainAmp = 0.3f, hp = 300f, lp = 5000f)
    private fun patter(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 900f, grainAmp = 1f, hp = 250f, lp = 3800f, peakHz = 1100f, peakDb = 6f, peakQ = 1f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        outL.render(l, n, 0.3f * level, level)
        outR.render(r, n, 0.3f * level, level)
        patL.render(l, n, 0.4f * level, level)
        patR.render(r, n, 0.4f * level, level)
    }

    override fun drop(offset: Int) {
        val a = dropAmp(0.4f)
        val pan = randomPan()
        val f = rng.logRange(220f, 900f)
        grains.spawn(offset, f, rng.range(0.030f, 0.070f), a, pan, attackMs = 0.6f)
        grains.spawn(offset, f * rng.range(1.5f, 2.3f), rng.range(0.015f, 0.030f), a * 0.5f, pan, attackMs = 0.4f)
        grains.spawn(offset, rng.logRange(2500f, 5000f), 0.005f, a * 0.3f, pan)
    }
}

/** Under a corrugated metal roof: every drop pings one of the sheet's own resonances. */
internal class TinRoofRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.25f, dropRate = 22f) {
    private val bedL = bed(Rng(seed * 31 + 1))
    private val bedR = bed(Rng(seed * 31 + 2))
    private val drumL = drum(Rng(seed * 31 + 3))
    private val drumR = drum(Rng(seed * 31 + 4))
    private val sheetModes = FloatArray(18) { 380f * 1.165f.pow(it) * rng.range(0.96f, 1.04f) }

    private fun bed(r: Rng) = Texture(fs, r, white = 0.4f, pink = 0.7f, grainRate = 2500f, grainAmp = 0.4f, hp = 200f, lp = 6000f, peakHz = 1800f, peakDb = 3f, peakQ = 0.7f)
    private fun drum(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 700f, grainAmp = 1f, hp = 500f, lp = 7000f, peakHz = 2600f, peakDb = 8f, peakQ = 2.5f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        bedL.render(l, n, 0.4f * level, level)
        bedR.render(r, n, 0.4f * level, level)
        drumL.render(l, n, 0.3f * level, level)
        drumR.render(r, n, 0.3f * level, level)
    }

    override fun drop(offset: Int) {
        val a = dropAmp(0.3f)
        val pan = randomPan()
        val m = rng.int(sheetModes.size - 6)
        val detune = rng.range(0.985f, 1.015f)
        // Lower resonances ring longer than higher ones.
        val ring = 0.12f * exp(-m * 0.09f)
        grains.spawn(offset, sheetModes[m] * detune, ring * rng.range(0.6f, 1f), a, pan)
        grains.spawn(offset, sheetModes[m + 2 + rng.int(2)] * detune, ring * 0.6f, a * 0.6f, pan)
        grains.spawn(offset, sheetModes[m + 5] * detune, ring * 0.35f, a * 0.35f, pan)
        grains.spawn(offset, rng.logRange(3500f, 7000f), 0.004f, a * 0.4f, pan)
    }
}

/** Walking under an umbrella: tight nylon ticks close to the ears, street rain all around. */
internal class UmbrellaRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.2f, dropRate = 24f) {
    private val streetL = street(Rng(seed * 31 + 1))
    private val streetR = street(Rng(seed * 31 + 2))
    private val patL = patter(Rng(seed * 31 + 3))
    private val patR = patter(Rng(seed * 31 + 4))

    private fun street(r: Rng) = Texture(fs, r, white = 0.4f, pink = 0.4f, grainRate = 1500f, grainAmp = 0.4f, hp = 400f, lp = 9000f)
    private fun patter(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 700f, grainAmp = 1f, hp = 600f, lp = 6000f, peakHz = 2200f, peakDb = 5f, peakQ = 1.2f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        streetL.render(l, n, 0.28f * level, level)
        streetR.render(r, n, 0.28f * level, level)
        patL.render(l, n, 0.32f * level, level)
        patR.render(r, n, 0.32f * level, level)
    }

    override fun drop(offset: Int) {
        val a = dropAmp(0.4f)
        val pan = randomPan()
        val f = rng.logRange(500f, 1800f)
        grains.spawn(offset, f, rng.range(0.014f, 0.030f), a, pan, attackMs = 0.3f)
        grains.spawn(offset, f * rng.range(1.6f, 2.6f), rng.range(0.008f, 0.014f), a * 0.55f, pan, attackMs = 0.2f)
        grains.spawn(offset, rng.logRange(3000f, 6000f), 0.004f, a * 0.4f, pan)
    }
}

/** Parked car: dull thuds on the steel roof, ticks on the windscreen, the world shut out. */
internal class CarRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.25f, dropRate = 34f) {
    private val bedL = bed(Rng(seed * 31 + 1))
    private val bedR = bed(Rng(seed * 31 + 2))
    private val patL = patter(Rng(seed * 31 + 3))
    private val patR = patter(Rng(seed * 31 + 4))
    private val brown = Brown(Rng(seed * 31 + 5), fs)
    private val rum = Biquad().lowpass(fs, 110f)

    private fun bed(r: Rng) = Texture(fs, r, white = 0.15f, pink = 1f, grainRate = 800f, grainAmp = 0.2f, hp = 50f, lp = 1100f, peakHz = 250f, peakDb = 3f, peakQ = 0.7f)
    private fun patter(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 800f, grainAmp = 1f, hp = 150f, lp = 1800f, peakHz = 600f, peakDb = 5f, peakQ = 1f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        bedL.render(l, n, 0.5f * level, level)
        bedR.render(r, n, 0.5f * level, level)
        patL.render(l, n, 0.45f * level, level)
        patR.render(r, n, 0.45f * level, level)
        val g = 0.15f * level
        for (i in 0 until n) {
            val v = rum.process(brown.next()) * g
            l[i] += v
            r[i] += v
        }
    }

    override fun drop(offset: Int) {
        val pan = randomPan()
        if (rng.chance(0.2f)) {
            // Windscreen.
            val a = dropAmp(0.22f)
            grains.spawn(offset, rng.logRange(1800f, 4500f), rng.range(0.006f, 0.012f), a, pan * 0.6f)
            grains.spawn(offset, rng.logRange(2500f, 6000f), rng.range(0.004f, 0.008f), a * 0.6f, pan * 0.6f)
        } else {
            val a = dropAmp(0.45f)
            val f = rng.logRange(150f, 520f)
            grains.spawn(offset, f, rng.range(0.035f, 0.060f), a, pan, attackMs = 1.2f)
            grains.spawn(offset, f * rng.range(2.2f, 3.1f), 0.020f, a * 0.3f, pan, attackMs = 0.8f)
        }
    }
}

/** Water running off the eaves into puddles: a handful of drip lines, each with its own pitch and tempo. */
internal class EavesDrip(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 48)
    private val lines = 5
    private val pan = FloatArray(lines) { -0.8f + 1.6f * it / (lines - 1) + rng.range(-0.1f, 0.1f) }
    private val period = FloatArray(lines) { rng.logRange(0.28f, 1.25f) }
    private val pitch = FloatArray(lines) { rng.logRange(650f, 2300f) }
    private val next = FloatArray(lines) { rng.range(0f, 1f) * fs }
    private val texL = tex(Rng(seed * 31 + 1))
    private val texR = tex(Rng(seed * 31 + 2))

    private fun tex(r: Rng) = Texture(fs, r, white = 0.3f, pink = 0.3f, grainRate = 700f, grainAmp = 0.5f, hp = 900f, lp = 10000f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        texL.render(l, n, 0.1f)
        texR.render(r, n, 0.1f)
        for (k in 0 until lines) {
            var t = next[k]
            while (t < n) {
                drip(k, t.toInt())
                // Each line slowly speeds up and slows down as the roof drains.
                period[k] = (period[k] * rng.range(0.97f, 1.03f)).coerceIn(0.22f, 1.6f)
                t += period[k] * rng.range(0.88f, 1.12f) * fs
            }
            next[k] = t - n
        }
        grains.render(l, r, n)
        // A little space around the drips.
        for (i in 0 until n) {
            sl[i] += l[i] * 0.12f
            sr[i] += r[i] * 0.12f
        }
    }

    private fun drip(k: Int, off: Int) {
        val f = pitch[k] * rng.range(0.86f, 1.16f)
        val a = rng.range(0.25f, 0.5f)
        val d = 0.043f * f + 0.0014f * f.pow(1.5f)
        // Entry splash, then the main bubble.
        grains.spawn(off, rng.logRange(4000f, 7500f), 0.003f, a * 0.3f, pan[k])
        grains.spawn(off + (0.004f * fs).toInt(), f, 6.908f / d, a, pan[k], riseRate = 0.14f * d, attackMs = 0.3f)
        if (rng.chance(0.6f)) {
            val f2 = f * rng.range(1.5f, 2.5f)
            val d2 = 0.043f * f2 + 0.0014f * f2.pow(1.5f)
            grains.spawn(off + (rng.range(0.018f, 0.05f) * fs).toInt(), f2, 6.908f / d2, a * 0.45f, pan[k], riseRate = 0.14f * d2, attackMs = 0.2f)
        }
        if (rng.chance(0.25f)) {
            val f3 = f * rng.range(2.4f, 3.6f)
            val d3 = 0.043f * f3 + 0.0014f * f3.pow(1.5f)
            grains.spawn(off + (rng.range(0.05f, 0.09f) * fs).toInt(), f3, 6.908f / d3, a * 0.25f, pan[k], riseRate = 0.14f * d3, attackMs = 0.2f)
        }
    }
}

/** Far-off thunder: each strike is a cluster of overlapping rumbles that darken as they fade. */
internal class Thunder(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val svfL = Svf()
    private val svfR = Svf()
    private val subL = Brown(Rng(seed * 31 + 1), fs)
    private val subR = Brown(Rng(seed * 31 + 2), fs)
    private val subLpL = Biquad().lowpass(fs, 90f)
    private val subLpR = Biquad().lowpass(fs, 90f)
    private val roll = Flutter(rng, fs / CTRL, 7f)
    private val airL = OnePole()
    private val airR = OnePole()

    private val maxBursts = 7
    private val bStart = FloatArray(maxBursts)
    private val bAttack = FloatArray(maxBursts)
    private val bDecay = FloatArray(maxBursts)
    private val bAmp = FloatArray(maxBursts)
    private var bursts = 0
    private var t = 0f
    private var length = 0f
    private var tail = 3f
    private var nearness = 0.5f
    private var wait = rng.range(3f, 7f)
    private var active = false
    private var env = 0f
    private var cut = 80f
    private var pan = 0f

    private fun strike() {
        active = true
        t = 0f
        nearness = rng.range(0.25f, 1f)
        bursts = 3 + rng.int(maxBursts - 2)
        for (i in 0 until bursts) {
            bStart[i] = if (i == 0) 0f else rng.range(0.15f, 2.6f)
            bAttack[i] = rng.range(0.05f, 0.14f) + (1f - nearness) * rng.range(0.1f, 0.3f)
            bDecay[i] = rng.range(0.5f, 1.7f)
            bAmp[i] = if (i == 0) 1f else rng.range(0.3f, 0.9f)
        }
        tail = rng.range(2.6f, 4.2f)
        length = 5f * tail + 4f
        pan = rng.range(-0.5f, 0.5f)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = CTRL.toFloat() / fs
        var i = 0
        while (i < n) {
            val m = minOf(CTRL, n - i)
            if (!active) {
                wait -= m.toFloat() / fs
                if (wait <= 0f) strike()
                // Keep filters fed with silence so the next strike starts clean.
                i += m
                continue
            }
            var slow = 0f
            var fast = 0f
            for (b in 0 until bursts) {
                val u = t - bStart[b]
                if (u < 0f) continue
                val a = bAmp[b] * (1f - exp(-u / bAttack[b]))
                slow += a * exp(-u / bDecay[b])
                fast += a * exp(-u / 0.35f)
            }
            val overall = exp(-t / tail)
            val rollAmt = 0.55f + 0.45f * roll.next()
            // Swell in rather than bang, and let the very end fade instead of stopping.
            val onset = 1f - exp(-t / 0.35f)
            val ending = ((length - t) / 2.5f).coerceIn(0f, 1f)
            val targetEnv = (slow * 0.6f + 0.25f * onset) * overall * rollAmt * (0.35f + 0.65f * nearness) * ending
            val targetCut = 55f + (120f + 650f * nearness) * fast.coerceAtMost(1.6f) * overall + 60f * overall
            val e0 = env
            val de = (targetEnv - e0) / m
            cut += (targetCut - cut) * 0.5f
            svfL.set(fs, cut, 0.6f)
            svfR.set(fs, cut, 0.6f)
            airL.set(fs, cut * 1.6f)
            airR.set(fs, cut * 1.6f)
            val gL = panL(pan) * 1.4f
            val gR = panR(pan) * 1.4f
            for (k in 0 until m) {
                val e = e0 + de * k
                // Distance swallows the highs: a second, gentler low-pass on top of the main one.
                svfL.process(airL.lp(rng.bi()))
                svfR.process(airR.lp(rng.bi()))
                val a = (svfL.lp * 2.6f + subLpL.process(subL.next()) * 1.0f) * e * gL
                val b = (svfR.lp * 2.6f + subLpR.process(subR.next()) * 1.0f) * e * gR
                l[i + k] += a
                r[i + k] += b
                sl[i + k] += a * 0.35f
                sr[i + k] += b * 0.35f
            }
            env = targetEnv
            t += dt * m / CTRL
            if (t > length) {
                active = false
                env = 0f
                wait = rng.range(16f, 50f)
            }
            i += m
        }
    }

    private companion object {
        const val CTRL = 64
    }
}

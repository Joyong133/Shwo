package app.bimeong.engine

import kotlin.math.exp
import kotlin.math.pow
import kotlin.math.tanh

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
 *
 * @param send how much of the near drops goes to the reverb, which sets them in a space
 */
internal abstract class RainBase(
    fs: Int, seed: Long, private val gustDepth: Float, private val dropRate: Float, private val send: Float = 0f,
) : Voice(fs) {
    protected val rng = Rng(seed)

    /** Clean ringing tones: bubbles in a puddle, a sheet of metal. */
    protected val grains = GrainPool(fs, 96)

    /** Dull, noisy impacts: everything else a drop can land on. */
    protected val hits = NoiseGrains(fs, seed * 31 + 17, 64)
    private val gust = Wander(rng, 8f, 41f)
    private var dropT = 0f
    private var dl = FloatArray(0)
    private var dr = FloatArray(0)

    protected abstract fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float)
    protected abstract fun drop(offset: Int)

    /** Shapes the finished sound, for example with the echoes of the room it is heard in. */
    protected open fun space(l: FloatArray, r: FloatArray, n: Int) {}

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
        if (send > 0f) {
            if (dl.size < n) {
                dl = FloatArray(n)
                dr = FloatArray(n)
            } else {
                java.util.Arrays.fill(dl, 0, n, 0f)
                java.util.Arrays.fill(dr, 0, n, 0f)
            }
            grains.render(dl, dr, n)
            hits.render(dl, dr, n)
            for (i in 0 until n) {
                l[i] += dl[i]
                r[i] += dr[i]
                sl[i] += dl[i] * send
                sr[i] += dr[i] * send
            }
        } else {
            grains.render(l, r, n)
            hits.render(l, r, n)
        }
        space(l, r, n)
    }

    // --- single-drop models -------------------------------------------------

    /** Drop into standing water: a faint entry tick, then an air bubble rings and chirps upwards. */
    protected fun plink(off: Int, amp: Float, pan: Float, fLo: Float, fHi: Float) {
        val f = rng.logRange(fLo, fHi)
        val d = 0.043f * f + 0.0014f * f.pow(1.5f)
        hits.spawn(off, rng.logRange(3500f, 7000f), 2f, 0.003f, amp * 0.2f, pan)
        grains.spawn(off + (0.002f * fs).toInt(), f, 6.908f / d, amp, pan, riseRate = 0.12f * d, attackMs = 0.25f)
    }

    /** Drop on a hard surface: a dry, very short tick. */
    protected fun tick(off: Int, amp: Float, pan: Float, fLo: Float = 3000f, fHi: Float = 7000f) {
        hits.spawn(off, rng.logRange(fLo, fHi), rng.range(1.5f, 3f), rng.range(0.003f, 0.006f), amp, pan)
    }

    /** Fat drop on the ground: a wet slap with a short low body. */
    protected fun splat(off: Int, amp: Float, pan: Float) {
        hits.spawn(off, rng.logRange(1200f, 3200f), 1f, rng.range(0.010f, 0.018f), amp, pan)
        hits.spawn(off, rng.logRange(300f, 700f), 2f, 0.03f, amp * 0.7f, pan, attackMs = 0.4f)
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
) : RainBase(fs, seed, gustDepth, dropRate, send = 0.16f) {
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
            u < pPlink + pTick -> tick(offset, a * 0.6f, pan)
            else -> splat(offset, a * 0.6f, pan)
        }
    }
}

internal fun drizzle(fs: Int, seed: Long): Voice = OpenRain(
    fs, seed, gustDepth = 0.15f, dropRate = 6f, gain = 0.5f,
    pPlink = 0.3f, pTick = 0.7f, plinkLo = 2200f, plinkHi = 5500f, dropScale = 0.12f, rumble = 0f,
) { Texture(fs, it, white = 0.10f, pink = 0.6f, grainRate = 1200f, grainAmp = 0.38f, hp = 1100f, lp = 10000f, peakHz = 4500f, peakDb = 4f, peakQ = 0.8f, grainLo = 3200f, grainHi = 6500f) }

internal fun steadyRain(fs: Int, seed: Long): Voice = OpenRain(
    fs, seed, gustDepth = 0.2f, dropRate = 16f, gain = 0.5f,
    pPlink = 0.5f, pTick = 0.35f, plinkLo = 1000f, plinkHi = 4200f, dropScale = 0.16f, rumble = 0f,
) { Texture(fs, it, white = 0.10f, pink = 0.9f, grainRate = 2600f, grainAmp = 0.36f, hp = 480f, lp = 8000f, peakHz = 2600f, peakDb = 2.5f, peakQ = 0.7f, grainLo = 2200f, grainHi = 5000f) }

internal fun heavyRain(fs: Int, seed: Long): Voice = OpenRain(
    fs, seed, gustDepth = 0.28f, dropRate = 38f, gain = 0.5f,
    pPlink = 0.4f, pTick = 0.2f, plinkLo = 700f, plinkHi = 3000f, dropScale = 0.18f, rumble = 0.18f,
) { Texture(fs, it, white = 0.08f, pink = 1f, grainRate = 5200f, grainAmp = 0.32f, hp = 110f, lp = 7000f, peakHz = 1300f, peakDb = 2f, peakQ = 0.6f, grainLo = 1500f, grainHi = 3800f, wobble = 0.24f) }

/** Rain in a forest: soft pats on leaves and the occasional heavy drip from the canopy. */
internal class LeafRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.25f, dropRate = 12f, send = 0.14f) {
    private val texL = tex(Rng(seed * 31 + 1))
    private val texR = tex(Rng(seed * 31 + 2))

    private fun tex(r: Rng) = Texture(fs, r, white = 0.10f, pink = 0.6f, grainRate = 1500f, grainAmp = 0.45f, hp = 700f, lp = 7500f, peakHz = 2600f, peakDb = 3f, peakQ = 0.9f, grainLo = 1800f, grainHi = 4200f, grainQ = 1.2f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        texL.render(l, n, 0.5f * level, level)
        texR.render(r, n, 0.5f * level, level)
    }

    override fun drop(offset: Int) {
        val pan = randomPan()
        if (rng.chance(0.14f)) {
            // Fat drip landing on leaf litter.
            val a = rng.range(0.08f, 0.2f)
            hits.spawn(offset, rng.logRange(380f, 900f), 2.5f, rng.range(0.03f, 0.05f), a, pan, attackMs = 0.6f)
            hits.spawn(offset, rng.logRange(1200f, 2400f), 1.2f, 0.012f, a * 0.5f, pan)
        } else {
            // Drop hitting a leaf: dull, no ring.
            val a = dropAmp(0.1f)
            hits.spawn(offset, rng.logRange(900f, 2600f), 1.2f, rng.range(0.008f, 0.016f), a, pan, attackMs = 0.3f)
            if (rng.chance(0.5f)) hits.spawn(offset, rng.logRange(3000f, 6000f), 1.5f, 0.004f, a * 0.5f, pan)
        }
    }
}

/** Indoors by a window: the storm muffled by glass, and drops tapping the pane in gusts. */
internal class WindowRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.45f, dropRate = 10f) {
    private val outL = outside(Rng(seed * 31 + 1))
    private val outR = outside(Rng(seed * 31 + 2))
    private val sprayL = spray(Rng(seed * 31 + 3))
    private val sprayR = spray(Rng(seed * 31 + 4))
    private val room = Room(fs, floatArrayOf(7f, 11f, 17f, 23f, 29f), floatArrayOf(0.35f, 0.3f, 0.25f, 0.2f, 0.15f), 3500f)

    // A real pane has fixed resonances; every tap excites a few of them.
    private val paneModes = FloatArray(14) { 900f * 1.13f.pow(it) * rng.range(0.97f, 1.03f) }

    private fun outside(r: Rng) = Texture(fs, r, white = 0.3f, pink = 0.8f, grainRate = 1500f, grainAmp = 0.3f, hp = 120f, lp = 2400f, peakHz = 700f, peakDb = 2f, peakQ = 0.7f, grainLo = 900f, grainHi = 1800f)
    private fun spray(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 420f, grainAmp = 1f, hp = 2200f, lp = 9000f, peakHz = 4800f, peakDb = 5f, peakQ = 1.2f, grainLo = 3500f, grainHi = 6000f, grainQ = 2.5f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        outL.render(l, n, 0.55f * level, level)
        outR.render(r, n, 0.55f * level, level)
        val s = 0.11f * level * level
        sprayL.render(l, n, s, level * level)
        sprayR.render(r, n, s, level * level)
    }

    override fun drop(offset: Int) {
        val a = dropAmp(0.17f)
        val pan = randomPan(0.75f)
        val m = rng.int(paneModes.size - 3)
        hits.spawn(offset, paneModes[m], rng.range(4f, 7f), rng.range(0.008f, 0.016f), a, pan)
        hits.spawn(offset, paneModes[m + 2] * 1.7f, 3f, rng.range(0.003f, 0.006f), a * 0.6f, pan)
        // The pane itself gives a faint low knock.
        hits.spawn(offset, rng.range(210f, 430f), 3f, 0.04f, a * 0.35f, pan, attackMs = 0.5f)
    }

    override fun space(l: FloatArray, r: FloatArray, n: Int) = room.process(l, r, n, 0.5f)
}

/** Inside a tent: taut fabric right above your head turns each drop into a soft pop. */
internal class TentRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.25f, dropRate = 30f) {
    private val outL = outside(Rng(seed * 31 + 1))
    private val outR = outside(Rng(seed * 31 + 2))
    private val patL = patter(Rng(seed * 31 + 3))
    private val patR = patter(Rng(seed * 31 + 4))
    private val room = Room(fs, floatArrayOf(2.5f, 4f, 6f, 9f), floatArrayOf(0.4f, 0.35f, 0.3f, 0.2f), 7000f)

    private fun outside(r: Rng) = Texture(fs, r, white = 0.35f, pink = 0.5f, grainRate = 1200f, grainAmp = 0.3f, hp = 300f, lp = 5000f)
    private fun patter(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 900f, grainAmp = 1f, hp = 250f, lp = 6500f, peakHz = 1300f, peakDb = 4f, peakQ = 1f, grainLo = 1100f, grainHi = 3000f, grainQ = 1.5f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        outL.render(l, n, 0.3f * level, level)
        outR.render(r, n, 0.3f * level, level)
        patL.render(l, n, 0.4f * level, level)
        patR.render(r, n, 0.4f * level, level)
    }

    override fun drop(offset: Int) {
        val a = dropAmp(0.22f)
        val pan = randomPan()
        hits.spawn(offset, rng.logRange(250f, 900f), rng.range(2f, 3.5f), rng.range(0.025f, 0.06f), a, pan, attackMs = 0.5f)
        // The snap of the taut fabric.
        hits.spawn(offset, rng.logRange(1800f, 5000f), 1.3f, rng.range(0.006f, 0.012f), a * 0.7f, pan)
    }

    override fun space(l: FloatArray, r: FloatArray, n: Int) = room.process(l, r, n, 0.6f)
}

/** Under a corrugated metal roof: every drop pings one of the sheet's own resonances. */
internal class TinRoofRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.25f, dropRate = 22f, send = 0.08f) {
    private val bedL = bed(Rng(seed * 31 + 1))
    private val bedR = bed(Rng(seed * 31 + 2))
    private val drumL = drum(Rng(seed * 31 + 3))
    private val drumR = drum(Rng(seed * 31 + 4))
    private val sheetModes = FloatArray(18) { 380f * 1.165f.pow(it) * rng.range(0.96f, 1.04f) }
    private val room = Room(fs, floatArrayOf(9f, 14f, 21f, 31f), floatArrayOf(0.3f, 0.28f, 0.22f, 0.16f), 6000f)

    private fun bed(r: Rng) = Texture(fs, r, white = 0.4f, pink = 0.7f, grainRate = 2500f, grainAmp = 0.4f, hp = 200f, lp = 6000f, peakHz = 1800f, peakDb = 3f, peakQ = 0.7f)
    private fun drum(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 700f, grainAmp = 1f, hp = 500f, lp = 7000f, peakHz = 2200f, peakDb = 6f, peakQ = 2f, grainLo = 1200f, grainHi = 3000f, grainQ = 3f)

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
        // The hit itself.
        hits.spawn(offset, rng.logRange(2000f, 5000f), 2f, 0.005f, a * 0.5f, pan)
    }

    override fun space(l: FloatArray, r: FloatArray, n: Int) = room.process(l, r, n, 0.5f)
}

/** Walking under an umbrella: tight nylon ticks close to the ears, street rain all around. */
internal class UmbrellaRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.2f, dropRate = 24f) {
    private val streetL = street(Rng(seed * 31 + 1))
    private val streetR = street(Rng(seed * 31 + 2))
    private val patL = patter(Rng(seed * 31 + 3))
    private val patR = patter(Rng(seed * 31 + 4))
    private val room = Room(fs, floatArrayOf(1.5f, 2.5f, 4f), floatArrayOf(0.4f, 0.3f, 0.2f), 6000f)

    private fun street(r: Rng) = Texture(fs, r, white = 0.4f, pink = 0.4f, grainRate = 1500f, grainAmp = 0.4f, hp = 400f, lp = 9000f)
    private fun patter(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 700f, grainAmp = 1f, hp = 600f, lp = 6000f, peakHz = 2200f, peakDb = 5f, peakQ = 1.2f, grainLo = 1400f, grainHi = 3000f, grainQ = 2.5f)

    override fun textures(l: FloatArray, r: FloatArray, n: Int, level: Float) {
        streetL.render(l, n, 0.28f * level, level)
        streetR.render(r, n, 0.28f * level, level)
        patL.render(l, n, 0.32f * level, level)
        patR.render(r, n, 0.32f * level, level)
    }

    override fun drop(offset: Int) {
        val a = dropAmp(0.22f)
        val pan = randomPan()
        hits.spawn(offset, rng.logRange(600f, 1900f), rng.range(2.5f, 4f), rng.range(0.012f, 0.025f), a, pan, attackMs = 0.3f)
        hits.spawn(offset, rng.logRange(2500f, 5000f), 2f, rng.range(0.004f, 0.008f), a * 0.5f, pan)
    }

    override fun space(l: FloatArray, r: FloatArray, n: Int) = room.process(l, r, n, 0.5f)
}

/** Parked car: dull thuds on the steel roof, ticks on the windscreen, the world shut out. */
internal class CarRain(fs: Int, seed: Long) : RainBase(fs, seed, gustDepth = 0.25f, dropRate = 34f) {
    private val bedL = bed(Rng(seed * 31 + 1))
    private val bedR = bed(Rng(seed * 31 + 2))
    private val patL = patter(Rng(seed * 31 + 3))
    private val patR = patter(Rng(seed * 31 + 4))
    private val brown = Brown(Rng(seed * 31 + 5), fs)
    private val rum = Biquad().lowpass(fs, 110f)
    private val room = Room(fs, floatArrayOf(2f, 3.5f, 5f, 7.5f), floatArrayOf(0.35f, 0.3f, 0.25f, 0.15f), 2500f)

    private fun bed(r: Rng) = Texture(fs, r, white = 0.15f, pink = 1f, grainRate = 800f, grainAmp = 0.2f, hp = 50f, lp = 1100f, peakHz = 250f, peakDb = 3f, peakQ = 0.7f, grainLo = 400f, grainHi = 900f)
    private fun patter(r: Rng) = Texture(fs, r, white = 0f, pink = 0f, grainRate = 800f, grainAmp = 1f, hp = 150f, lp = 2600f, peakHz = 600f, peakDb = 4f, peakQ = 1f, grainLo = 420f, grainHi = 1400f, grainQ = 2f)

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
        if (rng.chance(0.3f)) {
            // Windscreen.
            hits.spawn(offset, rng.logRange(2000f, 5000f), 3f, rng.range(0.005f, 0.010f), dropAmp(0.3f), pan * 0.6f)
        } else {
            val a = dropAmp(0.26f)
            val f = rng.logRange(160f, 520f)
            hits.spawn(offset, f, rng.range(2f, 3f), rng.range(0.03f, 0.055f), a, pan, attackMs = 1f)
            hits.spawn(offset, f * 2.5f, 1.5f, 0.015f, a * 0.3f, pan)
        }
    }

    override fun space(l: FloatArray, r: FloatArray, n: Int) = room.process(l, r, n, 0.6f)
}

/** A wet street at night: steady rain, and now and then a car hissing past on the soaked road. */
internal class RoadRain(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val texL = street(Rng(seed * 31 + 1))
    private val texR = street(Rng(seed * 31 + 2))

    private inner class Car(seed: Long) {
        val noise = Rng(seed)
        val pink = Pink(noise)
        val tyre = Svf()
        val spray = Biquad().bandpass(fs, 4800f, 0.8f)
        val brown = Brown(Rng(seed + 1), fs)
        val body = Biquad().lowpass(fs, 140f)
        var active = false
        var t = 0f
        var half = 4f
        var width = 1.2f
        var dir = 1f
        var level = 1f
        var amp = 0f
        var gl = 0.7f
        var gr = 0.7f

        fun start() {
            active = true
            width = rng.range(0.9f, 1.7f)
            half = width * 4.5f
            t = -half
            dir = if (rng.chance(0.5f)) 1f else -1f
            level = rng.range(0.55f, 1f)
        }

        fun control(dt: Float): Float {
            t += dt
            if (t > half) {
                active = false
                return 0f
            }
            // A bell that swells as the car nears, with the tail of spray hanging a little longer.
            val w = if (t > 0f) width * 1.3f else width
            val u = t / w
            val edge = 1f - (kotlin.math.abs(t) / half)
            val a = level / (1f + u * u) * edge.coerceIn(0f, 1f).let { it * it * (3f - 2f * it) }
            val side = tanh(u)
            // Higher in pitch on the way in than on the way out.
            tyre.set(fs, (500f + 2600f * a.pow(0.7f)) * (1f - 0.15f * side), 0.8f)
            val pan = dir * side * 0.9f
            gl = panL(pan)
            gr = panR(pan)
            return a
        }
    }

    private val cars = Array(3) { Car(seed * 31 + 10 + it * 2) }
    private var next = rng.range(1.5f, 4f)

    private fun street(r: Rng) = Texture(fs, r, white = 0.10f, pink = 0.8f, grainRate = 2200f, grainAmp = 0.35f, hp = 450f, lp = 7500f, peakHz = 2400f, peakDb = 2f, peakQ = 0.7f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        texL.render(l, n, 0.26f)
        texR.render(r, n, 0.26f)
        val dt = n.toFloat() / fs
        next -= dt
        if (next <= 0f) {
            next = rng.expo(9f).coerceIn(2.5f, 30f)
            for (c in cars) {
                if (!c.active) {
                    c.start()
                    break
                }
            }
        }
        for (c in cars) {
            if (!c.active) continue
            val target = c.control(dt)
            val a0 = c.amp
            val da = (target - a0) / n
            for (i in 0 until n) {
                val a = a0 + da * i
                val w = c.noise.bi()
                c.tyre.process(w * 0.5f + c.pink.next())
                val s = (c.tyre.bp * 1.2f + c.tyre.lp * 0.4f) * a + c.spray.process(w) * a * a * 0.3f + c.body.process(c.brown.next()) * a * 0.3f
                l[i] += s * c.gl
                r[i] += s * c.gr
            }
            c.amp = target
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

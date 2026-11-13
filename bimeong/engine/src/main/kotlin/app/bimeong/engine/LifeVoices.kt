package app.bimeong.engine

import kotlin.math.exp
import kotlin.math.pow

/** A hot shower in a tiled bathroom: dense spray, splatter on the floor, water gurgling down the drain. */
internal class Shower(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val texL = tex(Rng(seed * 31 + 1))
    private val texR = tex(Rng(seed * 31 + 2))
    private val hits = NoiseGrains(fs, seed * 31 + 3, 32)
    private val grains = GrainPool(fs, 24)
    private val room = Room(fs, floatArrayOf(4f, 7f, 11f, 16f, 23f), floatArrayOf(0.4f, 0.35f, 0.3f, 0.25f, 0.2f), 7000f)
    private var splatT = 0f
    private var drainT = 0f

    private fun tex(r: Rng) = Texture(fs, r, white = 0.5f, pink = 0.6f, grainRate = 6000f, grainAmp = 0.45f, hp = 500f, lp = 12000f, peakHz = 3500f, peakDb = 3f, peakQ = 0.7f, wobble = 0.1f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        texL.render(l, n, 0.4f)
        texR.render(r, n, 0.4f)
        var t = splatT
        while (t < n) {
            hits.spawn(t.toInt(), rng.logRange(500f, 1500f), 1.2f, rng.range(0.012f, 0.025f), (rng.heavy() * 0.03f).coerceAtMost(0.2f), rng.range(-0.8f, 0.8f))
            t += rng.expo(fs / 25f)
        }
        splatT = t - n
        t = drainT
        while (t < n) {
            val f = rng.logRange(300f, 900f)
            val d = 0.043f * f + 0.0014f * f.pow(1.5f)
            grains.spawn(t.toInt(), f, (6.908f / d).coerceAtMost(0.08f), rng.range(0.04f, 0.1f), rng.range(-0.2f, 0.2f), riseRate = 0.2f * d, attackMs = 0.3f)
            t += rng.expo(fs / 5f)
        }
        drainT = t - n
        hits.render(l, r, n)
        grains.render(l, r, n)
        room.process(l, r, n, 0.6f)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.2f
            sr[i] += r[i] * 0.2f
        }
    }
}

/** A pot at a rolling boil: fat bubbles rising and bursting, a thread of steam. */
internal class Boil(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 64)
    private val hits = NoiseGrains(fs, seed * 31 + 3, 32)
    private val roll = Wander(rng, 4f, 15f)
    private val steamL = Biquad().highpass(fs, 5000f)
    private val steamR = Biquad().highpass(fs, 5000f)
    private val brown = Brown(Rng(seed * 31 + 1), fs)
    private val pot = Biquad().bandpass(fs, 180f, 1f)
    private var next = 0f

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val rate = 70f * (0.6f + 0.8f * roll.advance(n.toFloat() / fs))
        var t = next
        while (t < n) {
            val f = rng.logRange(250f, 1100f)
            val d = 0.043f * f + 0.0014f * f.pow(1.5f)
            val ring = (6.908f / d).coerceAtMost(0.06f)
            val a = rng.range(0.08f, 0.25f) * (f / 600f).pow(-0.3f)
            val pan = rng.range(-0.5f, 0.5f)
            grains.spawn(t.toInt(), f, ring, a, pan, riseRate = 0.2f * d, attackMs = 0.3f)
            // The bubble breaking the surface.
            hits.spawn(t.toInt() + (ring * 0.5f * fs).toInt(), rng.logRange(1500f, 4000f), 1.5f, 0.008f, a * 0.5f, pan)
            t += rng.expo(fs / rate)
        }
        next = t - n
        grains.render(l, r, n)
        hits.render(l, r, n)
        for (i in 0 until n) {
            val low = pot.process(brown.next()) * 0.1f
            l[i] += steamL.process(rng.bi()) * 0.03f + low
            r[i] += steamR.process(rng.bi()) * 0.03f + low
        }
    }
}

/** Something frying in a hot pan: a steady crackling sizzle, spitting oil, a fresh hiss now and then. */
internal class Sizzle(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val texL = tex(Rng(seed * 31 + 1))
    private val texR = tex(Rng(seed * 31 + 2))
    private val hits = NoiseGrains(fs, seed * 31 + 3, 48)
    private val heat = Wander(rng, 5f, 20f)
    private var popT = 0f
    private var surge = 0f
    private var nextSurge = rng.range(8f, 20f)

    private fun tex(r: Rng) = Texture(fs, r, white = 0.25f, pink = 0.1f, grainRate = 3800f, grainAmp = 1f, hp = 1800f, lp = 13000f, peakHz = 5500f, peakDb = 4f, peakQ = 0.8f, grainLo = 3800f, grainHi = 7500f, grainQ = 2.2f, wobble = 0.25f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        nextSurge -= dt
        if (nextSurge <= 0f) {
            // More batter hits the pan.
            nextSurge = rng.range(20f, 45f)
            surge = 1f
        }
        surge *= exp(-dt / 1.1f)
        val level = (0.75f + 0.25f * heat.advance(dt)) * (1f + 0.7f * surge)
        texL.render(l, n, 0.35f * level, level)
        texR.render(r, n, 0.35f * level, level)
        var t = popT
        while (t < n) {
            val a = (rng.heavy() * 0.04f).coerceAtMost(0.35f)
            val pan = rng.range(-0.7f, 0.7f)
            hits.spawn(t.toInt(), rng.logRange(1500f, 4500f), 2f, rng.range(0.004f, 0.01f), a, pan)
            if (rng.chance(0.1f)) hits.spawn(t.toInt(), rng.logRange(500f, 900f), 2f, 0.02f, a * 0.8f, pan)
            t += rng.expo(fs / (14f * level))
        }
        popT = t - n
        hits.render(l, r, n)
    }
}

/** Someone reading: every so often a page is lifted, flipped over and smoothed down. */
internal class PageTurn(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val paper = Pink(Rng(seed * 31 + 1))
    private val band = Svf()
    private val hits = NoiseGrains(fs, seed * 31 + 3, 48)
    private var wait = rng.range(0.8f, 2.5f)

    // 0 idle, 1 lifting, 2 flipping, 3 settling
    private var stage = 0
    private var t = 0f
    private var len = 0.4f
    private var amp = 0f
    private var crackT = 0f
    private var small = false

    private fun begin(next: Int) {
        stage = next
        t = 0f
        len = when (next) {
            1 -> rng.range(0.35f, 0.55f)
            2 -> rng.range(0.10f, 0.16f)
            else -> rng.range(0.25f, 0.4f)
        }
        if (next == 3) hits.spawn(0, rng.range(180f, 320f), 2f, 0.05f, 0.18f, -0.3f, attackMs = 2f)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        var target = 0f
        var pan = 0f
        if (stage == 0) {
            wait -= dt
            if (wait <= 0f) {
                wait = rng.expo(6f).coerceIn(2f, 18f) + 3f
                // Sometimes it is only a hand shifting on the paper.
                small = rng.chance(0.25f)
                begin(if (small) 3 else 1)
            }
        } else {
            t += dt
            val x = (t / len).coerceAtMost(1f)
            when (stage) {
                1 -> {
                    target = x.pow(1.5f) * 0.25f
                    band.set(fs, 1500f + 2700f * x, 0.8f)
                    pan = 0.35f
                }
                2 -> {
                    target = 1f
                    band.set(fs, 2500f + 3500f * x, 0.8f)
                    pan = 0.35f - 0.7f * x
                    // The sheet crackles as it bends.
                    var c = crackT
                    while (c < n) {
                        hits.spawn(c.toInt(), rng.logRange(2500f, 6000f), 2f, rng.range(0.003f, 0.006f), (rng.heavy() * 0.03f).coerceAtMost(0.25f), pan)
                        c += rng.expo(fs / 400f)
                    }
                    crackT = c - n
                }
                else -> {
                    target = (if (small) 0.2f else 0.5f) * (1f - x)
                    band.set(fs, 3000f - 1800f * x, 0.8f)
                    pan = -0.35f
                }
            }
            if (x >= 1f) {
                if (stage < 3 && !small) begin(stage + 1) else stage = 0
            }
        }
        val a0 = amp
        val da = (target - a0) / n
        val gl = panL(pan)
        val gr = panR(pan)
        if (a0 > 1e-4f || target > 1e-4f) {
            for (i in 0 until n) {
                band.process(paper.next() + rng.bi() * 0.4f)
                val s = band.bp * (a0 + da * i) * 0.9f
                l[i] += s * gl
                r[i] += s * gr
            }
        }
        amp = target
        hits.render(l, r, n)
    }
}

/** A hairdresser's scissors working their way around your head: slide, snip, open. */
internal class Scissors(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val hits = NoiseGrains(fs, seed * 31 + 3, 32)
    private val rings = GrainPool(fs, 32)
    private val around = Wander(rng, 12f, 40f)
    private var next = 0.5f
    private var left = 3 + rng.int(7)
    private var pan = 0f

    private fun snip() {
        val a = rng.range(0.6f, 1f)
        val b = rng.range(0.94f, 1.06f)
        // Blades sliding together.
        hits.spawn(0, 6000f, 0.8f, 0.09f, a * 0.08f, pan, attackMs = 25f)
        val shut = (0.07f * fs).toInt()
        hits.spawn(shut, 4500f, 2f, 0.004f, a * 0.3f, pan)
        rings.spawn(shut, 3100f * b, 0.05f, a * 0.3f, pan)
        rings.spawn(shut, 5200f * b, 0.035f, a * 0.24f, pan)
        rings.spawn(shut, 7600f * b, 0.02f, a * 0.15f, pan)
        // And springing open again.
        val open = shut + (rng.range(0.16f, 0.24f) * fs).toInt()
        hits.spawn(open, 3500f, 1.5f, 0.015f, a * 0.08f, pan)
        rings.spawn(open, 4100f * b, 0.02f, a * 0.07f, pan)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        pan = (around.advance(dt) - 0.5f) * 1.7f
        next -= dt
        if (next <= 0f) {
            snip()
            next = rng.range(0.42f, 0.6f)
            if (--left <= 0) {
                left = 3 + rng.int(7)
                next += rng.range(1f, 3.5f)
            }
        }
        hits.render(l, r, n)
        rings.render(l, r, n)
    }
}

/** A soft brush stroked slowly over the microphone, first by one ear, then the other. */
internal class Brushing(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val pink = Pink(Rng(seed * 31 + 1))
    private val band = Svf()
    private val bristles = Flutter(rng, fs, 60f)
    private var pos = 0
    private var len = 1
    private var gap = (0.3f * fs).toInt()
    private var side = -1f
    private var strokesLeft = 3 + rng.int(4)
    private var panFrom = 0f
    private var panTo = 0f
    private var colour = 2500f
    private var strength = 1f

    private fun stroke() {
        len = (rng.range(0.5f, 1.2f) * fs).toInt()
        pos = 0
        gap = (rng.range(0.15f, 0.5f) * fs).toInt()
        if (--strokesLeft <= 0) {
            strokesLeft = 3 + rng.int(4)
            side = -side
            gap += (rng.range(0.3f, 0.9f) * fs).toInt()
        }
        val a = side * rng.range(0.25f, 0.5f)
        val b = side * rng.range(0.7f, 0.95f)
        if (rng.chance(0.5f)) { panFrom = a; panTo = b } else { panFrom = b; panTo = a }
        colour = rng.logRange(1500f, 4000f)
        strength = rng.range(0.6f, 1f)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        var i = 0
        while (i < n) {
            if (gap > 0) {
                val skip = minOf(gap, n - i)
                gap -= skip
                i += skip
                if (gap == 0 && pos >= len) stroke()
                continue
            }
            if (pos >= len) {
                stroke()
                continue
            }
            val m = minOf(32, n - i, len - pos)
            val x = pos.toFloat() / len
            band.set(fs, colour * (0.8f + 0.5f * x), 0.6f)
            val pan = panFrom + (panTo - panFrom) * x
            val gl = panL(pan)
            val gr = panR(pan)
            val bell = Sine.of(0.5f * x).pow(0.7f) * strength
            for (k in 0 until m) {
                band.process(pink.next() + rng.bi() * 0.5f)
                val s = band.bp * bell * (0.6f + 0.4f * bristles.next()) * 0.6f
                l[i + k] += s * gl
                r[i + k] += s * gr
            }
            pos += m
            i += m
        }
    }
}

/** Fingernails drumming on a wooden box, then on glass: quick rolling taps, close to the ear. */
internal class Tapping(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val hits = NoiseGrains(fs, seed * 31 + 3, 48)
    private val rings = GrainPool(fs, 32)
    private var next = 0.4f
    private var glass = false
    private var materialLeft = rng.range(15f, 30f)
    private var side = -1f
    private var patternsLeft = 2 + rng.int(4)
    private var body = 450f

    private fun tap(off: Int, a: Float, pan: Float) {
        hits.spawn(off, rng.range(3500f, 5000f), 2f, 0.003f, a * 0.3f, pan)
        if (glass) {
            val f = body * rng.range(0.97f, 1.03f)
            rings.spawn(off, f, 0.09f, a * 0.4f, pan)
            rings.spawn(off, f * 1.6f, 0.05f, a * 0.25f, pan)
        } else {
            val f = body * rng.range(0.95f, 1.05f)
            hits.spawn(off, f, 9f, 0.06f, a * 0.5f, pan)
            hits.spawn(off, f * 2.3f, 7f, 0.03f, a * 0.25f, pan)
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        materialLeft -= dt
        if (materialLeft <= 0f) {
            materialLeft = rng.range(15f, 30f)
            glass = !glass
            body = if (glass) rng.range(1900f, 2600f) else rng.range(380f, 520f)
        }
        next -= dt
        if (next <= 0f) {
            val pan = side * rng.range(0.5f, 0.85f)
            if (rng.chance(0.7f)) {
                // Four fingers rolling, little finger to index.
                var off = 0
                for (k in 0 until 4) {
                    tap(off, rng.range(0.6f, 1f) * (0.8f + 0.07f * k), pan + k * 0.03f * side)
                    off += (rng.range(0.05f, 0.08f) * fs).toInt()
                }
                next = rng.range(0.55f, 0.9f)
            } else {
                tap(0, rng.range(0.7f, 1f), pan)
                tap((rng.range(0.11f, 0.16f) * fs).toInt(), rng.range(0.6f, 0.9f), pan)
                next = rng.range(0.4f, 0.7f)
            }
            if (--patternsLeft <= 0) {
                patternsLeft = 2 + rng.int(5)
                side = -side
                next += rng.range(0.2f, 0.8f)
            }
        }
        hits.render(l, r, n)
        rings.render(l, r, n)
    }
}

/** An old manual typewriter: type bars slapping the paper, the bell at the end of the line, the carriage zipping back. */
internal class Typewriter(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val hits = NoiseGrains(fs, seed * 31 + 3, 64)
    private val bell = GrainPool(fs, 8)
    private var next = 0.4f * fs
    private var lettersLeft = 3 + rng.int(6)
    private var column = 0
    private var lineLen = 38 + rng.int(20)

    private fun strike(off: Int, space: Boolean) {
        val pan = -0.4f + 0.8f * column / lineLen
        val a = rng.range(0.7f, 1f)
        if (space) {
            hits.spawn(off, 190f, 2.5f, 0.05f, a * 0.5f, 0f, attackMs = 1f)
            hits.spawn(off, 1500f, 2f, 0.01f, a * 0.25f, 0f)
        } else {
            val b = rng.range(0.92f, 1.08f)
            hits.spawn(off, 2900f * b, 2f, 0.008f, a * 0.5f, pan)
            hits.spawn(off, 900f * b, 4f, 0.025f, a * 0.45f, pan)
            hits.spawn(off, 180f, 2.5f, 0.04f, a * 0.3f, pan, attackMs = 0.5f)
        }
    }

    private fun carriageReturn(off: Int): Int {
        bell.spawn(off, 2100f, 0.9f, 0.25f, 0.35f)
        bell.spawn(off, 5650f, 0.4f, 0.1f, 0.35f)
        // The ratchet as the carriage is pushed back, then it hits the stop.
        var at = off + (0.35f * fs).toInt()
        val clicks = 26 + rng.int(10)
        for (k in 0 until clicks) {
            val x = k.toFloat() / clicks
            hits.spawn(at, 1800f + 1400f * x, 2.5f, 0.004f, 0.12f, 0.4f - 0.8f * x)
            at += (fs / (55f + 45f * x)).toInt()
        }
        hits.spawn(at, 160f, 2f, 0.07f, 0.55f, -0.4f, attackMs = 1f)
        hits.spawn(at, 950f, 3f, 0.03f, 0.35f, -0.4f)
        return at - off
    }

    private fun gauss(): Float = (rng.uni() + rng.uni() + rng.uni() - 1.5f) * 2f

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        var t = next
        while (t < n) {
            var gap = 0.115f * exp(0.22f * gauss()) * fs
            if (column >= lineLen) {
                gap = carriageReturn(t.toInt()) + rng.range(0.25f, 0.6f) * fs
                column = 0
                lineLen = 38 + rng.int(20)
            } else if (lettersLeft > 0) {
                strike(t.toInt(), space = false)
                lettersLeft--
                column++
            } else {
                strike(t.toInt(), space = true)
                lettersLeft = 2 + rng.int(7)
                column++
                gap += rng.range(0.02f, 0.08f) * fs
                if (rng.chance(0.08f)) gap += rng.range(0.6f, 2.5f) * fs
            }
            t += gap
        }
        next = t - n
        hits.render(l, r, n)
        bell.render(l, r, n)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.08f
            sr[i] += r[i] * 0.08f
        }
    }
}

/** A music box playing a lullaby it makes up as it goes. */
internal class MusicBox(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val tines = GrainPool(fs, 96)
    private val plucks = NoiseGrains(fs, seed * 31 + 3, 16)
    private val beat = rng.range(0.36f, 0.42f)
    private val tune = Melody(Rng(seed * 31 + 1), 783.99f, beat, range = 9)
    private var next = 0.3f * fs
    private var beats = 0f
    private var lastBar = -1

    private fun pluck(off: Int, f: Float, a: Float, pan: Float) {
        // Higher tines are shorter and die away sooner.
        val ring = (2.4f * (784f / f).pow(0.5f)).coerceIn(0.5f, 2.6f)
        tines.spawn(off, f, ring, a, pan, attackMs = 1.5f)
        tines.spawn(off, f * 2f, ring * 0.4f, a * 0.16f, pan, attackMs = 1f)
        tines.spawn(off, f * 5.4f, 0.14f, a * 0.12f, pan)
        plucks.spawn(off, 6000f, 2f, 0.003f, a * 0.2f, pan)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        var t = next
        while (t < n) {
            tune.next()
            val off = t.toInt() + (rng.range(0f, 0.006f) * fs).toInt()
            if (!tune.rest) pluck(off, tune.freq, rng.range(0.24f, 0.34f), rng.range(-0.25f, 0.25f))
            // A soft low note at the start of every bar holds it together.
            val bar = (beats / 3f + 0.01f).toInt()
            if (bar != lastBar) {
                lastBar = bar
                pluck(off, if (bar % 2 == 0) 392f else 293.66f, 0.1f, 0f)
            }
            beats += tune.seconds / beat
            t += tune.seconds * fs
        }
        next = t - n
        tines.render(l, r, n)
        plucks.render(l, r, n)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.25f
            sr[i] += r[i] * 0.25f
        }
    }
}

/** A great bronze temple bell, struck with a log and left to hum, its tone slowly swelling and sinking. */
internal class TempleBell(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val modes = Modes(fs, 10)
    private val log = NoiseGrains(fs, seed * 31 + 3, 4)
    private var next = 1f * fs

    init {
        val k = rng.range(0.94f, 1.06f)
        modes.set(0, 64f * k, 38f, 0.5f, 0f)
        modes.set(1, 168f * k, 26f, 0.8f, -0.25f)
        modes.set(2, 168f * k + 0.45f, 25f, 0.6f, 0.25f)
        modes.set(3, 262f * k, 14f, 0.35f, 0f)
        modes.set(4, 360f * k, 9f, 0.3f, -0.2f)
        modes.set(5, 360f * k + 0.9f, 8.5f, 0.2f, 0.2f)
        modes.set(6, 477f * k, 6f, 0.2f, 0f)
        modes.set(7, 620f * k, 3.5f, 0.15f, 0.1f)
        modes.set(8, 870f * k, 1.8f, 0.1f, -0.1f)
        modes.set(9, 1210f * k, 0.9f, 0.06f, 0f)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        next -= n
        if (next <= 0f) {
            next = rng.range(28f, 50f) * fs
            val a = rng.range(0.6f, 1f)
            for (m in 0 until 10) modes.strike(m, a * 0.12f)
            log.spawn(0, 220f, 1.5f, 0.12f, a * 0.25f, 0f, attackMs = 2f)
            log.spawn(0, 900f, 1f, 0.03f, a * 0.1f, 0f)
        }
        modes.render(l, r, n)
        log.render(l, r, n)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.4f
            sr[i] += r[i] * 0.4f
        }
    }
}

/** A monk's wooden moktak: a steady, hollow knock that now and then gathers speed into a roll. */
internal class Moktak(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val hits = NoiseGrains(fs, seed * 31 + 3, 24)
    private val body = rng.range(560f, 640f)
    private var next = 0.5f
    private var period = rng.range(0.55f, 0.7f)
    private var steadyLeft = 12 + rng.int(18)
    private var rolling = false
    private var closing = 0

    private fun knock(a: Float) {
        val f = body * rng.range(0.99f, 1.01f)
        hits.spawn(0, f, 14f, 0.07f, a * 0.6f, 0.05f)
        hits.spawn(0, f * 2.7f, 8f, 0.03f, a * 0.2f, 0.05f)
        hits.spawn(0, 3000f, 2f, 0.003f, a * 0.2f, 0.05f)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        next -= n.toFloat() / fs
        if (next <= 0f) {
            when {
                closing > 0 -> { // three slow knocks to finish, then silence for a while
                    knock(0.9f)
                    next = if (--closing == 0) rng.range(2f, 4f) else 0.8f
                    if (closing == 0) {
                        period = rng.range(0.55f, 0.7f)
                        steadyLeft = 12 + rng.int(18)
                    }
                }
                rolling -> {
                    knock(0.55f + 0.4f * (period / 0.7f).coerceAtMost(1f))
                    period *= 0.86f
                    next = period
                    if (period < 0.09f) {
                        rolling = false
                        closing = 3
                        next = 0.5f
                    }
                }
                else -> {
                    knock(rng.range(0.75f, 1f))
                    next = period * rng.range(0.98f, 1.02f)
                    if (--steadyLeft <= 0) {
                        rolling = true
                        period = 0.7f
                    }
                }
            }
        }
        hits.render(l, r, n)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.25f
            sr[i] += r[i] * 0.25f
        }
    }
}

/** A window seat on a night flight: the deep, even rush of the engines and the cabin air. */
internal class Airplane(fs: Int, seed: Long) : Voice(fs) {
    private val texL = tex(Rng(seed * 31 + 1))
    private val texR = tex(Rng(seed * 31 + 2))
    private val brown = Brown(Rng(seed * 31 + 3), fs)
    private val low = Biquad().lowpass(fs, 140f)
    private val air = Rng(seed * 31 + 4)
    private val airL = Biquad().bandpass(fs, 3000f, 0.5f)
    private val airR = Biquad().bandpass(fs, 3200f, 0.5f)
    private var p1 = 0f
    private var p2 = 0f

    private fun tex(r: Rng) = Texture(fs, r, white = 0.12f, pink = 0.9f, grainRate = 0f, grainAmp = 0f, hp = 60f, lp = 5500f, peakHz = 220f, peakDb = 5f, peakQ = 0.6f, wobble = 0.08f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        texL.render(l, n, 0.5f)
        texR.render(r, n, 0.5f)
        val i1 = 94.6f / fs
        val i2 = 95.4f / fs
        for (i in 0 until n) {
            p1 += i1; if (p1 >= 1f) p1 -= 1f
            p2 += i2; if (p2 >= 1f) p2 -= 1f
            // Two engines, a hair apart in speed, drifting in and out of step.
            val drone = Sine.of(p1) * 0.02f + Sine.of(p2) * 0.02f + Sine.of(p1 * 2f) * 0.012f
            val v = low.process(brown.next()) * 0.5f + drone
            l[i] += v + airL.process(air.bi()) * 0.05f
            r[i] += v + airR.process(air.bi()) * 0.05f
        }
    }
}

/** A hair dryer: a rush of hot air over the whine of a small fast motor. */
internal class HairDryer(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val common = Rng(seed * 31 + 1)
    private val jet = Biquad().bandpass(fs, 2600f, 0.5f)
    private val pinkL = Pink(Rng(seed * 31 + 2))
    private val pinkR = Pink(Rng(seed * 31 + 3))
    private val hpL = Biquad().highpass(fs, 500f)
    private val hpR = Biquad().highpass(fs, 500f)
    private val drift = Wander(rng, 6f, 20f)
    private val level = floatArrayOf(0.06f, 0.05f, 0.035f, 0.025f, 0.015f, 0.01f)
    private var ph = 0f
    private var speed = 285f

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        speed = 281f + 8f * drift.advance(n.toFloat() / fs)
        val inc = speed / fs
        for (i in 0 until n) {
            ph += inc
            if (ph >= 1f) ph -= 1f
            var motor = 0f
            for (k in 0 until 6) motor += Sine.of(ph * (k + 1)) * level[k]
            val rush = jet.process(common.bi()) * 0.5f
            l[i] += rush + hpL.process(pinkL.next()) * 0.3f + motor
            r[i] += rush + hpR.process(pinkR.next()) * 0.3f + motor
        }
    }
}

/** The engine room of a starship: a deep steady drone, air moving through ducts, something slowly cycling. */
internal class Spaceship(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val tones = floatArrayOf(55f, 82.4f, 110.3f, 164.9f)
    private val levels = floatArrayOf(0.12f, 0.08f, 0.06f, 0.03f)
    private val ph = FloatArray(4)
    private val swell = Array(4) { Wander(rng, 9f, 31f) }
    private val now = FloatArray(4) { 0.5f }
    private val brown = Brown(Rng(seed * 31 + 1), fs)
    private val low = Biquad().lowpass(fs, 100f)
    private val pinkL = Pink(Rng(seed * 31 + 2))
    private val pinkR = Pink(Rng(seed * 31 + 3))
    private val airL = Biquad().lowpass(fs, 1500f)
    private val airR = Biquad().lowpass(fs, 1500f)
    private val sweepL = Svf()
    private val sweepR = Svf()
    private val cycle = Wander(rng, 20f, 45f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        for (k in 0 until 4) now[k] = 0.4f + 0.6f * swell[k].advance(dt)
        val c = cycle.advance(dt)
        sweepL.set(fs, 200f + 400f * c, 4f)
        sweepR.set(fs, 215f + 400f * c, 4f)
        for (i in 0 until n) {
            var drone = 0f
            for (k in 0 until 4) {
                var p = ph[k] + tones[k] / fs
                if (p >= 1f) p -= 1f
                ph[k] = p
                drone += Sine.of(p) * levels[k] * now[k]
            }
            val v = drone + low.process(brown.next()) * 0.35f
            val a = pinkL.next()
            val b = pinkR.next()
            sweepL.process(a)
            sweepR.process(b)
            l[i] += v + airL.process(a) * 0.12f + sweepL.bp * 0.04f
            r[i] += v + airR.process(b) * 0.12f + sweepR.bp * 0.04f
        }
    }
}

/**
 * Two pure tones, one in each ear, a few cycles apart. Heard on headphones the difference
 * is perceived as a slow pulse.
 *
 * @param carrier pitch of the left tone, @param beat how much higher the right one is
 */
internal class Binaural(fs: Int, private val carrier: Float, private val beat: Float) : Voice(fs) {
    private var pl = 0f
    private var pr = 0f

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val il = carrier / fs
        val ir = (carrier + beat) / fs
        for (i in 0 until n) {
            pl += il; if (pl >= 1f) pl -= 1f
            pr += ir; if (pr >= 1f) pr -= 1f
            l[i] += Sine.of(pl) * 0.25f
            r[i] += Sine.of(pr) * 0.25f
        }
    }
}

package app.bimeong.engine

import kotlin.math.exp
import kotlin.math.pow

/** A cat purring against you: a slow pulse train that changes colour between breathing in and out. */
internal class Purr(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val f1 = Biquad().bandpass(fs, 115f, 2.5f)
    private val f2 = Biquad().bandpass(fs, 245f, 3f)
    private val f3 = Biquad().bandpass(fs, 540f, 3.5f)
    private val breath = Biquad().bandpass(fs, 1500f, 1.2f)
    private var pulsePh = 0f
    private var pulse = 0f
    private var gate = 0f

    // 0 = breathing in, 1 = pause, 2 = breathing out, 3 = pause
    private var stage = 0
    private var stageT = 0f
    private var stageLen = 1.3f
    private var jitter = 1f

    private fun nextStage() {
        stage = (stage + 1) % 4
        stageT = 0f
        stageLen = when (stage) {
            0 -> rng.range(1.1f, 1.5f)
            2 -> rng.range(1.3f, 1.9f)
            else -> rng.range(0.05f, 0.14f)
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = 1f / fs
        for (i in 0 until n) {
            stageT += dt
            if (stageT >= stageLen) nextStage()
            val breathing = stage == 0 || stage == 2
            val inhale = stage == 0
            val env = if (!breathing) 0f else {
                val a = (stageT / 0.16f).coerceAtMost(1f)
                val b = ((stageLen - stageT) / 0.22f).coerceAtMost(1f)
                a * b * (if (inhale) 1f else 0.72f)
            }
            val rate = (if (inhale) 27.5f else 23.5f) * jitter
            pulsePh += rate * dt
            var e = 0f
            if (pulsePh >= 1f) {
                pulsePh -= 1f
                jitter = rng.range(0.96f, 1.04f)
                e = env * rng.range(0.85f, 1f)
                gate = e
            }
            // Round the click off a little so it thuds rather than ticks.
            pulse = pulse * 0.82f + e
            if (pulse < 1e-12f) pulse = 0f
            gate *= 0.9985f
            if (gate < 1e-12f) gate = 0f
            val bright = if (inhale) 1f else 0.55f
            val s = f1.process(pulse) * 3f + f2.process(pulse) * 1.7f + f3.process(pulse) * 0.6f * bright +
                breath.process(rng.bi()) * gate * 0.05f * bright
            l[i] += s
            r[i] += s
        }
    }
}

/** Someone typing on a mechanical keyboard: words, spaces, pauses to think. */
internal class Keyboard(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val hits = NoiseGrains(fs, seed * 31 + 3, 64)
    private var next = 0.4f * fs
    private var lettersLeft = 3 + rng.int(6)
    private var wordsLeft = 4 + rng.int(9)

    private fun key(off: Int, space: Boolean) {
        val base = if (space) rng.range(0.68f, 0.76f) else rng.range(0.9f, 1.14f)
        val a = (if (space) 1f else 0.75f) * rng.range(0.7f, 1f)
        val pan = if (space) rng.range(-0.1f, 0.1f) else rng.range(-0.55f, 0.55f)
        // Bottoming out: plastic on plastic, with the dull knock of the case underneath.
        hits.spawn(off, 230f * base, 3f, if (space) 0.06f else 0.035f, a * 0.3f, pan, attackMs = 0.5f)
        hits.spawn(off, 1100f * base, 3f, 0.012f, a * 0.4f, pan)
        hits.spawn(off, 2600f * base, 2.5f, 0.006f, a * 0.35f, pan)
        hits.spawn(off, 4800f * base, 2f, 0.003f, a * 0.25f, pan)
        // Springing back.
        val up = off + (rng.range(0.055f, 0.105f) * fs).toInt()
        hits.spawn(up, 1800f * base, 3f, 0.008f, a * 0.16f, pan)
        hits.spawn(up, 4200f * base, 2f, 0.004f, a * 0.14f, pan)
    }

    private fun gauss(): Float = (rng.uni() + rng.uni() + rng.uni() - 1.5f) * 2f

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        var t = next
        while (t < n) {
            var gap = 0.13f * exp(0.3f * gauss())
            if (lettersLeft > 0) {
                key(t.toInt(), space = false)
                lettersLeft--
            } else {
                key(t.toInt(), space = true)
                lettersLeft = 2 + rng.int(7)
                gap += rng.range(0.03f, 0.1f)
                if (--wordsLeft <= 0) {
                    wordsLeft = 4 + rng.int(9)
                    gap += if (rng.chance(0.15f)) rng.range(2.5f, 5f) else rng.range(0.5f, 2.2f)
                }
            }
            t += gap * fs
        }
        next = t - n
        hits.render(l, r, n)
    }
}

/** Pencil on paper: strokes grouped into letters and words, travelling across the page. */
internal class Pencil(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val bp1 = Biquad().bandpass(fs, 3000f, 0.9f)
    private val bp2 = Biquad().bandpass(fs, 6200f, 1.3f)
    private val body = Biquad().bandpass(fs, 480f, 1.2f)
    private val grit = Flutter(rng, fs, 90f)
    private var len = 1
    private var pos = 0
    private var gap = (0.3f * fs).toInt()
    private var amp = 0f
    private var bright = 1f
    private var strokesLeft = 2
    private var lettersLeft = 4
    private var x = 0f
    private var gl = 0.7f
    private var gr = 0.7f

    private fun newStroke() {
        len = (rng.range(0.05f, 0.22f) * fs).toInt()
        pos = 0
        amp = rng.range(0.5f, 1f)
        // Fast strokes are brighter.
        bright = (0.14f * fs / len).coerceIn(0.4f, 1.4f)
        gap = (rng.range(0.025f, 0.09f) * fs).toInt()
        if (--strokesLeft <= 0) {
            strokesLeft = 1 + rng.int(3)
            gap += (rng.range(0.03f, 0.08f) * fs).toInt()
            x += 0.012f
            if (--lettersLeft <= 0) {
                lettersLeft = 2 + rng.int(7)
                gap += (rng.range(0.15f, 0.35f) * fs).toInt()
                x += 0.03f
            }
        }
        if (x > 1f) {
            // End of the line: lift, move back to the left margin.
            x = 0f
            gap += (rng.range(0.6f, 1.5f) * fs).toInt()
        }
        val pan = -0.5f + x
        gl = panL(pan)
        gr = panR(pan)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val tbl = Sine.table
        for (i in 0 until n) {
            var e = 0f
            if (gap > 0) {
                gap--
            } else {
                if (pos >= len) newStroke() else {
                    e = tbl[(pos * (Sine.SIZE / 2f) / len).toInt() and Sine.MASK] * amp * (0.55f + 0.45f * grit.next())
                    pos++
                }
            }
            val w = rng.bi() * e
            val s = bp1.process(w) + bp2.process(w) * 0.45f * bright + body.process(w) * 0.5f
            l[i] += s * gl
            r[i] += s * gr
        }
    }
}

/** A wall clock: tick, tock, once a second, exactly. */
internal class Clock(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 32)
    private var next = (0.2f * fs).toInt()
    private var tock = false

    private fun click(off: Int, base: Float, a: Float) {
        grains.spawn(off, 2300f * base, 0.012f, a, 0f)
        grains.spawn(off, 3700f * base, 0.008f, a * 0.7f, 0f)
        grains.spawn(off, 5200f * base, 0.005f, a * 0.5f, 0f)
        grains.spawn(off, 450f * base, 0.05f, a * 0.35f, 0f, attackMs = 0.3f)
        grains.spawn(off, 800f * base, 0.04f, a * 0.25f, 0f, attackMs = 0.3f)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        while (next < n) {
            val base = (if (tock) 0.88f else 1f) * rng.range(0.99f, 1.01f)
            val a = rng.range(0.55f, 0.6f)
            click(next, base, a)
            click(next + (0.03f * fs).toInt(), base * 1.07f, a * 0.4f)
            tock = !tock
            next += fs
        }
        next -= n
        grains.render(l, r, n)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.06f
            sr[i] += r[i] * 0.06f
        }
    }
}

/** Metal wind chimes: six tuned tubes, struck in clusters whenever a gust passes. */
internal class Chimes(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val tubes = floatArrayOf(587.3f, 659.3f, 740f, 880f, 987.8f, 1174.7f)
    private val ratios = floatArrayOf(1f, 2.756f, 5.404f, 8.933f)
    private val ring = floatArrayOf(4.5f, 1.8f, 0.7f, 0.3f)
    private val level = floatArrayOf(1f, 0.5f, 0.25f, 0.1f)
    private val modes = Modes(fs, tubes.size * ratios.size)
    private val gust = Wander(rng, 4f, 19f)
    private var next = rng.range(0.3f, 1.2f) * fs
    private var last = -1
    private var follow = -1f
    private var followTube = 0
    private var followAmp = 0f

    init {
        for (t in tubes.indices) {
            val pan = -0.6f + 1.2f * t / (tubes.size - 1)
            for (p in ratios.indices) {
                modes.set(t * ratios.size + p, tubes[t] * ratios[p], ring[p] * (587.3f / tubes[t]).pow(0.5f), level[p], pan)
            }
        }
    }

    private fun strike(tube: Int, amp: Float) {
        for (p in ratios.indices) {
            // A harder hit is brighter.
            modes.strike(tube * ratios.size + p, amp * (if (p == 0) 1f else amp.pow(0.5f)) * 0.22f)
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val g = gust.advance(n.toFloat() / fs)
        if (follow >= 0f) {
            follow -= n
            if (follow < 0f) strike(followTube, followAmp)
        }
        next -= n
        if (next <= 0f) {
            var tube = rng.int(tubes.size)
            if (tube == last) tube = (tube + 1 + rng.int(tubes.size - 1)) % tubes.size
            last = tube
            val amp = rng.range(0.15f, 0.8f) * (0.5f + g)
            strike(tube, amp)
            if (rng.chance(0.4f)) {
                follow = rng.range(0.06f, 0.24f) * fs
                followTube = (tube + (if (rng.chance(0.5f)) 1 else tubes.size - 1)) % tubes.size
                followAmp = amp * rng.range(0.4f, 0.9f)
            }
            val rate = 0.12f + 2.6f * g * g * g
            next = rng.expo(fs / rate).coerceAtLeast(0.05f * fs)
        }
        // Render into the dry buffers, then feed a share to the reverb.
        modes.render(l, r, n)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.3f
            sr[i] += r[i] * 0.3f
        }
    }
}

/** A singing bowl, struck now and then and left to ring. Paired partials beat slowly against each other. */
internal class Bowl(fs: Int, seed: Long, private val interval: Boolean = true, base: Float = 0f) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 8)
    private val modes = Modes(fs, 8)
    private val f0 = if (base > 0f) base else floatArrayOf(174.6f, 196f, 220f)[rng.int(3)]
    private var next = 0.25f * fs

    init {
        val ratios = floatArrayOf(1f, 2.71f, 5.05f, 7.95f)
        val beat = floatArrayOf(0.7f, 1.3f, 2.1f, 2.9f)
        val ring = floatArrayOf(22f, 14f, 7f, 3.5f)
        val level = floatArrayOf(1f, 0.55f, 0.25f, 0.1f)
        val scale = if (base > 0f) 0.3f else 1f
        for (p in 0..3) {
            modes.set(p * 2, f0 * ratios[p], ring[p] * scale, level[p] * 0.6f, -0.3f)
            modes.set(p * 2 + 1, f0 * ratios[p] + beat[p], ring[p] * scale * 0.93f, level[p] * 0.4f, 0.3f)
        }
    }

    fun strike(amp: Float) {
        for (m in 0 until 8) modes.strike(m, amp * 0.2f)
        grains.spawn(0, f0 * 4.3f, 0.02f, amp * 0.05f, 0f, attackMs = 0.5f)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        if (interval) {
            next -= n
            if (next <= 0f) {
                strike(rng.range(0.55f, 1f))
                next = rng.range(13f, 24f) * fs
            }
        }
        modes.render(l, r, n)
        grains.render(l, r, n)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.35f
            sr[i] += r[i] * 0.35f
        }
    }
}

/** A calm resting heartbeat. */
internal class Heartbeat(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 24)
    private val drift = Wander(rng, 20f, 70f)
    private var next = 0.3f * fs

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val bpm = 56f + 6f * drift.advance(n.toFloat() / fs)
        while (next < n) {
            val off = next.toInt()
            val a = rng.range(0.85f, 1f)
            // Upper partials are what a small speaker can actually reproduce.
            grains.spawn(off, 52f, 0.16f, a, 0f, attackMs = 4f)
            grains.spawn(off, 104f, 0.11f, a * 0.7f, 0f, attackMs = 3f)
            grains.spawn(off, 158f, 0.08f, a * 0.4f, 0f, attackMs = 2f)
            grains.spawn(off, 215f, 0.06f, a * 0.18f, 0f, attackMs = 2f)
            val s2 = off + (0.31f * fs).toInt()
            grains.spawn(s2, 68f, 0.11f, a * 0.7f, 0f, attackMs = 3f)
            grains.spawn(s2, 136f, 0.08f, a * 0.45f, 0f, attackMs = 2f)
            grains.spawn(s2, 204f, 0.05f, a * 0.2f, 0f, attackMs = 2f)
            next += 60f / bpm * fs
        }
        next -= n
        grains.render(l, r, n)
    }
}

/** A night train: low rumble, the carriage swaying, wheels crossing rail joints two by two. */
internal class Train(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 48)
    private val brown = Brown(Rng(seed * 31 + 1), fs)
    private val rum = Biquad().lowpass(fs, 130f)
    private val pinkL = Pink(Rng(seed * 31 + 3))
    private val pinkR = Pink(Rng(seed * 31 + 4))
    private val midL = Biquad().bandpass(fs, 260f, 0.7f)
    private val midR = Biquad().bandpass(fs, 260f, 0.7f)
    private val airLpL = Biquad().lowpass(fs, 2600f)
    private val airLpR = Biquad().lowpass(fs, 2600f)
    private val airHpL = Biquad().highpass(fs, 400f)
    private val airHpR = Biquad().highpass(fs, 400f)
    private val sway = Wander(rng, 3f, 9f)
    private val speed = Wander(rng, 30f, 90f)
    private var next = 0.5f * fs
    private var swayNow = 0.5f

    private fun clack(off: Int, a: Float, pan: Float) {
        val b = rng.range(0.95f, 1.05f)
        grains.spawn(off, 175f * b, 0.09f, a, pan, attackMs = 1f)
        grains.spawn(off, 410f * b, 0.05f, a * 0.6f, pan, attackMs = 0.5f)
        grains.spawn(off, 980f * b, 0.03f, a * 0.45f, pan)
        grains.spawn(off, 2300f * b, 0.012f, a * 0.22f, pan)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        val period = 1.18f + 0.26f * speed.advance(dt)
        while (next < n) {
            val off = next.toInt()
            val k = period / 1.28f
            val a = rng.range(0.75f, 0.95f)
            clack(off, a, -0.3f)
            clack(off + (0.095f * k * fs).toInt(), a * 0.9f, -0.2f)
            clack(off + (0.52f * k * fs).toInt(), a * 0.75f, 0.25f)
            clack(off + (0.615f * k * fs).toInt(), a * 0.7f, 0.35f)
            next += period * fs
        }
        next -= n
        grains.render(l, r, n)
        val target = sway.advance(dt)
        val s0 = swayNow
        val ds = (target - s0) / n
        for (i in 0 until n) {
            val s = 0.75f + 0.5f * (s0 + ds * i)
            val a = pinkL.next()
            val b = pinkR.next()
            val low = rum.process(brown.next()) * 0.3f
            l[i] += low + midL.process(a) * 0.25f * s + airHpL.process(airLpL.process(a)) * 0.12f
            r[i] += low + midR.process(b) * 0.25f * (2f - s) + airHpR.process(airLpR.process(b)) * 0.12f
        }
        swayNow = target
    }
}

/** An electric fan: steady rush of air with the faint beat of the blades and a motor hum underneath. */
internal class Fan(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val pinkL = Pink(Rng(seed * 31 + 1))
    private val pinkR = Pink(Rng(seed * 31 + 2))
    private val lpL = Biquad().lowpass(fs, 1900f)
    private val lpR = Biquad().lowpass(fs, 1900f)
    private val hpL = Biquad().highpass(fs, 70f)
    private val hpR = Biquad().highpass(fs, 70f)
    private val airL = Biquad().bandpass(fs, 4500f, 0.6f)
    private val airR = Biquad().bandpass(fs, 4500f, 0.6f)
    private val drift = Wander(rng, 15f, 40f)
    private var blade = 0f
    private var hum = 0f
    private var lvl = 1f

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val target = 0.93f + 0.14f * drift.advance(n.toFloat() / fs)
        val l0 = lvl
        val dl = (target - l0) / n
        val bladeInc = 57f / fs
        val humInc = 120f / fs
        for (i in 0 until n) {
            blade += bladeInc
            if (blade >= 1f) blade -= 1f
            hum += humInc
            if (hum >= 1f) hum -= 1f
            val am = (1f + 0.10f * Sine.of(blade) + 0.05f * Sine.of(blade * 2f)) * (l0 + dl * i)
            val h = Sine.of(hum) * 0.012f + Sine.of(hum * 2f) * 0.006f
            val a = pinkL.next()
            val b = pinkR.next()
            l[i] += (hpL.process(lpL.process(a)) + airL.process(a) * 0.05f) * am + h
            r[i] += (hpR.process(lpR.process(b)) + airR.process(b) * 0.05f) * am + h
        }
        lvl = target
    }
}

/** A freshly poured fizzy drink: a fine fizz of tiny bubbles bursting at the surface. */
internal class Fizz(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 128)
    private val hpL = Biquad().highpass(fs, 6000f)
    private val hpR = Biquad().highpass(fs, 6000f)
    private var next = 0f
    private var big = 0.5f * fs

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val meanGap = fs / 280f
        var t = next
        while (t < n) {
            val f = rng.logRange(3200f, 11000f)
            val d = 0.043f * f + 0.0014f * f.pow(1.5f)
            grains.spawn(t.toInt(), f, 6.908f / d * 1.5f, (rng.heavy() * 0.02f).coerceAtMost(0.2f), rng.range(-0.9f, 0.9f), riseRate = 0.1f * d)
            t += rng.expo(meanGap)
        }
        next = t - n
        big -= n
        if (big <= 0f) {
            val f = rng.logRange(1200f, 2800f)
            val d = 0.043f * f + 0.0014f * f.pow(1.5f)
            grains.spawn(0, f, 6.908f / d, rng.range(0.08f, 0.2f), rng.range(-0.6f, 0.6f), riseRate = 0.15f * d, attackMs = 0.2f)
            big = rng.expo(0.7f * fs)
        }
        grains.render(l, r, n)
        for (i in 0 until n) {
            l[i] += hpL.process(rng.bi()) * 0.02f
            r[i] += hpR.process(rng.bi()) * 0.02f
        }
    }
}

/** Plain coloured noise, the classic masking sounds. */
internal class ColorNoise(fs: Int, seed: Long, private val kind: Kind) : Voice(fs) {
    enum class Kind { WHITE, PINK, BROWN, GREEN }

    private val rngL = Rng(seed * 31 + 1)
    private val rngR = Rng(seed * 31 + 2)
    private val pinkL = Pink(rngL)
    private val pinkR = Pink(rngR)
    private val brownL = Brown(rngL, fs)
    private val brownR = Brown(rngR, fs)
    private val fL = Biquad()
    private val fR = Biquad()

    init {
        when (kind) {
            Kind.WHITE -> { fL.lowpass(fs, 15000f); fR.lowpass(fs, 15000f) }
            Kind.GREEN -> { fL.bandpass(fs, 500f, 0.6f); fR.bandpass(fs, 500f, 0.6f) }
            Kind.BROWN -> { fL.highpass(fs, 28f); fR.highpass(fs, 28f) }
            Kind.PINK -> { fL.highpass(fs, 28f); fR.highpass(fs, 28f) }
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        when (kind) {
            Kind.WHITE -> for (i in 0 until n) {
                l[i] += fL.process(rngL.bi()) * 0.5f
                r[i] += fR.process(rngR.bi()) * 0.5f
            }
            Kind.PINK -> for (i in 0 until n) {
                l[i] += fL.process(pinkL.next())
                r[i] += fR.process(pinkR.next())
            }
            Kind.BROWN -> for (i in 0 until n) {
                l[i] += fL.process(brownL.next())
                r[i] += fR.process(brownR.next())
            }
            Kind.GREEN -> for (i in 0 until n) {
                l[i] += fL.process(pinkL.next()) * 1.6f
                r[i] += fR.process(pinkR.next()) * 1.6f
            }
        }
    }
}

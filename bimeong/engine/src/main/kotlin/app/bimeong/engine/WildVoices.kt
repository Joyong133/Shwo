package app.bimeong.engine

import kotlin.math.exp
import kotlin.math.pow

/** A waterfall heard from its foot: a broad, heavy roar that surges and eases. */
internal class Waterfall(fs: Int, seed: Long) : Voice(fs) {
    private val texL = tex(Rng(seed * 31 + 1))
    private val texR = tex(Rng(seed * 31 + 2))
    private val brown = Brown(Rng(seed * 31 + 3), fs)
    private val rum = Biquad().lowpass(fs, 200f)
    private val pinkL = Pink(Rng(seed * 31 + 4))
    private val pinkR = Pink(Rng(seed * 31 + 5))
    private val surgeL = Biquad().bandpass(fs, 600f, 0.7f)
    private val surgeR = Biquad().bandpass(fs, 640f, 0.7f)
    private val swellL = Flutter(Rng(seed * 31 + 6), 187, 0.5f)
    private val swellR = Flutter(Rng(seed * 31 + 7), 187, 0.5f)

    private fun tex(r: Rng) = Texture(fs, r, white = 0.25f, pink = 1f, grainRate = 4000f, grainAmp = 0.3f, hp = 90f, lp = 9000f, peakHz = 900f, peakDb = 2f, peakQ = 0.6f, wobble = 0.3f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        texL.render(l, n, 0.5f)
        texR.render(r, n, 0.5f)
        val a = 0.25f + 0.6f * swellL.next()
        val b = 0.25f + 0.6f * swellR.next()
        for (i in 0 until n) {
            val low = rum.process(brown.next()) * 0.35f
            l[i] += low + surgeL.process(pinkL.next()) * a
            r[i] += low + surgeR.process(pinkR.next()) * b
            sl[i] += l[i] * 0.1f
            sr[i] += r[i] * 0.1f
        }
    }
}

/** Deep in a cave: single drops falling into still pools, each one ringing out into the dark. */
internal class CaveDrips(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 48)
    private val hits = NoiseGrains(fs, seed * 31 + 9, 16)
    private val lines = 6
    private val pan = FloatArray(lines) { rng.range(-0.85f, 0.85f) }
    private val every = FloatArray(lines) { rng.range(1.6f, 6f) }
    private val pitch = FloatArray(lines) { rng.logRange(480f, 1900f) }
    private val next = FloatArray(lines) { rng.range(0.2f, 4f) * fs }
    private val brown = Brown(Rng(seed * 31 + 1), fs)
    private val air = Biquad().lowpass(fs, 120f)
    private var dl = FloatArray(0)
    private var dr = FloatArray(0)

    private fun drip(k: Int, off: Int) {
        val f = pitch[k] * rng.range(0.9f, 1.12f)
        val a = rng.range(0.25f, 0.55f)
        val d = 0.043f * f + 0.0014f * f.pow(1.5f)
        hits.spawn(off, rng.logRange(3500f, 6500f), 2f, 0.003f, a * 0.15f, pan[k])
        grains.spawn(off + (0.004f * fs).toInt(), f, 6.908f / d, a, pan[k], riseRate = 0.14f * d, attackMs = 0.3f)
        if (rng.chance(0.5f)) {
            val f2 = f * rng.range(1.5f, 2.4f)
            val d2 = 0.043f * f2 + 0.0014f * f2.pow(1.5f)
            grains.spawn(off + (rng.range(0.02f, 0.06f) * fs).toInt(), f2, 6.908f / d2, a * 0.4f, pan[k], riseRate = 0.14f * d2, attackMs = 0.2f)
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        for (k in 0 until lines) {
            var t = next[k]
            while (t < n) {
                drip(k, t.toInt())
                t += every[k] * rng.range(0.7f, 1.4f) * fs
            }
            next[k] = t - n
        }
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
            val low = air.process(brown.next()) * 0.04f
            l[i] += dl[i] + low
            r[i] += dr[i] + low
            // Almost all of the sound of a cave is its echo.
            sl[i] += dl[i] * 0.9f
            sr[i] += dr[i] * 0.9f
        }
    }
}

/** The edge of a lake: small waves lapping at the shore, unhurried and uneven. */
internal class Lake(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 48)

    private inner class Lap(seed: Long, val pan: Float) {
        val noise = Pink(Rng(seed))
        val filter = Svf()
        var phase = rng.uni()
        var period = rng.range(2.2f, 4.2f)
        var size = rng.range(0.5f, 1f)
        var amp = 0f
        var bubbled = false
        val gl = panL(pan)
        val gr = panR(pan)

        fun control(dt: Float, offset: Int): Float {
            phase += dt / period
            if (phase >= 1f) {
                phase -= 1f
                period = rng.range(2.2f, 4.2f)
                size = rng.range(0.45f, 1f)
                bubbled = false
            }
            // The water slides in for the first part of each cycle and is quiet for the rest.
            val x = (phase / 0.62f).coerceAtMost(1f)
            val bell = Sine.of(0.5f * x)
            filter.set(fs, 300f + 2500f * bell * bell, 0.7f)
            if (!bubbled && phase > 0.22f) {
                bubbled = true
                // A few bubbles as it curls over the pebbles.
                repeat(2 + rng.int(5)) {
                    val f = rng.logRange(900f, 3200f)
                    val d = 0.043f * f + 0.0014f * f.pow(1.5f)
                    grains.spawn(
                        offset + (rng.range(0f, 0.35f) * fs).toInt(), f, 6.908f / d, rng.range(0.03f, 0.1f) * size,
                        pan + rng.range(-0.25f, 0.25f), riseRate = 0.12f * d, attackMs = 0.2f,
                    )
                }
            }
            return bell * bell * size
        }
    }

    private val laps = arrayOf(Lap(seed * 31 + 1, -0.6f), Lap(seed * 31 + 2, 0.55f), Lap(seed * 31 + 3, 0f))
    private val brown = Brown(Rng(seed * 31 + 4), fs)
    private val bed = Biquad().lowpass(fs, 180f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        for (lap in laps) {
            val target = lap.control(dt, 0)
            val a0 = lap.amp
            val da = (target - a0) / n
            for (i in 0 until n) {
                lap.filter.process(lap.noise.next())
                val s = lap.filter.lp * (a0 + da * i) * 1.6f
                l[i] += s * lap.gl
                r[i] += s * lap.gr
            }
            lap.amp = target
        }
        grains.render(l, r, n)
        for (i in 0 until n) {
            val v = bed.process(brown.next()) * 0.08f
            l[i] += v
            r[i] += v
        }
    }
}

/** Under the surface: everything muffled, a slow pressure in the ears, bubbles wobbling upward. */
internal class Underwater(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 48)
    private val brown = Brown(Rng(seed * 31 + 1), fs)
    private val deep = Biquad().lowpass(fs, 180f)
    private val pinkL = Pink(Rng(seed * 31 + 2))
    private val pinkR = Pink(Rng(seed * 31 + 3))
    private val murkL = Biquad().lowpass(fs, 420f)
    private val murkR = Biquad().lowpass(fs, 420f)
    private val sway = Wander(rng, 6f, 19f)
    private var next = rng.range(0.5f, 2f) * fs
    private var level = 0.5f

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        next -= n
        if (next <= 0f) {
            next = rng.expo(3.5f * fs).coerceAtLeast(0.6f * fs)
            // A string of bubbles, each a little higher than the last as they shrink on the way up.
            var f = rng.logRange(380f, 900f)
            var at = 0
            val pan = rng.range(-0.7f, 0.7f)
            repeat(3 + rng.int(7)) {
                grains.spawn(at, f, rng.range(0.09f, 0.16f), rng.range(0.12f, 0.3f), pan + rng.range(-0.15f, 0.15f), riseRate = 2.5f, attackMs = 2f)
                f *= rng.range(1.03f, 1.1f)
                at += (rng.range(0.05f, 0.13f) * fs).toInt()
            }
        }
        val target = 0.7f + 0.6f * sway.advance(n.toFloat() / fs)
        val l0 = level
        val dl = (target - l0) / n
        grains.render(l, r, n)
        for (i in 0 until n) {
            sl[i] += l[i] * 0.35f
            sr[i] += r[i] * 0.35f
            val g = l0 + dl * i
            val low = deep.process(brown.next()) * 0.7f * g
            l[i] += low + murkL.process(pinkL.next()) * 0.25f * g
            r[i] += low + murkR.process(pinkR.next()) * 0.25f * g
        }
        level = target
    }
}

/** Whales calling to one another somewhere in the deep: long moans that slide, waver and echo away. */
internal class Whale(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)

    private inner class Call {
        val mouth = Svf()
        var active = false
        var pos = 0
        var len = 1
        var fFrom = 150f
        var fTo = 200f
        var arch = 0f
        var growl = 0f
        var growlRate = 20f
        var level = 0.5f
        var gl = 0.7f
        var gr = 0.7f
        var ph = 0f
        var gp = 0f
        var table = Glottal.full

        fun start() {
            active = true
            pos = 0
            len = (rng.range(1.5f, 5f) * fs).toInt()
            if (rng.chance(0.6f)) {
                // A low moan.
                fFrom = rng.logRange(100f, 220f)
                fTo = fFrom * rng.range(0.6f, 1.8f)
                table = Glottal.full
            } else {
                // A higher cry.
                fFrom = rng.logRange(350f, 800f)
                fTo = fFrom * rng.range(0.7f, 1.6f)
                table = Glottal.soft
            }
            arch = if (rng.chance(0.35f)) rng.range(0.1f, 0.35f) else 0f
            growl = if (rng.chance(0.3f)) rng.range(0.3f, 0.7f) else 0f
            growlRate = rng.range(16f, 28f)
            level = rng.range(0.3f, 0.8f)
            val pan = rng.range(-0.8f, 0.8f)
            gl = panL(pan)
            gr = panR(pan)
        }

        fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
            val tbl = Sine.table
            var i = 0
            while (i < n && active) {
                val m = minOf(32, n - i)
                val x = pos.toFloat() / len
                val f = fFrom * (fTo / fFrom).pow(smoothstep(x)) * (1f + arch * Sine.of(0.5f * x))
                mouth.set(fs, (f * 3.2f).coerceIn(300f, 1800f), 3f)
                val inc = f * Glottal.SIZE / fs
                // Fade in over the first third of a second, out over the last second or so.
                val env = (pos / (0.3f * fs)).coerceAtMost(1f) * ((len - pos) / (0.9f * fs)).coerceIn(0f, 1f)
                for (k in 0 until m) {
                    val src = table[ph.toInt() and Glottal.MASK]
                    mouth.process(src)
                    val trem = 1f - growl * (0.5f + 0.5f * tbl[gp.toInt() and Sine.MASK])
                    val s = (mouth.bp * 0.5f + src * 0.12f) * env * trem * level
                    l[i + k] += s * gl
                    r[i + k] += s * gr
                    sl[i + k] += s * gl * 0.8f
                    sr[i + k] += s * gr * 0.8f
                    ph += inc
                    if (ph >= Glottal.SIZE) ph -= Glottal.SIZE
                    gp += growlRate * Sine.SIZE / fs
                    if (gp >= Sine.SIZE) gp -= Sine.SIZE
                }
                pos += m
                if (pos >= len) active = false
                i += m
            }
        }
    }

    private val calls = Array(2) { Call() }
    private var next = rng.range(0.5f, 2f)
    private val brown = Brown(Rng(seed * 31 + 1), fs)
    private val deep = Biquad().lowpass(fs, 150f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        next -= n.toFloat() / fs
        if (next <= 0f) {
            next = rng.expo(6f).coerceIn(2.5f, 20f)
            for (c in calls) {
                if (!c.active) {
                    c.start()
                    break
                }
            }
        }
        for (c in calls) if (c.active) c.render(l, r, sl, sr, n)
        for (i in 0 until n) {
            val v = deep.process(brown.next()) * 0.25f
            l[i] += v
            r[i] += v
        }
    }
}

/**
 * Summer cicadas: each one winds up through a run of rising "maem, maem, maem",
 * lets the last one trail off, and rests before starting again.
 */
internal class Cicada(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val count = 3
    private val pitch = FloatArray(count) { rng.range(3300f, 4100f) * Sine.SIZE / fs }
    private val buzz = FloatArray(count) { rng.range(200f, 240f) * Sine.SIZE / fs }
    private val unit = FloatArray(count) { rng.range(0.6f, 0.78f) }
    private val gl = FloatArray(count)
    private val gr = FloatArray(count)
    private val ph = FloatArray(count)
    private val bp = FloatArray(count)
    private val t = FloatArray(count)
    private val unitsLeft = IntArray(count) { 6 + rng.int(14) }

    // 0 = singing, 1 = last long note, 2 = resting
    private val stage = IntArray(count) { 2 }
    private val wait = FloatArray(count) { rng.range(0f, 4f) + it * 2f }
    private val finale = FloatArray(count) { 2f }
    private val chorus = Pink(Rng(seed * 31 + 1))
    private val chorusBand = Biquad().bandpass(fs, 5600f, 2f)
    private var chorusPh = 0f

    init {
        for (c in 0 until count) {
            val pan = rng.range(-0.8f, 0.8f)
            val dist = rng.range(0.3f, 1f)
            gl[c] = panL(pan) * dist
            gr[c] = panR(pan) * dist
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val tbl = Sine.table
        val dt = 1f / fs
        for (c in 0 until count) {
            var p = ph[c]
            var b = bp[c]
            var time = t[c]
            val a = gl[c]
            val g = gr[c]
            for (i in 0 until n) {
                time += dt
                var env: Float
                var bend = 1f
                when (stage[c]) {
                    0 -> {
                        val u = time / unit[c]
                        // Swell up, drop back, but never quite to silence between calls.
                        env = if (u < 0.45f) 0.2f + 0.8f * (u / 0.45f) else 1f - 0.8f * ((u - 0.45f) / 0.55f)
                        bend = 0.97f + 0.05f * env
                        if (u >= 1f) {
                            time = 0f
                            if (--unitsLeft[c] <= 0) {
                                stage[c] = 1
                                finale[c] = rng.range(1.6f, 2.6f)
                            }
                        }
                    }
                    1 -> {
                        val u = time / finale[c]
                        env = if (u < 0.12f) 0.2f + 0.8f * (u / 0.12f) else exp(-(u - 0.12f) * 3.2f)
                        bend = 1.02f - 0.09f * u
                        if (u >= 1f) {
                            stage[c] = 2
                            time = 0f
                            wait[c] = rng.range(3f, 10f)
                        }
                    }
                    else -> {
                        env = 0f
                        if (time >= wait[c]) {
                            stage[c] = 0
                            time = 0f
                            unitsLeft[c] = 6 + rng.int(14)
                        }
                    }
                }
                if (env > 0f) {
                    // The rasp: a membrane clicking a couple of hundred times a second.
                    val click = 0.5f + 0.5f * tbl[b.toInt() and Sine.MASK]
                    val car = tbl[p.toInt() and Sine.MASK] * 0.6f + tbl[(p * 1.31f).toInt() and Sine.MASK] +
                        tbl[(p * 1.62f).toInt() and Sine.MASK] * 0.7f + tbl[(p * 1.93f).toInt() and Sine.MASK] * 0.4f
                    val s = car * click * click * env * 0.3f
                    l[i] += s * a
                    r[i] += s * g
                    sl[i] += s * a * 0.12f
                    sr[i] += s * g * 0.12f
                }
                // The partials are not whole multiples, so the phase must never wrap: let it run and re-base rarely.
                p += pitch[c] * bend
                if (p >= Sine.SIZE * 100f) p -= Sine.SIZE * 100f
                b += buzz[c]
                if (b >= Sine.SIZE) b -= Sine.SIZE
            }
            ph[c] = p
            bp[c] = b
            t[c] = time
        }
        // Many more, too far off to tell apart.
        for (i in 0 until n) {
            chorusPh += 84f * Sine.SIZE / fs
            if (chorusPh >= Sine.SIZE) chorusPh -= Sine.SIZE
            val v = chorusBand.process(chorus.next()) * (0.6f + 0.4f * tbl[chorusPh.toInt() and Sine.MASK]) * 0.09f
            l[i] += v
            r[i] += v
        }
    }
}

/** Night in the hills: an eagle owl's slow hoots, and a scops owl calling its two notes over and over. */
internal class Owl(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val hooter = Chirper(fs)
    private val scops = Chirper(fs)
    private var nextHoot = rng.range(1f, 4f)
    private var nextScops = rng.range(6f, 14f)
    private val panHoot = rng.range(-0.7f, -0.2f)
    private val panScops = rng.range(0.2f, 0.75f)
    private val airL = Pink(Rng(seed * 31 + 1))
    private val airR = Pink(Rng(seed * 31 + 2))
    private val airLpL = Biquad().lowpass(fs, 1500f)
    private val airLpR = Biquad().lowpass(fs, 1500f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        nextHoot -= dt
        if (nextHoot <= 0f && !hooter.active) {
            nextHoot = rng.range(9f, 22f)
            hooter.clear()
            hooter.h2 = 0.15f
            val f = rng.range(295f, 330f)
            hooter.add(0.42f, 0.5f, f, f * 0.96f, 0.9f)
            hooter.add(0.2f, 0.12f, f * 0.98f, f * 0.97f, 0.7f)
            hooter.add(0.42f, 0.2f, f * 0.97f, f * 0.92f, 0.85f)
            hooter.start(panHoot, 0.7f, 0.55f)
        }
        nextScops -= dt
        if (nextScops <= 0f && !scops.active) {
            nextScops = rng.range(25f, 50f)
            scops.clear()
            scops.h2 = 0.08f
            val f = rng.range(1100f, 1250f)
            repeat(6 + rng.int(8)) {
                scops.add(0.11f, 0.09f, f, f * 1.01f, 0.6f)
                scops.add(0.16f, rng.range(1.15f, 1.4f), f * 1.13f, f * 1.05f, 0.7f)
            }
            scops.start(panScops, 0.35f, 0.6f)
        }
        if (hooter.active) hooter.render(l, r, sl, sr, n)
        if (scops.active) scops.render(l, r, sl, sr, n)
        for (i in 0 until n) {
            l[i] += airLpL.process(airL.next()) * 0.012f
            r[i] += airLpR.process(airR.next()) * 0.012f
        }
    }
}

/** Someone walking: on fresh snow that squeaks and packs down, or through dry fallen leaves. */
internal class Footsteps(fs: Int, seed: Long, private val snow: Boolean) : Voice(fs) {
    private val rng = Rng(seed)
    private val hits = NoiseGrains(fs, seed * 31 + 9, 96)
    private val drift = Wander(rng, 20f, 60f)
    private var stepIn = 0.4f
    private var left = false

    // The crunch of the current step, played out over a quarter of a second.
    private var crunchT = -1f
    private var crunchLen = 0.25f
    private var crunchNext = 0f
    private var crunchPitch = 2000f
    private var crunchAmp = 1f
    private var crunchPan = 0f
    private var second = false

    private fun beginCrunch(length: Float, amp: Float, pan: Float) {
        crunchT = 0f
        crunchLen = length
        crunchNext = 0f
        crunchPitch = if (snow) rng.logRange(1500f, 2800f) else rng.logRange(3000f, 5000f)
        crunchAmp = amp
        crunchPan = pan
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        val centre = (drift.advance(dt) - 0.5f) * 0.8f
        stepIn -= dt
        if (stepIn <= 0f) {
            stepIn = rng.range(0.56f, 0.68f)
            left = !left
            val pan = centre + if (left) -0.22f else 0.22f
            val a = rng.range(0.7f, 1f)
            // The weight coming down.
            hits.spawn(0, rng.range(130f, 220f), 2f, 0.07f, a * (if (snow) 0.3f else 0.12f), pan, attackMs = 3f)
            if (!snow) hits.spawn(0, 3200f, 0.7f, 0.22f, a * 0.1f, pan, attackMs = 20f)
            beginCrunch(rng.range(0.18f, 0.26f), a, pan)
            second = true
        }
        if (crunchT >= 0f) {
            val end = crunchT + dt
            while (crunchNext < end && crunchNext < crunchLen) {
                val x = crunchNext / crunchLen
                val bell = Sine.of(0.5f * x)
                val off = ((crunchNext - crunchT) * fs).toInt().coerceAtLeast(0)
                if (snow) {
                    // Packed snow sticks and slips: a quick creak that slows as the foot settles.
                    hits.spawn(off, crunchPitch * rng.range(0.85f, 1.15f), rng.range(3f, 5f), rng.range(0.006f, 0.010f), crunchAmp * bell * rng.range(0.15f, 0.3f), crunchPan)
                    crunchNext += 1f / (230f - 140f * x) * rng.range(0.8f, 1.25f)
                } else {
                    // Dry leaves crackle at random.
                    hits.spawn(off, crunchPitch * rng.range(0.6f, 1.6f), rng.range(1.5f, 2.5f), rng.range(0.003f, 0.008f), crunchAmp * bell * (rng.heavy() * 0.05f).coerceAtMost(0.4f), crunchPan + rng.range(-0.1f, 0.1f))
                    crunchNext += rng.expo(1f / 260f)
                }
            }
            crunchT = end
            if (crunchT >= crunchLen) {
                crunchT = -1f
                if (second) {
                    // Heel, then toe.
                    second = false
                    beginCrunch(rng.range(0.10f, 0.16f), crunchAmp * 0.6f, crunchPan)
                    crunchNext = rng.range(0.03f, 0.07f)
                }
            }
        }
        hits.render(l, r, n)
    }
}

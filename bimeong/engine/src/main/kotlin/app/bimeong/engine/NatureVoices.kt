package app.bimeong.engine

import kotlin.math.pow

private const val CTRL = 32

/** Surf on a beach: overlapping breakers that swell, crash, wash up and hiss back out. */
internal class Waves(fs: Int, seed: Long) : Voice(fs) {
    private inner class Breaker(seed: Long, val pan: Float, startPhase: Float) {
        val rng = Rng(seed)
        val pink = Pink(rng)
        val body = Svf()
        val fizzHp = Biquad().highpass(fs, 4500f)
        var phase = startPhase
        var period = rng.range(9f, 14f)
        var size = rng.range(0.6f, 1f)
        var amp = 0f
        var cut = 300f
        var fizz = 0f
        val gl = panL(pan)
        val gr = panR(pan)

        fun control(dt: Float) {
            phase += dt / period
            if (phase >= 1f) {
                phase -= 1f
                period = rng.range(9f, 14f)
                size = rng.range(0.55f, 1f)
            }
            val p = phase
            val a: Float
            val c: Float
            val f: Float
            when {
                p < 0.30f -> { // the swell gathers
                    val u = p / 0.30f
                    a = 0.06f + 0.34f * u * u; c = 220f + 600f * u; f = 0f
                }
                p < 0.36f -> { // it breaks
                    val u = smoothstep((p - 0.30f) / 0.06f)
                    a = 0.40f + 0.60f * u; c = 820f + 5200f * u; f = u
                }
                p < 0.62f -> { // white water runs up the sand
                    val u = (p - 0.36f) / 0.26f
                    a = 1f - 0.5f * u; c = 6020f - 3200f * u; f = 1f - 0.3f * u
                }
                else -> { // and drains away
                    val u = (p - 0.62f) / 0.38f
                    a = 0.5f - 0.44f * smoothstep(u); c = 2820f * 0.08f.pow(u); f = 0.7f * (1f - u) * (1f - u)
                }
            }
            amp += (a * size - amp) * 0.08f
            cut += (c - cut) * 0.08f
            fizz += (f * size - fizz) * 0.08f
            body.set(fs, cut, 0.6f)
        }
    }

    private val breakers = arrayOf(
        Breaker(seed * 31 + 1, -0.55f, 0.25f),
        Breaker(seed * 31 + 2, 0.5f, 0.7f),
        Breaker(seed * 31 + 3, 0.05f, 0.0f),
    )
    private val brown = Brown(Rng(seed * 31 + 4), fs)
    private val bed = Biquad().lowpass(fs, 280f)

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        var i = 0
        val dt = CTRL.toFloat() / fs
        while (i < n) {
            val m = minOf(CTRL, n - i)
            for (b in breakers) {
                b.control(dt * m / CTRL)
                val amp = b.amp * 2.4f
                val fz = b.fizz * 0.16f
                for (k in 0 until m) {
                    b.body.process(b.pink.next())
                    val s = b.body.lp * amp + b.fizzHp.process(b.rng.bi()) * fz
                    l[i + k] += s * b.gl
                    r[i + k] += s * b.gr
                }
            }
            // The distant roar of the sea, kept centred.
            for (k in 0 until m) {
                val v = bed.process(brown.next()) * 0.22f
                l[i + k] += v
                r[i + k] += v
            }
            i += m
        }
    }
}

/** A brook over stones: thousands of small air bubbles ringing as water tumbles. */
internal class Stream(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 128)
    private val sources = 3
    private val pans = floatArrayOf(-0.65f, 0.05f, 0.7f)
    private val flow = Array(sources) { Flutter(Rng(seed * 31 + it), 100, 0.8f) }
    private val next = FloatArray(sources)
    private val pinkL = Pink(Rng(seed * 31 + 7))
    private val pinkR = Pink(Rng(seed * 31 + 8))
    private val hissL = Biquad().bandpass(fs, 2000f, 0.5f)
    private val hissR = Biquad().bandpass(fs, 2000f, 0.5f)
    private val lowL = Biquad().bandpass(fs, 330f, 0.8f)
    private val lowR = Biquad().bandpass(fs, 330f, 0.8f)

    private fun bubble(off: Int, pan: Float) {
        val u = rng.uni()
        // Bubble radius 0.4 to 6 mm, small ones far more common. A bubble rings at about 3 kHz / radius in mm.
        val radiusMm = 0.4f * 15f.pow(u.pow(1.5f))
        val f = 3000f / radiusMm
        val d = 0.043f * f + 0.0014f * f.pow(1.5f)
        val a = 0.12f * (radiusMm / 1.5f).pow(-0.2f) * rng.range(0.35f, 1f)
        val rise = if (rng.chance(0.6f)) 0f else rng.range(0.05f, 0.25f) * d
        // In moving water big bubbles are torn apart before they can ring for long.
        val ring = (6.908f / d).coerceAtMost(0.07f)
        grains.spawn(off, f, ring, a, (pan + rng.range(-0.3f, 0.3f)), riseRate = rise, attackMs = 0.2f)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        for (s in 0 until sources) {
            val rate = 120f * (0.3f + 0.7f * flow[s].next())
            val meanGap = fs / rate
            var t = next[s]
            while (t < n) {
                bubble(t.toInt(), pans[s])
                t += rng.expo(meanGap)
            }
            next[s] = t - n
        }
        grains.render(l, r, n)
        for (i in 0 until n) {
            val a = pinkL.next()
            val b = pinkR.next()
            l[i] += hissL.process(a) * 0.04f + lowL.process(a) * 0.035f
            r[i] += hissR.process(b) * 0.04f + lowR.process(b) * 0.035f
        }
    }
}

/** Wind: noise through a resonance that rises in pitch and loudness with each gust. */
internal class Wind(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val common = Wander(rng, 5f, 23f)
    private val sideL = Wander(rng, 3f, 11f)
    private val sideR = Wander(rng, 3f, 11f)
    private val pinkL = Pink(Rng(seed * 31 + 1))
    private val pinkR = Pink(Rng(seed * 31 + 2))
    private val bodyL = Svf()
    private val bodyR = Svf()
    private val whistleL = Svf()
    private val whistleR = Svf()
    private val brown = Brown(Rng(seed * 31 + 3), fs)
    private val rum = Biquad().lowpass(fs, 110f)
    private var ampL = 0f
    private var ampR = 0f

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        var i = 0
        while (i < n) {
            val m = minOf(CTRL, n - i)
            val dt = m.toFloat() / fs
            val c = common.advance(dt)
            val gL = 0.65f * c + 0.35f * sideL.advance(dt)
            val gR = 0.65f * c + 0.35f * sideR.advance(dt)
            bodyL.set(fs, 170f * 2f.pow(2.4f * gL), 0.9f + 1.2f * gL)
            bodyR.set(fs, 170f * 2f.pow(2.4f * gR), 0.9f + 1.2f * gR)
            whistleL.set(fs, 700f * 2f.pow(1.3f * gL), 7f)
            whistleR.set(fs, 760f * 2f.pow(1.3f * gR), 7f)
            val tL = 0.12f + gL.pow(1.6f)
            val tR = 0.12f + gR.pow(1.6f)
            val wL = ((gL - 0.5f).coerceAtLeast(0f)).let { it * it } * 1.6f
            val wR = ((gR - 0.5f).coerceAtLeast(0f)).let { it * it } * 1.6f
            val a0 = ampL
            val b0 = ampR
            val da = (tL - a0) / m
            val db = (tR - b0) / m
            for (k in 0 until m) {
                val a = a0 + da * k
                val b = b0 + db * k
                val x = pinkL.next()
                val y = pinkR.next()
                bodyL.process(x); whistleL.process(x)
                bodyR.process(y); whistleR.process(y)
                val low = rum.process(brown.next()) * (0.2f + 0.5f * (a + b)) * 0.5f
                l[i + k] += (bodyL.bp * 1.6f + bodyL.lp * 0.5f) * a + whistleL.bp * wL * a + low
                r[i + k] += (bodyR.bp * 1.6f + bodyR.lp * 0.5f) * b + whistleR.bp * wR * b + low
            }
            ampL = tL
            ampR = tR
            i += m
        }
    }
}

/** Camp fire: a low flutter of flame, a thread of hiss, and wood that snaps in fits and starts. */
internal class Fire(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val grains = GrainPool(fs, 32)
    private val buses = 3
    private val exc = Array(buses) { FloatArray(0) }
    private val bp = arrayOf(
        Biquad().bandpass(fs, 1300f, 2f),
        Biquad().bandpass(fs, 2900f, 2.5f),
        Biquad().bandpass(fs, 5600f, 3f),
    )
    private val busL = floatArrayOf(panL(-0.55f), panL(0.1f), panL(0.6f))
    private val busR = floatArrayOf(panR(-0.55f), panR(0.1f), panR(0.6f))
    private var crackT = 0f
    private var burstLeft = 0f
    private var burstRate = 0f
    private val hissHpL = Biquad().highpass(fs, 3500f)
    private val hissHpR = Biquad().highpass(fs, 3500f)
    private val hissRng = Rng(seed * 31 + 1)
    private val brown = Brown(Rng(seed * 31 + 2), fs)
    private val roarLp = Biquad().lowpass(fs, 230f)
    private val pink = Pink(Rng(seed * 31 + 4))
    private val flame = Biquad().bandpass(fs, 420f, 0.8f)
    private val flick = Flutter(rng, fs, 6f)
    private val flick2 = Flutter(rng, fs, 2.3f)

    private fun crackle(off: Int, n: Int) {
        val a = (rng.heavy() * 0.05f).coerceAtMost(0.4f) * 8f
        val bus = rng.int(buses)
        val e = exc[bus]
        // A snap is a few closely spaced impulses, not a single click.
        var p = off
        var amp = a
        repeat(1 + rng.int(3)) {
            if (p < n) e[p] += amp * rng.sign()
            p += 2 + rng.int(30)
            amp *= 0.6f
        }
        if (a > 2.6f && rng.chance(0.5f)) {
            // A proper pop has a low body as well.
            val pan = rng.range(-0.6f, 0.6f)
            grains.spawn(off, rng.logRange(260f, 620f), 0.035f, a * 0.04f, pan, attackMs = 0.2f)
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        for (b in 0 until buses) {
            if (exc[b].size < n) exc[b] = FloatArray(n) else java.util.Arrays.fill(exc[b], 0, n, 0f)
        }
        val dt = n.toFloat() / fs
        if (burstLeft > 0f) burstLeft -= dt
        else if (rng.chance(dt * 0.35f)) {
            burstLeft = rng.range(0.3f, 1.6f)
            burstRate = rng.range(12f, 45f)
        }
        val rate = 6f + if (burstLeft > 0f) burstRate else 0f
        val meanGap = fs / rate
        var t = crackT
        while (t < n) {
            crackle(t.toInt(), n)
            t += rng.expo(meanGap)
        }
        crackT = t - n
        for (b in 0 until buses) {
            val e = exc[b]
            val f = bp[b]
            val gl = busL[b]
            val gr = busR[b]
            for (i in 0 until n) {
                val s = f.process(e[i]) + e[i] * 0.04f
                l[i] += s * gl
                r[i] += s * gr
            }
        }
        grains.render(l, r, n)
        for (i in 0 until n) {
            val fl = flick.next()
            val slow = flick2.next()
            val hiss = 0.02f + 0.03f * slow
            val low = roarLp.process(brown.next()) * (0.45f + 0.55f * fl) * 0.06f +
                flame.process(pink.next()) * (0.3f + 0.7f * fl) * 0.15f
            l[i] += hissHpL.process(hissRng.bi()) * hiss + low
            r[i] += hissHpR.process(hissRng.bi()) * hiss + low
        }
    }
}

/** Autumn night insects: field crickets chirping in threes and fours over a soft tree-cricket trill. */
internal class Crickets(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val count = 8
    private val inc = FloatArray(count)
    private val ph = FloatArray(count)
    private val pulseLen = IntArray(count)
    private val pulseGap = IntArray(count)
    private val pulses = IntArray(count)
    private val chirpGap = IntArray(count)
    private val gl = FloatArray(count)
    private val gr = FloatArray(count)
    private val pos = IntArray(count)
    private val pulseIdx = IntArray(count)
    private val silent = IntArray(count)
    private val boutLeft = IntArray(count)
    private val pulseAmp = FloatArray(count)

    init {
        for (c in 0 until count) {
            val tree = c >= 6
            val f = if (tree) rng.range(2800f, 3400f) else rng.range(4300f, 5200f)
            inc[c] = f / fs
            pulseLen[c] = ((if (tree) rng.range(0.010f, 0.013f) else rng.range(0.016f, 0.021f)) * fs).toInt()
            pulseGap[c] = ((if (tree) rng.range(0.008f, 0.011f) else rng.range(0.012f, 0.017f)) * fs).toInt()
            pulses[c] = if (tree) 150 + rng.int(400) else 3 + rng.int(2)
            chirpGap[c] = ((if (tree) rng.range(0.6f, 2.5f) else rng.range(0.22f, 0.42f)) * fs).toInt()
            val dist = if (tree) rng.range(0.10f, 0.2f) else rng.range(0.18f, 1f)
            val pan = rng.range(-0.9f, 0.9f)
            gl[c] = panL(pan) * dist
            gr[c] = panR(pan) * dist
            silent[c] = (rng.range(0f, 1.5f) * fs).toInt()
            boutLeft[c] = 4 + rng.int(20)
            pulseAmp[c] = 1f
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val tbl = Sine.table
        for (c in 0 until count) {
            var p = ph[c]
            val ic = inc[c] * Sine.SIZE
            var ps = pos[c]
            var si = silent[c]
            var pi = pulseIdx[c]
            var pa = pulseAmp[c]
            val len = pulseLen[c]
            val envInc = Sine.SIZE * 0.5f / len
            val a = gl[c]
            val b = gr[c]
            for (i in 0 until n) {
                if (si > 0) {
                    si--
                    continue
                }
                val env = tbl[(ps * envInc).toInt() and Sine.MASK]
                val car = tbl[p.toInt() and Sine.MASK] + 0.08f * tbl[(p * 2f).toInt() and Sine.MASK]
                val s = car * env * env * pa
                l[i] += s * a
                r[i] += s * b
                sl[i] += s * a * 0.2f
                sr[i] += s * b * 0.2f
                p += ic
                if (p >= Sine.SIZE) p -= Sine.SIZE
                if (++ps >= len) {
                    ps = 0
                    pa = rng.range(0.8f, 1f)
                    if (++pi < pulses[c]) {
                        si = pulseGap[c]
                    } else {
                        pi = 0
                        si = (chirpGap[c] * rng.range(0.9f, 1.15f)).toInt()
                        if (--boutLeft[c] <= 0) {
                            // Rest for a while, as real crickets do.
                            boutLeft[c] = 4 + rng.int(24)
                            si += (rng.range(1f, 6f) * fs).toInt()
                        }
                    }
                }
            }
            ph[c] = p
            pos[c] = ps
            silent[c] = si
            pulseIdx[c] = pi
            pulseAmp[c] = pa
        }
    }
}

/** Morning woodland birds: a handful of species, each with its own phrase, answering one another. */
internal class Birds(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)

    private inner class Singer {
        val dur = IntArray(MAX_NOTES)
        val gap = IntArray(MAX_NOTES)
        val f0 = FloatArray(MAX_NOTES)
        val f1 = FloatArray(MAX_NOTES)
        val amp = FloatArray(MAX_NOTES)
        val arc = BooleanArray(MAX_NOTES)
        var notes = 0
        var idx = 0
        var pos = 0
        var wait = 0
        var ph = 0f
        var h2 = 0f
        var h3 = 0f
        var gl = 0f
        var gr = 0f
        var send = 0f
        var vibDepth = 0f
        var vibPh = 0f
        var glide = 0f
        var glideMul = 1f
        var active = false

        fun add(d: Float, g: Float, a: Float, b: Float, v: Float, isArc: Boolean = false) {
            if (notes >= MAX_NOTES) return
            dur[notes] = (d * fs).toInt().coerceAtLeast(8)
            gap[notes] = (g * fs).toInt()
            f0[notes] = a
            f1[notes] = b
            amp[notes] = v
            arc[notes] = isArc
            notes++
        }

        fun place(pan: Float, dist: Float, reverb: Float) {
            gl = panL(pan) * dist
            gr = panR(pan) * dist
            send = reverb
        }

        fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
            val tbl = Sine.table
            var i = 0
            while (i < n && active) {
                if (wait > 0) {
                    val skip = minOf(wait, n - i)
                    wait -= skip
                    i += skip
                    continue
                }
                val d = dur[idx]
                if (pos == 0) {
                    glide = f0[idx]
                    glideMul = (f1[idx] / f0[idx]).pow(1f / d)
                }
                val x = pos.toFloat() / d
                val f = if (arc[idx]) f0[idx] + (f1[idx] - f0[idx]) * tbl[(x * (Sine.SIZE / 2)).toInt() and Sine.MASK]
                else glide
                glide *= glideMul
                val vib = 1f + vibDepth * tbl[vibPh.toInt() and Sine.MASK]
                val env = tbl[(x * (Sine.SIZE / 2)).toInt() and Sine.MASK]
                val p = ph
                val s = (tbl[p.toInt() and Sine.MASK] + h2 * tbl[(p * 2f).toInt() and Sine.MASK] + h3 * tbl[(p * 3f).toInt() and Sine.MASK]) *
                    env * amp[idx]
                l[i] += s * gl
                r[i] += s * gr
                sl[i] += s * gl * send
                sr[i] += s * gr * send
                ph += f * vib * Sine.SIZE / fs
                if (ph >= Sine.SIZE) ph -= Sine.SIZE
                vibPh += 28f * Sine.SIZE / fs
                if (vibPh >= Sine.SIZE) vibPh -= Sine.SIZE
                if (++pos >= d) {
                    pos = 0
                    wait = gap[idx]
                    if (++idx >= notes) active = false
                }
                i++
            }
        }
    }

    private val singers = Array(4) { Singer() }
    private var nextSong = rng.range(0.2f, 1f)
    private val perch = FloatArray(5) { rng.range(-0.85f, 0.85f) }
    private val airL = Pink(Rng(seed * 31 + 1))
    private val airR = Pink(Rng(seed * 31 + 2))
    private val airLpL = Biquad().lowpass(fs, 3500f)
    private val airLpR = Biquad().lowpass(fs, 3500f)
    private val airHpL = Biquad().highpass(fs, 400f)
    private val airHpR = Biquad().highpass(fs, 400f)

    private fun sing(s: Singer) {
        s.notes = 0
        s.idx = 0
        s.pos = 0
        s.wait = 0
        s.vibDepth = 0f
        s.h3 = 0f
        val u = rng.uni()
        val species: Int
        when {
            u < 0.2f -> { // thin, high "tsee tsee"
                species = 0
                s.h2 = 0.05f
                val f = rng.range(6200f, 7600f)
                repeat(2 + rng.int(3)) { s.add(rng.range(0.09f, 0.14f), rng.range(0.05f, 0.08f), f, f * 0.93f, 0.5f) }
            }
            u < 0.4f -> { // fast descending trill
                species = 1
                s.h2 = 0.1f
                val f = rng.range(4800f, 5600f)
                val count = 7 + rng.int(8)
                for (k in 0 until count) {
                    val swell = 0.35f + 0.65f * Sine.of(0.5f * (k + 0.5f) / count)
                    s.add(rng.range(0.045f, 0.06f), rng.range(0.018f, 0.028f), f, f * 0.62f, 0.55f * swell)
                }
            }
            u < 0.7f -> { // mellow fluting whistle
                species = 2
                s.h2 = 0.12f
                s.vibDepth = 0.006f
                var f = rng.range(1700f, 2600f)
                repeat(3 + rng.int(4)) {
                    val to = f * rng.range(0.85f, 1.2f)
                    s.add(rng.range(0.16f, 0.32f), rng.range(0.04f, 0.12f), f, to, 0.7f)
                    f = (to * rng.range(0.8f, 1.3f)).coerceIn(1500f, 3400f)
                }
            }
            u < 0.94f -> { // sparrow-like chirps
                species = 3
                s.h2 = 0.25f
                s.h3 = 0.08f
                repeat(2 + rng.int(5)) {
                    val f = rng.range(3200f, 4200f)
                    s.add(rng.range(0.055f, 0.09f), rng.range(0.06f, 0.2f), f, f * rng.range(1.35f, 1.6f), 0.5f, isArc = true)
                }
            }
            else -> { // a cuckoo, far away across the valley
                species = 4
                s.h2 = 0.3f
                s.h3 = 0.12f
                repeat(2 + rng.int(2)) {
                    s.add(0.15f, 0.18f, 668f, 660f, 0.9f)
                    s.add(0.25f, 0.62f, 532f, 522f, 0.8f)
                }
            }
        }
        if (species == 4) s.place(perch[species], 0.2f, 0.6f)
        else s.place(perch[species] + rng.range(-0.12f, 0.12f), rng.range(0.35f, 1f), 0.45f)
        s.active = true
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        nextSong -= n.toFloat() / fs
        if (nextSong <= 0f) {
            nextSong = rng.range(0.5f, 3.2f)
            for (s in singers) {
                if (!s.active) {
                    sing(s)
                    break
                }
            }
        }
        for (s in singers) if (s.active) s.render(l, r, sl, sr, n)
        for (i in 0 until n) {
            l[i] += airHpL.process(airLpL.process(airL.next())) * 0.02f
            r[i] += airHpR.process(airLpR.process(airR.next())) * 0.02f
        }
    }

    private companion object {
        const val MAX_NOTES = 20
    }
}

/** Tree frogs in a paddy on a wet night: short rasping notes called in runs, from all around. */
internal class Frogs(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val count = 7
    // The phase runs at half the dominant pitch so every partial is a whole multiple of it.
    private val carrier = FloatArray(count) { rng.range(825f, 1125f) * Sine.SIZE / fs }
    private val rasp = FloatArray(count) { rng.range(140f, 195f) * Sine.SIZE / fs }
    private val noteLen = IntArray(count) { (rng.range(0.10f, 0.16f) * fs).toInt() }
    private val noteGap = IntArray(count) { (rng.range(0.09f, 0.16f) * fs).toInt() }
    private val gl = FloatArray(count)
    private val gr = FloatArray(count)
    private val ph = FloatArray(count)
    private val rp = FloatArray(count)
    private val pos = IntArray(count)
    private val silent = IntArray(count) { (rng.range(0f, 3f) * fs).toInt() }
    private val notesLeft = IntArray(count) { 4 + rng.int(9) }

    init {
        for (c in 0 until count) {
            val pan = rng.range(-0.9f, 0.9f)
            val dist = rng.range(0.2f, 1f)
            gl[c] = panL(pan) * dist
            gr[c] = panR(pan) * dist
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val tbl = Sine.table
        for (c in 0 until count) {
            var p = ph[c]
            var q = rp[c]
            var ps = pos[c]
            var si = silent[c]
            val ic = carrier[c]
            val rc = rasp[c]
            val len = noteLen[c]
            val a = gl[c]
            val b = gr[c]
            for (i in 0 until n) {
                if (si > 0) {
                    si--
                    continue
                }
                val x = ps.toFloat() / len
                // Quick attack, slower fall; pitch sags slightly through the note.
                val env = if (x < 0.12f) x / 0.12f else 1f - (x - 0.12f) / 0.88f
                val pulse = 0.5f - 0.5f * tbl[(q + Sine.SIZE / 4).toInt() and Sine.MASK]
                val car = 0.2f * tbl[p.toInt() and Sine.MASK] + tbl[(p * 2f).toInt() and Sine.MASK] + 0.45f * tbl[(p * 4f).toInt() and Sine.MASK]
                val s = car * pulse * pulse * env * 0.6f
                l[i] += s * a
                r[i] += s * b
                sl[i] += s * a * 0.18f
                sr[i] += s * b * 0.18f
                p += ic * (1f - 0.05f * x)
                if (p >= Sine.SIZE) p -= Sine.SIZE
                q += rc
                if (q >= Sine.SIZE) q -= Sine.SIZE
                if (++ps >= len) {
                    ps = 0
                    q = 0f
                    si = (noteGap[c] * rng.range(0.9f, 1.15f)).toInt()
                    if (--notesLeft[c] <= 0) {
                        notesLeft[c] = 4 + rng.int(10)
                        si += (rng.range(0.8f, 6f) * fs).toInt()
                    }
                }
            }
            ph[c] = p
            rp[c] = q
            pos[c] = ps
            silent[c] = si
        }
    }
}

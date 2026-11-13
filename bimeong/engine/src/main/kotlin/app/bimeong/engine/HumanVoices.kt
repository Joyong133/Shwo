package app.bimeong.engine

import kotlin.math.exp
import kotlin.math.pow

/*
 * Sounds people make. None of these are recordings and none say actual words:
 * a buzzing source or plain noise is shaped by vowel resonances, the way a throat and mouth shape breath.
 */

/** Someone humming a slow lullaby, close by, making it up as they go. */
internal class Hum(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val beat = rng.range(0.8f, 0.92f)
    private val tune = Melody(Rng(seed * 31 + 1), if (rng.chance(0.5f)) 220f else 196f, beat, range = 7)
    private val chest = Biquad().lowpass(fs, 1100f)
    private val nose1 = Biquad().bandpass(fs, 1050f, 5f)
    private val nose2 = Biquad().bandpass(fs, 2300f, 6f)
    private val breathBand = Biquad().bandpass(fs, 1300f, 1f)
    private val waver = Flutter(rng, fs, 9f)
    private val glideK = 1f - exp(-1f / (0.055f * fs))
    private val attackK = 1f - exp(-1f / (0.07f * fs))
    private val releaseK = 1f - exp(-1f / (0.18f * fs))
    private var ph = 0f
    private var vibPh = 0f
    private var cur = 220f
    private var target = 220f
    private var left = (0.4f * fs).toInt()
    private var singing = false
    private var amp = 0f
    private var noteT = 0f
    private var breathPos = 0
    private var breathLen = 0

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val tbl = Glottal.soft
        val dt = 1f / fs
        for (i in 0 until n) {
            if (--left <= 0) {
                tune.next()
                left = (tune.seconds * fs).toInt()
                if (tune.rest) {
                    singing = false
                    // Take a breath in the gap between phrases.
                    breathLen = (minOf(tune.seconds * 0.6f, 0.6f) * fs).toInt()
                    breathPos = -(tune.seconds * 0.3f * fs).toInt()
                } else {
                    if (!singing) cur = tune.freq
                    target = tune.freq
                    singing = true
                    noteT = 0f
                    amp *= 0.8f
                }
            }
            cur += (target - cur) * glideK
            amp += ((if (singing) 1f else 0f) - amp) * (if (singing) attackK else releaseK)
            noteT += dt
            // Vibrato creeps in once a note has been held for a moment.
            val vib = 0.007f * ((noteT - 0.25f) / 0.4f).coerceIn(0f, 1f)
            vibPh += 5.3f * dt
            if (vibPh >= 1f) vibPh -= 1f
            ph += cur * (1f + vib * Sine.of(vibPh) + 0.003f * (waver.next() * 2f - 1f)) * Glottal.SIZE * dt
            if (ph >= Glottal.SIZE) ph -= Glottal.SIZE
            val src = tbl[ph.toInt() and Glottal.MASK]
            var y = (chest.process(src) + nose1.process(src) * 0.4f + nose2.process(src) * 0.15f) * amp * 0.5f
            val send = y * 0.35f
            if (breathPos < breathLen) {
                if (breathPos >= 0) {
                    y += breathBand.process(rng.bi()) * Sine.of(0.5f * breathPos / breathLen) * 0.035f
                }
                breathPos++
            }
            l[i] += y
            r[i] += y
            sl[i] += send
            sr[i] += send
        }
    }
}

/** Someone whistling an easy tune to themselves, a little way off. */
internal class Whistle(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val tune = Melody(Rng(seed * 31 + 1), 880f, rng.range(0.46f, 0.56f), range = 7)
    private val air = Svf()
    private val glideK = 1f - exp(-1f / (0.025f * fs))
    private val attackK = 1f - exp(-1f / (0.03f * fs))
    private val releaseK = 1f - exp(-1f / (0.05f * fs))
    private val gl = panL(0.15f)
    private val gr = panR(0.15f)
    private var ph = 0f
    private var vibPh = 0f
    private var cur = 880f
    private var target = 880f
    private var left = (0.5f * fs).toInt()
    private var total = 1
    private var sounding = false
    private var amp = 0f
    private var noteT = 0f
    private var tick = 0

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val tbl = Sine.table
        val dt = 1f / fs
        for (i in 0 until n) {
            if (--left <= 0) {
                tune.next()
                left = (tune.seconds * fs).toInt()
                total = left
                sounding = !tune.rest
                if (sounding) {
                    target = tune.freq
                    noteT = 0f
                }
            }
            // Each note is let go a little early, so they do not smear together.
            val on = sounding && left > total * 0.12f
            cur += (target - cur) * glideK
            amp += ((if (on) 1f else 0f) - amp) * (if (on) attackK else releaseK)
            noteT += dt
            val vib = 0.008f * ((noteT - 0.2f) / 0.3f).coerceIn(0f, 1f)
            vibPh += 5.6f * dt
            if (vibPh >= 1f) vibPh -= 1f
            ph += cur * (1f + vib * Sine.of(vibPh)) * Sine.SIZE * dt
            if (ph >= Sine.SIZE) ph -= Sine.SIZE
            if (tick++ and 31 == 0) air.set(fs, cur, 10f)
            val w = rng.bi()
            air.process(w)
            val s = (tbl[ph.toInt() and Sine.MASK] + 0.03f * tbl[(ph * 2f).toInt() and Sine.MASK] + air.bp * 0.02f + w * 0.006f) * amp * 0.4f
            l[i] += s * gl
            r[i] += s * gr
            sl[i] += s * gl * 0.3f
            sr[i] += s * gr * 0.3f
        }
    }
}

/** The long, patient "shhh… shhh…" used to settle a baby. */
internal class Shush(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val side = Rng(seed * 31 + 1)
    private val lowL = Svf()
    private val lowR = Svf()
    private val highL = Svf()
    private val highR = Svf()
    private var t = 0f
    private var len = 1.3f
    private var pause = 0.3f
    private var quick = 0
    private var count = 0
    private var amp = 0f
    private var strength = 1f

    private fun begin() {
        t = 0f
        count++
        if (quick > 0) {
            quick--
            len = rng.range(0.28f, 0.36f)
            pause = if (quick == 0) rng.range(0.5f, 0.8f) else rng.range(0.08f, 0.14f)
        } else if (count % 5 == 0) {
            // Every so often, three short ones in a row.
            quick = 2
            len = rng.range(0.28f, 0.36f)
            pause = rng.range(0.08f, 0.14f)
        } else {
            len = rng.range(1f, 1.6f)
            pause = rng.range(0.45f, 0.75f)
        }
        val k = rng.range(0.92f, 1.08f)
        lowL.set(fs, 2600f * k, 2.5f)
        lowR.set(fs, 2700f * k, 2.5f)
        highL.set(fs, 5200f * k, 2f)
        highR.set(fs, 5000f * k, 2f)
        strength = rng.range(0.75f, 1f)
    }

    init {
        begin()
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        t += dt
        if (t >= len + pause) begin()
        val target = if (t < len) {
            // Quick to start, sagging a little as the breath runs out, soft at the end.
            val rise = (t / 0.12f).coerceAtMost(1f)
            val fall = ((len - t) / 0.25f).coerceIn(0f, 1f)
            rise * fall * (1f - 0.25f * t / len) * strength
        } else {
            0f
        }
        val a0 = amp
        val da = (target - a0) / n
        if (a0 > 1e-4f || target > 1e-4f) {
            for (i in 0 until n) {
                val a = (a0 + da * i) * 0.3f
                val c = rng.bi()
                val x = c * 0.7f + side.bi() * 0.3f
                val y = c * 0.7f - side.bi() * 0.3f
                lowL.process(x); highL.process(x)
                lowR.process(y); highR.process(y)
                l[i] += (lowL.bp / 2.5f + highL.bp * 0.6f / 2f) * a
                r[i] += (lowR.bp / 2.5f + highR.bp * 0.6f / 2f) * a
            }
        }
        amp = target
    }
}

/** Someone fast asleep beside you: slow, even breathing. */
internal class Breath(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val pink = Pink(Rng(seed * 31 + 1))
    private val body = Svf()
    private val edge = Svf()
    private val flutter = Flutter(rng, fs, 18f)

    // 0 = in, 1 = hold, 2 = out, 3 = rest
    private var stage = 3
    private var t = 0f
    private var len = 0.6f
    private var amp = 0f
    private var edgeLevel = 0.3f

    private fun advance() {
        stage = (stage + 1) % 4
        t = 0f
        when (stage) {
            0 -> {
                len = rng.range(1.6f, 2f)
                body.set(fs, rng.range(1450f, 1750f), 1.4f)
                edge.set(fs, 3200f, 2f)
                edgeLevel = 0.3f
            }
            1 -> len = rng.range(0.15f, 0.3f)
            2 -> {
                len = rng.range(2.2f, 2.8f)
                body.set(fs, rng.range(620f, 780f), 1.1f)
                edge.set(fs, 1800f, 1.5f)
                edgeLevel = 0.2f
            }
            else -> len = rng.range(0.8f, 1.4f)
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        t += n.toFloat() / fs
        if (t >= len) advance()
        val x = (t / len).coerceAtMost(1f)
        val target = when (stage) {
            0 -> Sine.of(0.5f * x).pow(1.2f)
            2 -> Sine.of(0.5f * x.pow(0.7f)).pow(1.2f) * 0.7f
            else -> 0f
        }
        val a0 = amp
        val da = (target - a0) / n
        if (a0 > 1e-4f || target > 1e-4f) {
            for (i in 0 until n) {
                val w = pink.next()
                body.process(w)
                edge.process(w)
                val s = (body.bp / 1.3f + edge.bp * edgeLevel) * (a0 + da * i) * (0.85f + 0.15f * flutter.next()) * 0.35f
                l[i] += s
                r[i] += s
            }
        }
        amp = target
    }
}

/** A wordless choir holding long chords, drifting between "ah" and "oo". */
internal class Choir(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val chords = arrayOf(
        intArrayOf(48, 55, 64, 72), intArrayOf(45, 57, 64, 72), intArrayOf(41, 57, 65, 72),
        intArrayOf(43, 55, 62, 71), intArrayOf(40, 55, 64, 71), intArrayOf(38, 57, 65, 69),
    )
    private val paths = arrayOf(intArrayOf(0, 1, 2, 3), intArrayOf(0, 4, 2, 0), intArrayOf(1, 2, 0, 3), intArrayOf(0, 2, 5, 3))
    private val voices = 8
    private val ph = FloatArray(voices)
    private val cur = FloatArray(voices)
    private val target = FloatArray(voices)
    private val detune = FloatArray(voices) { 2f.pow(rng.range(-6f, 6f) / 1200f) }
    private val vibPh = FloatArray(voices) { rng.uni() }
    private val vibRate = FloatArray(voices) { rng.range(4.8f, 5.8f) }
    private val vibDepth = FloatArray(voices) { rng.range(0.004f, 0.008f) }
    private val swell = Array(voices) { Wander(rng, 7f, 23f) }
    private val level = FloatArray(voices) { 0.7f }
    private val mouthL = Formants(fs, 3)
    private val mouthR = Formants(fs, 3)
    private val warmL = OnePole().set(fs, 500f)
    private val warmR = OnePole().set(fs, 500f)
    private val vowel = Wander(rng, 9f, 30f)
    private val glideK = 1f - exp(-1f / (0.6f * fs))
    private var path = paths[rng.int(paths.size)]
    private var step = 0
    private var chordLeft = 0f
    private var fade = 0f

    private fun pitch(note: Int): Float = 440f * 2f.pow((note - 69) / 12f)

    private fun nextChord() {
        if (step >= path.size) {
            step = 0
            path = paths[rng.int(paths.size)]
        }
        val chord = chords[path[step++]]
        for (v in 0 until voices) target[v] = pitch(chord[v / 2]) * detune[v]
        chordLeft = rng.range(9f, 13f)
    }

    init {
        nextChord()
        for (v in 0 until voices) cur[v] = target[v]
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        chordLeft -= dt
        if (chordLeft <= 0f) nextChord()
        for (v in 0 until voices) level[v] = 0.55f + 0.45f * swell[v].advance(dt)
        // Slide the mouth shape between "ah" and "oo".
        val u = vowel.advance(dt)
        val f1 = 800f + (330f - 800f) * u
        val f2 = 1250f + (760f - 1250f) * u
        val f3 = 2600f + (2500f - 2600f) * u
        mouthL.set(0, f1, 5f, 1f); mouthL.set(1, f2, 8f, 0.7f); mouthL.set(2, f3, 10f, 0.4f)
        mouthR.set(0, f1 * 1.03f, 5f, 1f); mouthR.set(1, f2 * 1.03f, 8f, 0.7f); mouthR.set(2, f3 * 1.03f, 10f, 0.4f)
        val f0 = fade
        val f1e = minOf(1f, fade + dt / 3f)
        val df = (f1e - f0) / n
        val inv = Glottal.SIZE.toFloat() / fs
        for (i in 0 until n) {
            var a = 0f
            var b = 0f
            for (v in 0 until voices) {
                cur[v] += (target[v] - cur[v]) * glideK
                var vp = vibPh[v] + vibRate[v] / fs
                if (vp >= 1f) vp -= 1f
                vibPh[v] = vp
                var p = ph[v] + cur[v] * (1f + vibDepth[v] * Sine.of(vp)) * inv
                if (p >= Glottal.SIZE) p -= Glottal.SIZE
                ph[v] = p
                // Low voices get the fuller tone, high ones the softer, so the top never turns harsh.
                val s = (if (v < 4) Glottal.full else Glottal.soft)[p.toInt() and Glottal.MASK] * level[v]
                if (v and 1 == 0) { a += s; b += s * 0.3f } else { b += s; a += s * 0.3f }
            }
            val g = (f0 + df * i) * 0.22f
            val yl = (mouthL.process(a) + warmL.lp(a) * 0.3f) * g
            val yr = (mouthR.process(b) + warmR.lp(b) * 0.3f) * g
            l[i] += yl
            r[i] += yr
            sl[i] += yl * 0.5f
            sr[i] += yr * 0.5f
        }
        fade = f1e
    }
}

/** Monks chanting a long, low "Om": the vowel opens, closes into a hum, and after a breath begins again. */
internal class Om(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val base = rng.range(104f, 118f)
    private val pitch = floatArrayOf(base, base * 1.004f, base * 1.5f)
    private val level = floatArrayOf(1f, 0.8f, 0.4f)
    private val gl = floatArrayOf(panL(-0.3f), panL(0.3f), panL(0f))
    private val gr = floatArrayOf(panR(-0.3f), panR(0.3f), panR(0f))
    private val ph = FloatArray(3)
    private val vibPh = FloatArray(3) { rng.uni() }
    private val mouthL = Formants(fs, 3)
    private val mouthR = Formants(fs, 3)
    private val warmL = OnePole().set(fs, 350f)
    private val warmR = OnePole().set(fs, 350f)
    private val breathBand = Biquad().bandpass(fs, 1200f, 1f)
    private var t = 0f
    private var len = 10f
    private var rest = 3f
    private var amp = 0f

    init {
        // Start partway through the breath so the chant begins almost at once.
        t = len + rest - 0.6f
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        t += dt
        if (t >= len + rest) {
            t = 0f
            len = rng.range(9f, 12f)
            rest = rng.range(2.5f, 3.5f)
        }
        val x = (t / len).coerceAtMost(1f)
        // "O" for the first half, then the lips close on "m".
        val m = smoothstep((x - 0.5f) / 0.25f)
        val f1 = 460f + (250f - 460f) * m
        val f2 = 820f + (1000f - 820f) * m
        mouthL.set(0, f1, 5f, 1f); mouthL.set(1, f2, 7f, 0.6f - 0.5f * m); mouthL.set(2, 2500f, 9f, 0.2f - 0.17f * m)
        mouthR.set(0, f1 * 1.02f, 5f, 1f); mouthR.set(1, f2 * 1.02f, 7f, 0.6f - 0.5f * m); mouthR.set(2, 2550f, 9f, 0.2f - 0.17f * m)
        val chanting = t < len
        val target = if (chanting) (t / 0.8f).coerceAtMost(1f) * ((len - t) / 1.5f).coerceIn(0f, 1f) else 0f
        val a0 = amp
        val da = (target - a0) / n
        val inv = Glottal.SIZE.toFloat() / fs
        val tbl = Glottal.full
        // A quiet breath in the middle of the pause.
        val br = if (!chanting) Sine.of(0.5f * ((t - len) / rest)) * 0.02f else 0f
        for (i in 0 until n) {
            var a = 0f
            var b = 0f
            for (v in 0 until 3) {
                var vp = vibPh[v] + 4.6f / fs
                if (vp >= 1f) vp -= 1f
                vibPh[v] = vp
                var p = ph[v] + pitch[v] * (1f + 0.004f * Sine.of(vp)) * inv
                if (p >= Glottal.SIZE) p -= Glottal.SIZE
                ph[v] = p
                val s = tbl[p.toInt() and Glottal.MASK] * level[v]
                a += s * gl[v]
                b += s * gr[v]
            }
            val g = (a0 + da * i) * 0.35f
            val breath = if (br > 0f) breathBand.process(rng.bi()) * br else 0f
            val yl = (mouthL.process(a) + warmL.lp(a) * 0.5f) * g + breath
            val yr = (mouthR.process(b) + warmR.lp(b) * 0.5f) * g + breath
            l[i] += yl
            r[i] += yr
            sl[i] += yl * 0.45f
            sr[i] += yr * 0.45f
        }
        amp = target
    }
}

/**
 * Soft, close whispering by one ear and then the other. It has the rhythm and colour of speech
 * but says nothing: breath noise passed through a mouth that keeps changing shape.
 */
internal class Whisper(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val mouth = Formants(fs, 3)
    private val teeth = Svf()
    private val breathBand = Biquad().bandpass(fs, 1500f, 1f)
    private val thin = Biquad().highpass(fs, 320f)
    private var f1 = 500f
    private var f2 = 1500f
    private var f3 = 2600f
    private var t1 = 500f
    private var t2 = 1500f
    private var t3 = 2600f

    // 0 = pause between phrases, 1 = consonant, 2 = vowel, 3 = gap between syllables
    private var stage = 0
    private var left = 0.5f
    private var syllables = 0
    private var vowelAmp = 0f
    private var vowelTarget = 0f
    private var hissAmp = 0f
    private var hissTarget = 0f
    private var hissFast = false
    private var side = if (rng.chance(0.5f)) -1f else 1f
    private var pan = 0f
    private var gl = 0.7f
    private var gr = 0.7f
    private var breathT = -1f
    private var soft = 1f

    private fun pickVowel() {
        val v = rng.int(Vowels.COUNT)
        // Whispered vowels sit a little higher than spoken ones.
        t1 = Vowels.f1[v] * rng.range(1.05f, 1.2f)
        t2 = Vowels.f2[v] * rng.range(0.97f, 1.08f)
        t3 = Vowels.f3[v] * rng.range(0.97f, 1.05f)
    }

    private fun nextSyllable() {
        pickVowel()
        val u = rng.uni()
        hissFast = false
        when {
            u < 0.22f -> { teeth.set(fs, rng.range(6000f, 7200f), 2f); hissTarget = 0.5f; left = rng.range(0.07f, 0.11f) }      // s
            u < 0.36f -> { teeth.set(fs, rng.range(2900f, 3500f), 2f); hissTarget = 0.5f; left = rng.range(0.07f, 0.10f) }      // sh
            u < 0.52f -> { teeth.set(fs, rng.range(4400f, 5200f), 1.5f); hissTarget = 0.8f; left = 0.018f; hissFast = true }    // t
            u < 0.66f -> { teeth.set(fs, rng.range(1800f, 2300f), 2f); hissTarget = 0.7f; left = 0.025f; hissFast = true }      // k
            u < 0.76f -> { teeth.set(fs, rng.range(600f, 800f), 1f); hissTarget = 0.6f; left = 0.015f; hissFast = true }        // p
            u < 0.84f -> { teeth.set(fs, rng.range(3500f, 4100f), 1.5f); hissTarget = 0.6f; left = rng.range(0.04f, 0.06f) }    // ch
            else -> { hissTarget = 0f; left = 0.01f }                                                                         // straight into the vowel
        }
        stage = 1
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        val dt = n.toFloat() / fs
        left -= dt
        if (left <= 0f) {
            when (stage) {
                0 -> { // a new phrase, usually by the other ear
                    syllables = 3 + rng.int(8)
                    if (rng.chance(0.7f)) side = -side
                    pan = side * rng.range(0.55f, 0.85f)
                    gl = panL(pan)
                    gr = panR(pan)
                    soft = rng.range(0.7f, 1f)
                    nextSyllable()
                }
                1 -> {
                    hissTarget = 0f
                    vowelTarget = rng.range(0.7f, 1f)
                    left = rng.range(0.08f, 0.17f)
                    stage = 2
                }
                2 -> {
                    vowelTarget = 0f
                    left = rng.range(0.02f, 0.06f)
                    stage = 3
                }
                else -> {
                    if (--syllables > 0) nextSyllable() else {
                        stage = 0
                        left = rng.range(0.5f, 1.6f)
                        breathT = 0f
                    }
                }
            }
        }
        // The mouth moves smoothly from one shape to the next.
        val k = 1f - exp(-dt / 0.025f)
        f1 += (t1 - f1) * k
        f2 += (t2 - f2) * k
        f3 += (t3 - f3) * k
        mouth.set(0, f1, 6f, 1f)
        mouth.set(1, f2, 8f, 0.7f)
        mouth.set(2, f3, 9f, 0.35f)
        val vk = 1f - exp(-dt / (if (vowelTarget > vowelAmp) 0.02f else 0.04f))
        val hk = 1f - exp(-dt / (if (hissFast) 0.004f else 0.02f))
        val v0 = vowelAmp
        val h0 = hissAmp
        val v1 = v0 + (vowelTarget - v0) * vk
        val h1 = h0 + (hissTarget - h0) * hk
        val dv = (v1 - v0) / n
        val dh = (h1 - h0) / n
        var breath = 0f
        if (breathT >= 0f) {
            // Drawing breath before the next phrase.
            breathT += dt
            breath = if (breathT < 0.35f) Sine.of(0.5f * breathT / 0.35f) * 0.04f else 0f
            if (breathT >= 0.35f) breathT = -1f
        }
        val g = soft * 0.5f
        for (i in 0 until n) {
            val w = rng.bi()
            teeth.process(w)
            var s = (mouth.process(w) * 1.6f + w * 0.02f) * (v0 + dv * i) + teeth.bp * 0.35f * (h0 + dh * i)
            if (breath > 0f) s += breathBand.process(w) * breath
            // A whisper has no chest in it at all.
            s = thin.process(s) * g
            l[i] += s * gl
            r[i] += s * gr
        }
        vowelAmp = v1
        hissAmp = h1
    }
}

/** Little mouth sounds repeated close to the microphone: "tk tk tk", "sk sk", "ch ch", soft lip pops. */
internal class MouthSounds(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)
    private val hits = NoiseGrains(fs, seed * 31 + 3, 48)
    private var next = 0.5f
    private var kind = 0
    private var repeatsLeft = 0
    private var side = -1f
    private var pan = 0f
    private var pace = 0.3f

    private fun t(off: Int, a: Float) = hits.spawn(off, rng.range(4500f, 6500f), 2f, 0.012f, a * 0.5f, pan)
    private fun k(off: Int, a: Float) = hits.spawn(off, rng.range(1600f, 2600f), 2.5f, 0.018f, a * 0.5f, pan)
    private fun s(off: Int, a: Float) = hits.spawn(off, rng.range(6000f, 8000f), 1.2f, 0.09f, a * 0.3f, pan, attackMs = 15f)
    private fun ch(off: Int, a: Float) = hits.spawn(off, rng.range(2600f, 4000f), 1.2f, 0.07f, a * 0.35f, pan, attackMs = 3f)

    private fun pop(off: Int, a: Float) {
        hits.spawn(off, rng.range(250f, 500f), 2f, 0.025f, a * 0.5f, pan)
        hits.spawn(off, rng.range(1100f, 1500f), 2f, 0.01f, a * 0.25f, pan)
    }

    private fun say() {
        val a = rng.range(0.7f, 1f)
        when (kind) {
            0 -> { t(0, a); k((0.055f * fs).toInt(), a) }                      // tk
            1 -> { s(0, a); k((0.09f * fs).toInt(), a) }                       // sk
            2 -> ch(0, a)                                                       // ch
            3 -> pop(0, a)                                                      // lip pop
            4 -> { t(0, a); k((0.06f * fs).toInt(), a * 0.9f); t((0.12f * fs).toInt(), a * 0.8f); k((0.18f * fs).toInt(), a * 0.8f) } // tiko-tiko
            else -> { s(0, a * 0.8f); t((0.1f * fs).toInt(), a) }              // st
        }
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        next -= n.toFloat() / fs
        if (next <= 0f) {
            if (repeatsLeft <= 0) {
                kind = rng.int(6)
                repeatsLeft = 3 + rng.int(6)
                side = -side
                pan = side * rng.range(0.5f, 0.85f)
                pace = when (kind) {
                    1, 5 -> rng.range(0.34f, 0.42f)
                    4 -> rng.range(0.42f, 0.5f)
                    else -> rng.range(0.24f, 0.32f)
                }
            }
            say()
            repeatsLeft--
            next = pace * rng.range(0.94f, 1.06f) + if (repeatsLeft <= 0) rng.range(0.5f, 1.4f) else 0f
        }
        hits.render(l, r, n)
    }
}

/**
 * A busy café: a handful of nearby conversations you cannot quite follow, the wash of everyone else,
 * cups meeting saucers, and the espresso machine steaming milk now and then.
 */
internal class Cafe(fs: Int, seed: Long) : Voice(fs) {
    private val rng = Rng(seed)

    private inner class Talker(seed: Long) {
        val r = Rng(seed)
        val mouth = Formants(fs, 3)
        val base = if (r.chance(0.5f)) r.range(95f, 135f) else r.range(175f, 235f)
        val gl: Float
        val gr: Float
        var ph = 0f
        var pitch = base
        var pitchTarget = base
        var f1 = 500f; var f2 = 1500f; var f3 = 2500f
        var t1 = 500f; var t2 = 1500f; var t3 = 2500f
        var amp = 0f
        var ampTarget = 0f
        var voiced = true
        var syllableLeft = 0f
        var phraseLeft = 0f
        var pauseLeft = r.range(0f, 3f)

        init {
            val pan = r.range(-0.9f, 0.9f)
            val dist = r.range(0.35f, 1f)
            gl = panL(pan) * dist
            gr = panR(pan) * dist
        }

        fun control(dt: Float) {
            if (pauseLeft > 0f) {
                pauseLeft -= dt
                ampTarget = 0f
                if (pauseLeft <= 0f) phraseLeft = r.range(1.2f, 4.5f)
            } else {
                phraseLeft -= dt
                syllableLeft -= dt
                if (syllableLeft <= 0f) {
                    syllableLeft = r.range(0.12f, 0.24f)
                    val v = r.int(Vowels.COUNT)
                    val k = if (base > 150f) 1.12f else 1f
                    t1 = Vowels.f1[v] * k
                    t2 = Vowels.f2[v] * k
                    t3 = Vowels.f3[v] * k
                    voiced = r.chance(0.85f)
                    // Speech melody: up and down around the speaker's own pitch, sinking toward the end of a phrase.
                    pitchTarget = base * r.range(0.85f, 1.3f) * (0.9f + 0.1f * (phraseLeft / 4.5f).coerceIn(0f, 1f))
                    ampTarget = r.range(0.6f, 1f)
                    amp *= 0.35f
                }
                if (phraseLeft <= 0f) pauseLeft = r.range(0.5f, 3.5f)
            }
            val k = 1f - exp(-dt / 0.03f)
            f1 += (t1 - f1) * k
            f2 += (t2 - f2) * k
            f3 += (t3 - f3) * k
            pitch += (pitchTarget - pitch) * k
            amp += (ampTarget - amp) * (1f - exp(-dt / 0.02f))
            mouth.set(0, f1, 5f, 1f)
            mouth.set(1, f2, 7f, 0.6f)
            mouth.set(2, f3, 8f, 0.25f)
        }
    }

    private val talkers = Array(6) { Talker(seed * 31 + 20 + it) }
    private val farL = Biquad().lowpass(fs, 3200f)
    private val farR = Biquad().lowpass(fs, 3200f)
    private val pinkL = Pink(Rng(seed * 31 + 1))
    private val pinkR = Pink(Rng(seed * 31 + 2))
    private val crowdL = Biquad().bandpass(fs, 480f, 0.6f)
    private val crowdR = Biquad().bandpass(fs, 520f, 0.6f)
    private val crowdSwellL = Flutter(Rng(seed * 31 + 3), 750, 1.2f)
    private val crowdSwellR = Flutter(Rng(seed * 31 + 4), 750, 1.2f)
    private val china = GrainPool(fs, 32)
    private val knocks = NoiseGrains(fs, seed * 31 + 5, 8)
    private var nextClink = rng.range(1f, 4f)
    private val steamHp = Biquad().highpass(fs, 3000f)
    private val steamBand = Biquad().bandpass(fs, 5200f, 1f)
    private val steamGurgle = Flutter(rng, fs, 14f)
    private val steamGl = panL(0.6f)
    private val steamGr = panR(0.6f)
    private var nextSteam = rng.range(15f, 40f)
    private var steamT = -1f
    private var steamLen = 5f
    private var tl = FloatArray(0)
    private var tr = FloatArray(0)

    private fun clink(off: Int) {
        val f = rng.logRange(2000f, 3600f)
        val a = rng.range(0.03f, 0.09f)
        val pan = rng.range(-0.8f, 0.8f)
        china.spawn(off, f, 0.12f, a, pan)
        china.spawn(off, f * 1.52f, 0.08f, a * 0.6f, pan)
        china.spawn(off, f * 2.3f, 0.05f, a * 0.4f, pan)
        knocks.spawn(off, 400f, 2f, 0.03f, a * 0.8f, pan)
    }

    override fun render(l: FloatArray, r: FloatArray, sl: FloatArray, sr: FloatArray, n: Int) {
        if (tl.size < n) {
            tl = FloatArray(n)
            tr = FloatArray(n)
        } else {
            java.util.Arrays.fill(tl, 0, n, 0f)
            java.util.Arrays.fill(tr, 0, n, 0f)
        }
        val dt = n.toFloat() / fs
        val inv = Glottal.SIZE.toFloat() / fs
        val tbl = Glottal.full
        for (t in talkers) {
            t.control(dt)
            if (t.amp < 1e-3f && t.ampTarget == 0f) continue
            val inc = t.pitch * inv
            var p = t.ph
            for (i in 0 until n) {
                p += inc
                if (p >= Glottal.SIZE) p -= Glottal.SIZE
                val src = if (t.voiced) tbl[p.toInt() and Glottal.MASK] else t.r.bi() * 0.4f
                val s = t.mouth.process(src) * t.amp * 0.5f
                tl[i] += s * t.gl
                tr[i] += s * t.gr
            }
            t.ph = p
        }

        nextClink -= dt
        if (nextClink <= 0f) {
            nextClink = rng.expo(5f).coerceIn(0.8f, 16f)
            clink(0)
            if (rng.chance(0.5f)) clink((rng.range(0.09f, 0.16f) * fs).toInt())
        }
        nextSteam -= dt
        if (nextSteam <= 0f && steamT < 0f) {
            nextSteam = rng.range(45f, 90f)
            steamT = 0f
            steamLen = rng.range(4f, 8f)
        }
        var steam = 0f
        if (steamT >= 0f) {
            steamT += dt
            steam = (steamT / 0.3f).coerceAtMost(1f) * ((steamLen - steamT) / 0.5f).coerceIn(0f, 1f) * 0.05f
            if (steamT >= steamLen) steamT = -1f
        }

        val cl = 0.5f + 0.5f * crowdSwellL.next()
        val cr = 0.5f + 0.5f * crowdSwellR.next()
        for (i in 0 until n) {
            // Across a room the consonants are lost and only the vowels carry.
            var a = farL.process(tl[i]) + crowdL.process(pinkL.next()) * 0.3f * cl
            var b = farR.process(tr[i]) + crowdR.process(pinkR.next()) * 0.3f * cr
            if (steam > 0f) {
                val w = rng.bi()
                val s = (steamHp.process(w) * 0.5f + steamBand.process(w)) * steam * (0.7f + 0.3f * steamGurgle.next())
                a += s * steamGl
                b += s * steamGr
            }
            l[i] += a
            r[i] += b
            sl[i] += a * 0.35f
            sr[i] += b * 0.35f
        }
        china.render(l, r, n)
        knocks.render(l, r, n)
    }
}

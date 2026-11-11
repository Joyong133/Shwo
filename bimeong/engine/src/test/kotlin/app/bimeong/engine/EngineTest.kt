package app.bimeong.engine

import kotlin.math.abs
import kotlin.math.sqrt
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class EngineTest {
    private val fs = 48000

    private fun rms(x: FloatArray, from: Int = 0, to: Int = x.size): Float {
        var s = 0.0
        for (i in from until to) s += x[i] * x[i]
        return sqrt(s / (to - from)).toFloat()
    }

    @Test
    fun everySoundIsAudibleFiniteAndWithinRange() {
        for ((index, def) in Catalog.sounds.withIndex()) {
            // Long enough to contain an event of even the sparsest sounds (thunder, bowl).
            val (l, r) = renderSolo(index, seconds = 12f, fs = fs)
            assertTrue("${def.id} produced NaN or infinity", l.all { it.isFinite() } && r.all { it.isFinite() })
            val peak = maxOf(l.maxOf { abs(it) }, r.maxOf { abs(it) })
            assertTrue("${def.id} is silent", rms(l) > 1e-4f || rms(r) > 1e-4f)
            assertTrue("${def.id} exceeds full scale: $peak", peak <= 1f)
        }
    }

    @Test
    fun soundsDoNotRepeat() {
        // The same second of rain never comes back: compare one second with the one ten seconds later.
        val (l, _) = renderSolo(Catalog.indexOf("rain_steady"), seconds = 12f, fs = fs)
        var dot = 0.0
        var a = 0.0
        var b = 0.0
        for (i in 0 until fs) {
            val x = l[fs + i]
            val y = l[11 * fs + i]
            dot += x * y; a += x * x; b += y * y
        }
        assertTrue("segments are correlated", abs(dot / sqrt(a * b)) < 0.05)
    }

    @Test
    fun emptyMixIsSilent() {
        val mixer = Mixer(fs, 1L)
        val l = FloatArray(fs)
        val r = FloatArray(fs)
        mixer.render(l, r, fs)
        // Not exactly zero: the filters carry an inaudible offset that keeps them out of denormals.
        assertEquals(0f, l.maxOf { abs(it) }, 1e-12f)
        assertEquals(0f, r.maxOf { abs(it) }, 1e-12f)
    }

    @Test
    fun turningASoundOffFadesItOutWithoutAClick() {
        val mixer = Mixer(fs, 2L)
        mixer.master = 1f
        val index = Catalog.indexOf("noise_pink")
        mixer.setLevel(index, 1f)
        val l = FloatArray(fs * 2)
        val r = FloatArray(fs * 2)
        mixer.render(l, r, fs)
        val loud = rms(l, fs / 2, fs)
        mixer.setLevel(index, 0f)
        mixer.render(l, r, fs * 2)
        // Just after switching off it must still be sounding (a fade, not a cut) ...
        assertTrue(rms(l, 0, fs / 100) > loud * 0.5f)
        // ... and two seconds later it is gone.
        assertTrue(rms(l, fs * 3 / 2, fs * 2) < loud * 0.001f)
    }

    @Test
    fun pausingFadesToSilenceAndReportsIt() {
        val mixer = Mixer(fs, 3L)
        mixer.setLevel(Catalog.indexOf("rain_heavy"), 1f)
        val l = FloatArray(fs)
        val r = FloatArray(fs)
        mixer.render(l, r, fs)
        assertFalse(mixer.silent)
        mixer.playing = false
        mixer.render(l, r, fs)
        assertTrue(mixer.silent)
        assertTrue(rms(l, fs * 3 / 4, fs) < 1e-4f)
    }

    @Test
    fun everythingAtOnceNeverClips() {
        val mixer = Mixer(fs, 4L)
        mixer.master = 1f
        for (i in Catalog.sounds.indices) mixer.setLevel(i, 1f)
        val l = FloatArray(fs * 6)
        val r = FloatArray(fs * 6)
        mixer.render(l, r, l.size)
        assertTrue(l.all { it.isFinite() })
        assertTrue(maxOf(l.maxOf { abs(it) }, r.maxOf { abs(it) }) <= 1f)
    }

    @Test
    fun sleepFadeAndWarmthReduceLevel() {
        fun level(configure: (Mixer) -> Unit): Float {
            val mixer = Mixer(fs, 5L)
            mixer.setLevel(Catalog.indexOf("noise_white"), 1f)
            configure(mixer)
            val l = FloatArray(fs * 2)
            val r = FloatArray(fs * 2)
            mixer.render(l, r, l.size)
            return rms(l, fs, fs * 2)
        }
        val normal = level { }
        assertTrue(level { it.fade = 0.25f } < normal * 0.3f)
        assertTrue(level { it.warmth = 1f } < normal * 0.5f)
    }

    @Test
    fun bellRingsOnItsOwn() {
        val mixer = Mixer(fs, 6L)
        mixer.ringBell()
        val l = FloatArray(fs)
        val r = FloatArray(fs)
        mixer.render(l, r, fs)
        assertTrue(rms(l) > 1e-3f)
    }

    @Test
    fun worksAt44100() {
        val (l, _) = renderSolo(Catalog.indexOf("rain_window"), seconds = 3f, fs = 44100)
        assertTrue(l.all { it.isFinite() } && rms(l) > 1e-3f)
    }

    @Test
    fun catalogIdsAreUnique() {
        assertEquals(Catalog.sounds.size, Catalog.sounds.map { it.id }.toSet().size)
        assertEquals(-1, Catalog.indexOf("nope"))
    }
}

package app.bimeong.engine

import kotlin.math.pow

/**
 * Small feedback-delay-network reverb. Gives distance to the sounds that need it
 * (thunder rolling off, birds across a valley, a bowl ringing in a room).
 */
internal class Reverb(fs: Int, rt60: Float = 2.4f) {
    private val base = intArrayOf(1117, 1361, 1559, 1801, 2053, 2311, 2609, 2953)
    private val len = IntArray(8) { (base[it] * fs / 44100.0).toInt() }
    private val buf = Array(8) { FloatArray(len[it]) }
    private val idx = IntArray(8)
    private val fb = FloatArray(8) { 10f.pow(-3f * len[it] / (rt60 * fs)) * 0.35355f }
    private val lp = FloatArray(8)
    private val damp = 0.42f

    private val apLen = IntArray(4) { (intArrayOf(142, 379, 107, 277)[it] * fs / 44100.0).toInt() }
    private val apBuf = Array(4) { FloatArray(apLen[it]) }
    private val apIdx = IntArray(4)

    private fun allpass(k: Int, x: Float): Float {
        val b = apBuf[k]
        val i = apIdx[k]
        val d = b[i]
        val y = d - 0.6f * x
        b[i] = x + 0.6f * y
        apIdx[k] = if (i + 1 >= b.size) 0 else i + 1
        return y
    }

    /** Reads the send buffers and adds the reverberated signal to the output buffers. */
    fun process(inL: FloatArray, inR: FloatArray, outL: FloatArray, outR: FloatArray, n: Int, wet: Float = 0.5f) {
        val b0 = buf[0]; val b1 = buf[1]; val b2 = buf[2]; val b3 = buf[3]
        val b4 = buf[4]; val b5 = buf[5]; val b6 = buf[6]; val b7 = buf[7]
        var i0 = idx[0]; var i1 = idx[1]; var i2 = idx[2]; var i3 = idx[3]
        var i4 = idx[4]; var i5 = idx[5]; var i6 = idx[6]; var i7 = idx[7]
        var l0 = lp[0]; var l1 = lp[1]; var l2 = lp[2]; var l3 = lp[3]
        var l4 = lp[4]; var l5 = lp[5]; var l6 = lp[6]; var l7 = lp[7]
        val d = damp
        for (i in 0 until n) {
            // The inaudible offset keeps the delay lines out of the denormal range during silence.
            val xl = allpass(1, allpass(0, inL[i] + 1e-18f))
            val xr = allpass(3, allpass(2, inR[i] + 1e-18f))
            val v0 = b0[i0]; val v1 = b1[i1]; val v2 = b2[i2]; val v3 = b3[i3]
            val v4 = b4[i4]; val v5 = b5[i5]; val v6 = b6[i6]; val v7 = b7[i7]
            outL[i] += (v0 - v2 + v4 - v6) * wet
            outR[i] += (v1 - v3 + v5 - v7) * wet
            l0 += d * (v0 - l0); l1 += d * (v1 - l1); l2 += d * (v2 - l2); l3 += d * (v3 - l3)
            l4 += d * (v4 - l4); l5 += d * (v5 - l5); l6 += d * (v6 - l6); l7 += d * (v7 - l7)
            val a0 = l0 + l1; val a1 = l0 - l1; val a2 = l2 + l3; val a3 = l2 - l3
            val a4 = l4 + l5; val a5 = l4 - l5; val a6 = l6 + l7; val a7 = l6 - l7
            val c0 = a0 + a2; val c1 = a1 + a3; val c2 = a0 - a2; val c3 = a1 - a3
            val c4 = a4 + a6; val c5 = a5 + a7; val c6 = a4 - a6; val c7 = a5 - a7
            b0[i0] = (c0 + c4) * fb[0] + xl
            b1[i1] = (c1 + c5) * fb[1] + xr
            b2[i2] = (c2 + c6) * fb[2] + xl
            b3[i3] = (c3 + c7) * fb[3] + xr
            b4[i4] = (c0 - c4) * fb[4] + xl
            b5[i5] = (c1 - c5) * fb[5] + xr
            b6[i6] = (c2 - c6) * fb[6] + xl
            b7[i7] = (c3 - c7) * fb[7] + xr
            if (++i0 >= b0.size) i0 = 0
            if (++i1 >= b1.size) i1 = 0
            if (++i2 >= b2.size) i2 = 0
            if (++i3 >= b3.size) i3 = 0
            if (++i4 >= b4.size) i4 = 0
            if (++i5 >= b5.size) i5 = 0
            if (++i6 >= b6.size) i6 = 0
            if (++i7 >= b7.size) i7 = 0
        }
        idx[0] = i0; idx[1] = i1; idx[2] = i2; idx[3] = i3; idx[4] = i4; idx[5] = i5; idx[6] = i6; idx[7] = i7
        // Flush denormals so an idle tail costs nothing.
        lp[0] = clean(l0); lp[1] = clean(l1); lp[2] = clean(l2); lp[3] = clean(l3)
        lp[4] = clean(l4); lp[5] = clean(l5); lp[6] = clean(l6); lp[7] = clean(l7)
    }

    private fun clean(x: Float): Float = if (x > -1e-20f && x < 1e-20f) 0f else x
}

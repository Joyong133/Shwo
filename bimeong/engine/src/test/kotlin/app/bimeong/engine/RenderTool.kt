package app.bimeong.engine

import java.io.DataOutputStream
import java.io.File
import java.io.FileOutputStream

/** Writes 16-bit stereo PCM. */
fun writeWav(file: File, l: FloatArray, r: FloatArray, fs: Int) {
    val frames = l.size
    val data = ByteArray(frames * 4)
    for (i in 0 until frames) {
        val a = (l[i].coerceIn(-1f, 1f) * 32767f).toInt()
        val b = (r[i].coerceIn(-1f, 1f) * 32767f).toInt()
        data[i * 4] = a.toByte(); data[i * 4 + 1] = (a shr 8).toByte()
        data[i * 4 + 2] = b.toByte(); data[i * 4 + 3] = (b shr 8).toByte()
    }
    fun le32(v: Int) = byteArrayOf(v.toByte(), (v shr 8).toByte(), (v shr 16).toByte(), (v shr 24).toByte())
    fun le16(v: Int) = byteArrayOf(v.toByte(), (v shr 8).toByte())
    DataOutputStream(FileOutputStream(file)).use { o ->
        o.write("RIFF".toByteArray()); o.write(le32(36 + data.size)); o.write("WAVE".toByteArray())
        o.write("fmt ".toByteArray()); o.write(le32(16)); o.write(le16(1)); o.write(le16(2))
        o.write(le32(fs)); o.write(le32(fs * 4)); o.write(le16(4)); o.write(le16(16))
        o.write("data".toByteArray()); o.write(le32(data.size)); o.write(data)
    }
}

/** Renders one sound on its own, exactly as the app's mixer would at full slider and master. */
fun renderSolo(index: Int, seconds: Float, fs: Int = 48000, seed: Long = 1234L): Pair<FloatArray, FloatArray> {
    val mixer = Mixer(fs, seed)
    mixer.master = 1f
    mixer.setLevel(index, 1f)
    val frames = (seconds * fs).toInt()
    val l = FloatArray(frames)
    val r = FloatArray(frames)
    mixer.render(l, r, frames)
    return l to r
}

/** Renders one voice directly, bypassing trims, master volume and the limiter. */
fun renderRaw(def: SoundDef, seconds: Float, fs: Int = 48000, seed: Long = 1234L): Pair<FloatArray, FloatArray> {
    val voice = def.make(fs, seed)
    val frames = (seconds * fs).toInt()
    val l = FloatArray(frames)
    val r = FloatArray(frames)
    val bl = FloatArray(256); val br = FloatArray(256); val sl = FloatArray(256); val sr = FloatArray(256)
    val reverb = Reverb(fs)
    var o = 0
    while (o < frames) {
        val n = minOf(256, frames - o)
        bl.fill(0f); br.fill(0f); sl.fill(0f); sr.fill(0f)
        voice.render(bl, br, sl, sr, n)
        if (def.reverb) reverb.process(sl, sr, bl, br, n)
        System.arraycopy(bl, 0, l, o, n)
        System.arraycopy(br, 0, r, o, n)
        o += n
    }
    return l to r
}

fun main(args: Array<String>) {
    if (args.getOrElse(3) { "" } == "raw") return rawMain(args)
    if (args.getOrElse(3) { "" } == "tour") return tourMain(args)
    val out = File(args.getOrElse(0) { "build/samples" }).apply { mkdirs() }
    val seconds = args.getOrElse(1) { "20" }.toFloat()
    val only = args.getOrElse(2) { "" }.split(',').filter { it.isNotBlank() }.toSet()
    val fs = 48000
    println("id,rms_db,peak_db,kurtosis,realtime_x")
    for ((index, def) in Catalog.sounds.withIndex()) {
        if (only.isNotEmpty() && def.id !in only) continue
        val t0 = System.nanoTime()
        val (l, r) = renderSolo(index, seconds, fs)
        val took = (System.nanoTime() - t0) / 1e9
        writeWav(File(out, "${def.id}.wav"), l, r, fs)
        var sum = 0.0
        var sum4 = 0.0
        var peak = 0f
        val skip = fs / 2
        for (i in skip until l.size) {
            val x = l[i].toDouble()
            sum += x * x
            sum4 += x * x * x * x
            peak = maxOf(peak, kotlin.math.abs(l[i]), kotlin.math.abs(r[i]))
        }
        val cnt = (l.size - skip).toDouble()
        val ms = sum / cnt
        val kurt = if (ms > 0) (sum4 / cnt) / (ms * ms) else 0.0
        println(
            "%s,%.1f,%.1f,%.1f,%.0f".format(
                def.id, 10 * kotlin.math.log10(ms + 1e-20), 20 * kotlin.math.log10(peak + 1e-10), kurt, seconds / took,
            ),
        )
    }
}

/** Raw voices, peak-normalised to -6 dBFS, with the applied scale printed for calibration. */
fun rawMain(args: Array<String>) {
    val out = File(args[0]).apply { mkdirs() }
    val seconds = args[1].toFloat()
    val only = args[2].split(',').filter { it.isNotBlank() }.toSet()
    val fs = 48000
    println("id,raw_rms_db,raw_peak_db,kurtosis,scale,realtime_x")
    for (def in Catalog.sounds) {
        if (only.isNotEmpty() && def.id !in only) continue
        val t0 = System.nanoTime()
        val (l, r) = renderRaw(def, seconds, fs)
        val took = (System.nanoTime() - t0) / 1e9
        var sum = 0.0; var sum4 = 0.0; var peak = 1e-9f
        for (i in l.indices) {
            val x = l[i].toDouble()
            sum += x * x; sum4 += x * x * x * x
            peak = maxOf(peak, kotlin.math.abs(l[i]), kotlin.math.abs(r[i]))
        }
        val ms = sum / l.size
        val scale = 0.5f / peak
        for (i in l.indices) { l[i] *= scale; r[i] *= scale }
        writeWav(File(out, "${def.id}.wav"), l, r, fs)
        println("%s,%.1f,%.1f,%.1f,%.5f,%.0f".format(def.id, 10 * kotlin.math.log10(ms + 1e-20), 20 * kotlin.math.log10(peak), (sum4 / l.size) / (ms * ms + 1e-30), scale, seconds / took))
    }
}

/** One file that walks through a few mixes, the way the app plays them, for a quick listen. */
fun tourMain(args: Array<String>) {
    val out = File(args[0]).apply { mkdirs() }
    val seconds = args[1].toFloat()
    val fs = 48000
    val mixes = listOf(
        mapOf("rain_steady" to 0.6f, "rain_window" to 0.5f, "noise_brown" to 0.45f, "thunder" to 0.3f),
        mapOf("rain_tent" to 0.7f, "rain_leaves" to 0.4f, "wind" to 0.25f),
        mapOf("rain_car" to 0.6f, "rain_road" to 0.5f),
        mapOf("sizzle" to 0.55f, "rain_steady" to 0.5f, "rain_eaves" to 0.3f),
        mapOf("cafe" to 0.55f, "rain_window" to 0.4f),
        mapOf("whisper" to 0.6f, "brushing" to 0.4f, "tapping" to 0.3f),
        mapOf("hum" to 0.55f, "rain_window" to 0.4f),
        mapOf("shush" to 0.6f, "heartbeat" to 0.45f, "musicbox" to 0.3f),
        mapOf("templebell" to 0.5f, "moktak" to 0.4f, "chimes" to 0.3f, "stream" to 0.3f, "birds" to 0.25f),
        mapOf("cicada" to 0.45f, "wind" to 0.35f, "stream" to 0.3f),
        mapOf("fire" to 0.5f, "wind" to 0.35f, "steps_snow" to 0.35f),
        mapOf("underwater" to 0.6f, "whale" to 0.45f),
        mapOf("bowl" to 0.5f, "om" to 0.45f, "choir" to 0.3f),
    )
    val mixer = Mixer(fs, 99L)
    mixer.master = 0.9f
    mixer.warmth = 0.25f
    val per = (seconds * fs).toInt()
    val l = FloatArray(per * mixes.size)
    val r = FloatArray(per * mixes.size)
    val bl = FloatArray(per)
    val br = FloatArray(per)
    for ((k, mix) in mixes.withIndex()) {
        for ((i, def) in Catalog.sounds.withIndex()) mixer.setLevel(i, mix[def.id] ?: 0f)
        mixer.render(bl, br, per)
        System.arraycopy(bl, 0, l, k * per, per)
        System.arraycopy(br, 0, r, k * per, per)
    }
    writeWav(File(out, "tour.wav"), l, r, fs)
    println("tour: ${mixes.size} mixes x ${seconds}s")
}

package app.bimeong.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.os.Process
import android.util.Log
import app.bimeong.engine.Mixer

/** Where the mix goes. The real one is [AudioOutput]; tests substitute a silent one. */
interface Output {
    fun start()

    /** Fades out and releases the audio device shortly after. Safe to call repeatedly. */
    fun stop()
}

/**
 * Feeds the [Mixer] to the speaker from a dedicated thread.
 *
 * Stopping is always graceful: the mixer is asked to fade first and the thread
 * leaves only once the output has actually gone silent.
 */
class AudioOutput(private val mixer: Mixer) : Output {
    private val lock = Any()
    private var thread: Thread? = null
    private var stopRequested = false

    override fun start() {
        synchronized(lock) {
            stopRequested = false
            mixer.playing = true
            if (thread == null) {
                thread = Thread(::run, "bimeong-audio").also { it.start() }
            }
        }
    }

    override fun stop() {
        synchronized(lock) {
            stopRequested = true
            mixer.playing = false
        }
    }

    private fun shouldExit(): Boolean = synchronized(lock) {
        if (stopRequested && mixer.silent) {
            thread = null
            true
        } else {
            false
        }
    }

    private fun run() {
        Process.setThreadPriority(Process.THREAD_PRIORITY_AUDIO)
        val l = FloatArray(CHUNK)
        val r = FloatArray(CHUNK)
        val floats = FloatArray(CHUNK * 2)
        val shorts = ShortArray(CHUNK * 2)
        var track: AudioTrack? = null
        var useFloat = true
        try {
            while (!shouldExit()) {
                if (track == null) {
                    track = create(useFloat) ?: if (useFloat) {
                        useFloat = false
                        create(false)
                    } else {
                        null
                    }
                    if (track == null) {
                        Log.e(TAG, "No audio output available")
                        synchronized(lock) { thread = null }
                        return
                    }
                    track.play()
                }
                mixer.render(l, r, CHUNK)
                val written = if (useFloat) {
                    for (i in 0 until CHUNK) {
                        floats[2 * i] = l[i]
                        floats[2 * i + 1] = r[i]
                    }
                    track.write(floats, 0, floats.size, AudioTrack.WRITE_BLOCKING)
                } else {
                    for (i in 0 until CHUNK) {
                        shorts[2 * i] = (l[i].coerceIn(-1f, 1f) * 32767f).toInt().toShort()
                        shorts[2 * i + 1] = (r[i].coerceIn(-1f, 1f) * 32767f).toInt().toShort()
                    }
                    track.write(shorts, 0, shorts.size, AudioTrack.WRITE_BLOCKING)
                }
                if (written < 0) {
                    // The output device went away (e.g. Bluetooth disconnected): open a fresh track.
                    Log.w(TAG, "AudioTrack write failed: $written")
                    runCatching { track.release() }
                    track = null
                    Thread.sleep(50)
                }
            }
        } catch (e: InterruptedException) {
            synchronized(lock) { thread = null }
        } catch (e: RuntimeException) {
            Log.e(TAG, "Audio thread failed", e)
            synchronized(lock) { thread = null }
        } finally {
            track?.let {
                runCatching { it.pause() }
                runCatching { it.flush() }
                runCatching { it.release() }
            }
        }
    }

    private fun create(float: Boolean): AudioTrack? {
        val encoding = if (float) AudioFormat.ENCODING_PCM_FLOAT else AudioFormat.ENCODING_PCM_16BIT
        val bytesPerFrame = if (float) 8 else 4
        val minBytes = AudioTrack.getMinBufferSize(mixer.sampleRate, AudioFormat.CHANNEL_OUT_STEREO, encoding)
        if (minBytes <= 0) return null
        return try {
            AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build(),
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(encoding)
                        .setSampleRate(mixer.sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                        .build(),
                )
                .setBufferSizeInBytes(maxOf(minBytes, CHUNK * bytesPerFrame * 3))
                .setTransferMode(AudioTrack.MODE_STREAM)
                // Long, quiet sessions: prefer the battery-friendly deep buffer over low latency.
                .setPerformanceMode(AudioTrack.PERFORMANCE_MODE_POWER_SAVING)
                .build()
                .takeIf { it.state == AudioTrack.STATE_INITIALIZED }
        } catch (e: RuntimeException) {
            Log.w(TAG, "AudioTrack unavailable (float=$float)", e)
            null
        }
    }

    private companion object {
        const val TAG = "AudioOutput"
        const val CHUNK = 2048
    }
}

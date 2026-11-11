package app.bimeong

import android.app.Application
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Looper
import android.os.SystemClock
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import app.bimeong.audio.Output
import app.bimeong.audio.PlaybackService
import app.bimeong.audio.Player
import app.bimeong.data.Presets
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

@RunWith(AndroidJUnit4::class)
@Config(sdk = [35])
class PlayerTest {
    private class FakeOutput : Output {
        var running = false
        override fun start() { running = true }
        override fun stop() { running = false }
    }

    private val app: Application = ApplicationProvider.getApplicationContext()
    private var output: FakeOutput? = null

    @Before
    fun setUp() {
        Player.resetForTest()
        app.getSharedPreferences("bimeong", Context.MODE_PRIVATE).edit().clear().commit()
        Player.outputFactory = { FakeOutput().also { output = it } }
        Player.init(app)
    }

    @After
    fun tearDown() {
        Player.resetForTest()
    }

    private fun idle() = shadowOf(Looper.getMainLooper()).idle()

    @Test
    fun tappingASoundStartsPlayingIt() {
        assertFalse(Player.state.value.playing)
        Player.toggle("rain_window")
        val s = Player.state.value
        assertTrue(s.playing)
        assertTrue(s.sessionActive)
        assertEquals(Player.DEFAULT_LEVEL, s.levels["rain_window"])
        assertTrue(output!!.running)
        // The playback service was asked to start.
        assertEquals(PlaybackService::class.java.name, shadowOf(app).nextStartedService.component?.className)
    }

    @Test
    fun turningOffTheLastSoundEndsTheSession() {
        Player.toggle("fire")
        Player.toggle("fire")
        val s = Player.state.value
        assertTrue(s.levels.isEmpty())
        assertFalse(s.playing)
        assertFalse(s.sessionActive)
        assertFalse(output!!.running)
    }

    @Test
    fun playWithNothingSelectedUsesTheDefaultMix() {
        Player.play()
        assertEquals(Presets.default.levels, Player.state.value.levels)
        assertTrue(Player.state.value.playing)
    }

    @Test
    fun levelsAreClampedAndUnknownSoundsIgnored() {
        Player.toggle("waves")
        Player.setLevel("waves", 5f)
        assertEquals(1f, Player.state.value.levels["waves"])
        Player.setLevel("waves", -1f)
        assertEquals(Player.MIN_LEVEL, Player.state.value.levels["waves"])
        Player.setLevel("stream", 0.5f) // not switched on: no effect
        Player.toggle("no_such_sound")
        assertEquals(setOf("waves"), Player.state.value.levels.keys)
    }

    @Test
    fun pauseKeepsTheSessionAndPlayResumes() {
        Player.applyMix(mapOf("rain_tent" to 0.6f, "wind" to 0.3f))
        Player.pause()
        assertFalse(Player.state.value.playing)
        assertTrue(Player.state.value.sessionActive)
        assertFalse(output!!.running)
        Player.play()
        assertTrue(Player.state.value.playing)
        assertTrue(output!!.running)
    }

    @Test
    fun sleepTimerStopsEverythingWhenItRunsOut() {
        Player.toggle("rain_steady")
        Player.startSleepTimer(30)
        val end = Player.state.value.sleepEndsAt
        assertTrue(end > SystemClock.elapsedRealtime())
        Player.tick(end - 1_000)
        assertTrue(Player.state.value.playing)
        Player.tick(end + 1)
        val s = Player.state.value
        assertFalse(s.playing)
        assertFalse(s.sessionActive)
        assertEquals(0L, s.sleepEndsAt)
        // The mix itself is kept for next time.
        assertEquals(setOf("rain_steady"), s.levels.keys)
    }

    @Test
    fun focusTimerAlternatesFocusAndBreak() {
        Player.startFocus(25, 5)
        assertTrue(Player.state.value.playing)
        val first = Player.state.value.focus!!
        assertFalse(first.onBreak)
        assertEquals(1, first.round)

        Player.tick(first.endsAt)
        val rest = Player.state.value.focus!!
        assertTrue(rest.onBreak)
        assertEquals(first.endsAt + 5 * 60_000L, rest.endsAt)

        Player.tick(rest.endsAt)
        val second = Player.state.value.focus!!
        assertFalse(second.onBreak)
        assertEquals(2, second.round)

        Player.stopFocus()
        assertNull(Player.state.value.focus)
    }

    @Test
    fun aLongPauseLetsGoOfTheSession() {
        Player.toggle("fan")
        Player.pause()
        Player.tick(SystemClock.elapsedRealtime() + 11 * 60_000L)
        assertFalse(Player.state.value.sessionActive)
    }

    @Test
    fun mixesAndSettingsSurviveARestart() {
        Player.applyMix(mapOf("bowl" to 0.4f, "stream" to 0.8f))
        Player.setMaster(0.5f)
        Player.setWarmth(0.75f)
        Player.setMixWithOthers(true)
        Player.saveMix("  내 빗소리  ")
        Player.flush()

        Player.resetForTest()
        Player.outputFactory = { FakeOutput().also { output = it } }
        Player.init(app)

        val s = Player.state.value
        assertEquals(mapOf("bowl" to 0.4f, "stream" to 0.8f), s.levels)
        assertEquals(0.5f, s.master)
        assertEquals(0.75f, s.warmth)
        assertTrue(s.mixWithOthers)
        assertEquals("내 빗소리", s.saved.single().name)
        assertEquals(s.levels, s.saved.single().levels)
        // Restored but not playing: nothing starts by itself.
        assertFalse(s.playing)

        Player.deleteMix("내 빗소리")
        assertTrue(Player.state.value.saved.isEmpty())
    }

    @Test
    fun serviceShowsWhatIsPlayingAndGoesAwayOnStop() {
        Player.applyMix(mapOf("rain_drizzle" to 0.5f, "fire" to 0.5f, "wind" to 0.3f))
        Player.startSleepTimer(30)
        Player.tick(SystemClock.elapsedRealtime())
        val controller = Robolectric.buildService(PlaybackService::class.java).create().startCommand(0, 1)
        idle()
        val service = controller.get()
        val shown = shadowOf(service).lastForegroundNotification
        assertNotNull(shown)
        assertEquals("보슬비 · 바람 외 1", shown.extras.getString("android.title"))
        assertEquals("재생 중 · 수면 타이머 30분 남음", shown.extras.getString("android.text"))

        Player.pause()
        idle()
        assertEquals("일시정지됨 · 수면 타이머 30분 남음", shadowOf(service).lastForegroundNotification.extras.getString("android.text"))
        assertFalse(shadowOf(service).isStoppedBySelf)

        // The notification's own buttons drive the player.
        service.onStartCommand(Intent(app, PlaybackService::class.java).setAction(PlaybackService.ACTION_PLAY), 0, 2)
        idle()
        assertTrue(Player.state.value.playing)

        service.onStartCommand(Intent(app, PlaybackService::class.java).setAction(PlaybackService.ACTION_STOP), 0, 3)
        idle()
        assertFalse(Player.state.value.sessionActive)
        assertTrue(shadowOf(service).isStoppedBySelf)
        assertTrue(shadowOf(service).isForegroundStopped)
        val manager = app.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        assertEquals(0, shadowOf(manager).activeNotifications.size)
        controller.destroy()
    }
}

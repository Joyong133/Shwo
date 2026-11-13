package app.bimeong

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import app.bimeong.audio.FocusState
import app.bimeong.audio.PlayerState
import app.bimeong.audio.SavedMix
import app.bimeong.ui.BimeongTheme
import app.bimeong.ui.MainScreen
import app.bimeong.ui.PlayerActions
import com.github.takahirom.roborazzi.captureRoboImage
import com.github.takahirom.roborazzi.captureScreenRoboImage
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Renders the real screen off-device and saves pictures of it under build/outputs/roborazzi,
 * and checks that taps reach the player.
 */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w411dp-h891dp-420dpi")
class ScreenshotTest {
    @get:Rule
    val compose = createComposeRule()

    private class Recorder : PlayerActions {
        val calls = mutableListOf<String>()
        override fun toggle(id: String) { calls += "toggle $id" }
        override fun setLevel(id: String, level: Float) { calls += "level $id" }
        override fun setMaster(value: Float) { calls += "master" }
        override fun setWarmth(value: Float) { calls += "warmth" }
        override fun setMixWithOthers(enabled: Boolean) { calls += "mixWithOthers $enabled" }
        override fun playPause() { calls += "playPause" }
        override fun clear() { calls += "clear" }
        override fun applyMix(levels: Map<String, Float>) { calls += "applyMix ${levels.keys.sorted()}" }
        override fun saveMix(name: String) { calls += "saveMix $name" }
        override fun deleteMix(name: String) { calls += "deleteMix $name" }
        override fun startSleepTimer(minutes: Int) { calls += "sleep $minutes" }
        override fun cancelSleepTimer() { calls += "cancelSleep" }
        override fun startFocus(focusMin: Int, breakMin: Int) { calls += "focus $focusMin $breakMin" }
        override fun stopFocus() { calls += "stopFocus" }
    }

    private val playing = PlayerState(
        levels = mapOf("rain_steady" to 0.6f, "rain_window" to 0.5f, "noise_brown" to 0.45f, "thunder" to 0.3f),
        playing = true,
        sessionActive = true,
        sleepEndsAt = 1_000_000L + 29 * 60_000L + 41_000L,
        saved = listOf(SavedMix("나의 빗소리", mapOf("rain_tent" to 0.7f, "fire" to 0.4f))),
    )

    private fun shot(name: String) = "build/outputs/roborazzi/$name.png"

    @Test
    fun emptyScreen() {
        compose.setContent { BimeongTheme { MainScreen(PlayerState(), 0L, Recorder(), animateBackdrop = false) } }
        compose.onRoot().captureRoboImage(shot("1_empty"))
    }

    @Test
    fun playingScreenAndTaps() {
        val recorder = Recorder()
        compose.setContent { BimeongTheme { MainScreen(playing, 1_000_000L, recorder, animateBackdrop = false) } }
        compose.onRoot().captureRoboImage(shot("2_playing"))

        compose.onNodeWithText("보슬비").performClick()
        compose.onNodeWithContentDescription("일시정지").performClick()
        compose.onNodeWithText("나의 빗소리").performClick()
        assertEquals(listOf("toggle rain_drizzle", "playPause", "applyMix [fire, rain_tent]"), recorder.calls)
    }

    @Test
    fun filterChipsNarrowTheList() {
        val recorder = Recorder()
        compose.setContent { BimeongTheme { MainScreen(playing.copy(levels = playing.levels + ("whisper" to 0.6f)), 1_000_000L, recorder, animateBackdrop = false) } }
        compose.onNodeWithText("목소리").performClick()
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(shot("7_voice"))
        // Only the voice sounds are listed now.
        compose.onNodeWithText("허밍 자장가").performClick()
        compose.onNodeWithText("보슬비").assertDoesNotExist()

        compose.onNodeWithText("켜짐 5").performClick()
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(shot("8_on"))
        compose.onNodeWithText("먼 천둥").performClick()
        compose.onNodeWithText("허밍 자장가").assertDoesNotExist()
        assertEquals(listOf("toggle hum", "toggle thunder"), recorder.calls)
    }

    @Test
    fun sleepTimerSheet() {
        val recorder = Recorder()
        compose.setContent { BimeongTheme { MainScreen(playing, 1_000_000L, recorder, animateBackdrop = false) } }
        compose.onNodeWithText("29:41").performClick()
        compose.waitForIdle()
        captureScreenRoboImage(shot("3_sleep_timer"))
        compose.onNodeWithText("45분").performClick()
        compose.onNodeWithText("타이머 끄기").performClick()
        assertEquals(listOf("sleep 45", "cancelSleep"), recorder.calls)
    }

    @Test
    fun focusTimerSheet() {
        val recorder = Recorder()
        compose.setContent { BimeongTheme { MainScreen(playing.copy(sleepEndsAt = 0L), 1_000_000L, recorder, animateBackdrop = false) } }
        compose.onNodeWithText("타이머").performClick()
        compose.onNodeWithText("집중 타이머").performClick()
        compose.waitForIdle()
        captureScreenRoboImage(shot("4_focus_setup"))
        compose.onNodeWithText("45분").performClick()
        compose.onNodeWithText("10분").performClick()
        compose.onNodeWithText("집중 시작").performClick()
        assertEquals(listOf("focus 45 10"), recorder.calls)
    }

    @Test
    fun focusRunning() {
        val state = playing.copy(sleepEndsAt = 0L, focus = FocusState(25, 5, onBreak = false, endsAt = 1_000_000L + 12 * 60_000L + 5_000L, round = 2))
        compose.setContent { BimeongTheme { MainScreen(state, 1_000_000L, Recorder(), animateBackdrop = false) } }
        compose.onNodeWithText("집중 12:05").performClick()
        compose.waitForIdle()
        captureScreenRoboImage(shot("5_focus_running"))
    }

    @Test
    fun tuneSheet() {
        val recorder = Recorder()
        compose.setContent { BimeongTheme { MainScreen(playing, 1_000_000L, recorder, animateBackdrop = false) } }
        compose.onNodeWithContentDescription("소리 조절").performClick()
        compose.waitForIdle()
        captureScreenRoboImage(shot("6_tune"))
        compose.onNodeWithText("모두 끄기").performClick()
        assertEquals(listOf("clear"), recorder.calls)
    }
}

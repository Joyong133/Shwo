package app.bimeong

import android.app.Application
import android.content.Context
import android.os.Looper
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import app.bimeong.audio.Output
import app.bimeong.audio.Player
import app.bimeong.ui.MainActivity
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.ExternalResource
import org.junit.rules.RuleChain
import org.junit.runner.RunWith
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/** Launches the real activity, wired to the real player, and uses it the way a person would. */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w411dp-h891dp-420dpi")
class MainActivityTest {
    private class SilentOutput : Output {
        override fun start() {}
        override fun stop() {}
    }

    private val cleanPlayer = object : ExternalResource() {
        override fun before() {
            val app: Application = ApplicationProvider.getApplicationContext()
            Player.resetForTest()
            app.getSharedPreferences("bimeong", Context.MODE_PRIVATE).edit().clear().commit()
            Player.outputFactory = { SilentOutput() }
            Player.init(app)
        }
    }
    private val compose = createAndroidComposeRule<MainActivity>()

    @get:Rule
    val rules: RuleChain = RuleChain.outerRule(cleanPlayer).around(compose)

    @After
    fun tearDown() {
        Player.resetForTest()
    }

    /**
     * While rain plays, the backdrop animates forever, so the test drives the clock itself
     * instead of waiting for the screen to come to rest.
     */
    private fun settle() {
        compose.mainClock.advanceTimeBy(300)
        shadowOf(Looper.getMainLooper()).idle()
        compose.mainClock.advanceTimeBy(300)
    }

    @Test
    fun pickSoundsPauseAndClear() {
        compose.mainClock.autoAdvance = false
        compose.onNodeWithText("비멍").assertIsDisplayed()
        compose.onNodeWithText("소리를 골라 나만의 빗소리를 만들어 보세요").assertIsDisplayed()

        compose.onNodeWithText("창가의 비").performClick()
        compose.onNodeWithText("보슬비").performClick()
        settle()
        assertTrue(Player.state.value.playing)
        assertEquals(setOf("rain_window", "rain_drizzle"), Player.state.value.levels.keys)
        compose.onNodeWithText("2개 재생 중 · 보슬비 · 창가의 비").assertIsDisplayed()

        compose.onNodeWithContentDescription("일시정지").performClick()
        settle()
        assertFalse(Player.state.value.playing)
        compose.onNodeWithText("2개 선택됨 · 보슬비 · 창가의 비").assertIsDisplayed()

        compose.onNodeWithContentDescription("재생").performClick()
        settle()
        assertTrue(Player.state.value.playing)

        compose.onNodeWithContentDescription("소리 조절").performClick()
        settle()
        compose.onNodeWithText("모두 끄기").performClick()
        settle()
        assertTrue(Player.state.value.levels.isEmpty())
        assertFalse(Player.state.value.sessionActive)
    }

    @Test
    fun presetThenSleepTimer() {
        compose.mainClock.autoAdvance = false
        compose.onNodeWithText("깊은 잠").performClick()
        settle()
        assertEquals(setOf("rain_steady", "rain_window", "noise_brown", "thunder"), Player.state.value.levels.keys)

        compose.onNodeWithText("타이머").performClick()
        settle()
        compose.onNodeWithText("30분").performClick()
        settle()
        assertTrue(Player.state.value.sleepEndsAt > 0L)
        compose.onNodeWithText("타이머 끄기").performClick()
        settle()
        assertEquals(0L, Player.state.value.sleepEndsAt)
    }
}

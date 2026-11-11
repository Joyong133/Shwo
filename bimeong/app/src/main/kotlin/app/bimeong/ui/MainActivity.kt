package app.bimeong.ui

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.bimeong.audio.Player

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
        )
        super.onCreate(savedInstanceState)
        Player.init(applicationContext)
        // The volume keys should always move the media volume here, even before anything plays.
        volumeControlStream = AudioManager.STREAM_MUSIC

        setContent {
            BimeongTheme {
                val state by Player.state.collectAsStateWithLifecycle()
                val now by Player.now.collectAsStateWithLifecycle()

                // The playback notification carries the pause and stop buttons; ask for it once, when sound first starts.
                var asked by rememberSaveable { mutableStateOf(false) }
                val askNotifications = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {}
                LaunchedEffect(state.playing) {
                    if (state.playing && !asked && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                        ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.POST_NOTIFICATIONS) !=
                        PackageManager.PERMISSION_GRANTED
                    ) {
                        asked = true
                        askNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                }

                MainScreen(state, now, LiveActions)
            }
        }
    }
}

/** Forwards the screen's requests to the real player. */
private object LiveActions : PlayerActions {
    override fun toggle(id: String) = Player.toggle(id)
    override fun setLevel(id: String, level: Float) = Player.setLevel(id, level)
    override fun setMaster(value: Float) = Player.setMaster(value)
    override fun setWarmth(value: Float) = Player.setWarmth(value)
    override fun setMixWithOthers(enabled: Boolean) = Player.setMixWithOthers(enabled)
    override fun playPause() = if (Player.state.value.playing) Player.pause() else Player.play()
    override fun clear() = Player.clear()
    override fun applyMix(levels: Map<String, Float>) = Player.applyMix(levels)
    override fun saveMix(name: String) = Player.saveMix(name)
    override fun deleteMix(name: String) = Player.deleteMix(name)
    override fun startSleepTimer(minutes: Int) = Player.startSleepTimer(minutes)
    override fun cancelSleepTimer() = Player.cancelSleepTimer()
    override fun startFocus(focusMin: Int, breakMin: Int) = Player.startFocus(focusMin, breakMin)
    override fun stopFocus() = Player.stopFocus()
}

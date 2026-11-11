package app.bimeong.audio

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.media.AudioManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import app.bimeong.R
import app.bimeong.data.Sounds
import app.bimeong.ui.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

/**
 * Keeps the app alive and controllable while sound is playing with the screen off:
 * a foreground service with a media notification, lock-screen controls and a wake lock.
 * It holds no playback logic of its own; it mirrors [Player.state].
 */
class PlaybackService : Service() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private lateinit var session: MediaSessionCompat
    private var wakeLock: PowerManager.WakeLock? = null
    private var noisyRegistered = false

    /** Everything the notification shows; it is only rebuilt when one of these changes. */
    private data class Model(val title: String, val text: String, val playing: Boolean, val active: Boolean)

    private val noisyReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // Headphones unplugged: never start blaring out of the speaker at night.
            if (intent.action == AudioManager.ACTION_AUDIO_BECOMING_NOISY) Player.pause()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Player.init(applicationContext)
        createChannel()
        session = MediaSessionCompat(this, "bimeong").apply {
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() = Player.play()
                override fun onPause() = Player.pause()
                override fun onStop() = Player.stop()
            })
            isActive = true
        }
        wakeLock = (getSystemService(Context.POWER_SERVICE) as PowerManager)
            .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "bimeong:playback")
            .apply { setReferenceCounted(false) }

        scope.launch {
            combine(Player.state, Player.now) { s, now -> model(s, now) }
                .distinctUntilChanged()
                .collect { apply(it) }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // A service started with startForegroundService must go foreground right away, whatever happens next.
        val current = model(Player.state.value, Player.now.value)
        goForeground(buildNotification(current))
        when (intent?.action) {
            ACTION_PLAY -> Player.play()
            ACTION_PAUSE -> Player.pause()
            ACTION_STOP -> Player.stop()
        }
        if (!Player.state.value.sessionActive) shutDown()
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        scope.cancel()
        releaseWakeLock()
        unregisterNoisy()
        session.isActive = false
        session.release()
        super.onDestroy()
    }

    private fun model(s: PlayerState, now: Long): Model {
        val status = getString(if (s.playing) R.string.status_playing else R.string.status_paused)
        val timer = when {
            s.sleepEndsAt != 0L -> "수면 타이머 ${minutesLeft(s.sleepEndsAt, now)}분 남음"
            s.focus != null -> (if (s.focus.onBreak) "휴식" else "집중") + " ${minutesLeft(s.focus.endsAt, now)}분 남음"
            else -> null
        }
        return Model(
            title = Sounds.summary(s.levels).ifEmpty { getString(R.string.app_name) },
            text = if (timer == null) status else "$status · $timer",
            playing = s.playing,
            active = s.sessionActive,
        )
    }

    private fun minutesLeft(endsAt: Long, now: Long): Long = ((endsAt - now).coerceAtLeast(0L) + 59_999L) / 60_000L

    private fun apply(m: Model) {
        if (!m.active) {
            shutDown()
            return
        }
        session.setMetadata(
            MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, m.title)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, getString(R.string.app_name))
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, -1L)
                .build(),
        )
        session.setPlaybackState(
            PlaybackStateCompat.Builder()
                .setActions(
                    PlaybackStateCompat.ACTION_PLAY or PlaybackStateCompat.ACTION_PAUSE or
                        PlaybackStateCompat.ACTION_PLAY_PAUSE or PlaybackStateCompat.ACTION_STOP,
                )
                .setState(
                    if (m.playing) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED,
                    PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
                    if (m.playing) 1f else 0f,
                )
                .build(),
        )
        if (m.playing) {
            wakeLock?.let { if (!it.isHeld) it.acquire(WAKE_LOCK_LIMIT_MS) }
            registerNoisy()
        } else {
            releaseWakeLock()
            unregisterNoisy()
        }
        goForeground(buildNotification(m))
    }

    private fun goForeground(notification: Notification) {
        try {
            val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK else 0
            ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, type)
        } catch (e: RuntimeException) {
            Log.w(TAG, "Could not enter the foreground", e)
        }
    }

    private fun shutDown() {
        releaseWakeLock()
        unregisterNoisy()
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildNotification(m: Model): Notification {
        val open = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val toggle = if (m.playing) {
            NotificationCompat.Action(android.R.drawable.ic_media_pause, getString(R.string.action_pause), action(ACTION_PAUSE, 1))
        } else {
            NotificationCompat.Action(android.R.drawable.ic_media_play, getString(R.string.action_play), action(ACTION_PLAY, 2))
        }
        val stop = NotificationCompat.Action(
            android.R.drawable.ic_menu_close_clear_cancel, getString(R.string.action_stop), action(ACTION_STOP, 3),
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(m.title)
            .setContentText(m.text)
            .setContentIntent(open)
            .setDeleteIntent(action(ACTION_STOP, 3))
            .setOngoing(m.playing)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .addAction(toggle)
            .addAction(stop)
            .setStyle(
                androidx.media.app.NotificationCompat.MediaStyle()
                    .setMediaSession(session.sessionToken)
                    .setShowActionsInCompactView(0, 1),
            )
            .build()
    }

    private fun action(name: String, requestCode: Int): PendingIntent = PendingIntent.getForegroundService(
        this, requestCode,
        Intent(this, PlaybackService::class.java).setAction(name),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    private fun createChannel() {
        val channel = NotificationChannel(CHANNEL_ID, getString(R.string.channel_playback), NotificationManager.IMPORTANCE_LOW).apply {
            description = getString(R.string.channel_playback_desc)
            setShowBadge(false)
        }
        (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
    }

    private fun registerNoisy() {
        if (noisyRegistered) return
        ContextCompat.registerReceiver(
            this, noisyReceiver, IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY), ContextCompat.RECEIVER_NOT_EXPORTED,
        )
        noisyRegistered = true
    }

    private fun unregisterNoisy() {
        if (!noisyRegistered) return
        runCatching { unregisterReceiver(noisyReceiver) }
        noisyRegistered = false
    }

    private fun releaseWakeLock() {
        wakeLock?.let { if (it.isHeld) it.release() }
    }

    companion object {
        const val ACTION_PLAY = "app.bimeong.action.PLAY"
        const val ACTION_PAUSE = "app.bimeong.action.PAUSE"
        const val ACTION_STOP = "app.bimeong.action.STOP"
        private const val CHANNEL_ID = "playback"
        private const val NOTIFICATION_ID = 1
        private const val WAKE_LOCK_LIMIT_MS = 12 * 60 * 60 * 1000L
        private const val TAG = "PlaybackService"
    }
}

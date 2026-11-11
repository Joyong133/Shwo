package app.bimeong

import android.app.Application
import app.bimeong.audio.Player

class BimeongApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Player.init(this)
    }
}

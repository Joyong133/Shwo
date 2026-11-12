package com.shwo.animeshadow

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.view.View
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import org.robolectric.shadows.ShadowLooper
import java.io.File

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = "w411dp-h891dp-xxhdpi")
class UiSmokeTest {

    private fun snap(v: View, name: String) {
        val out = System.getProperty("snapDir") ?: return
        val bmp = Bitmap.createBitmap(v.width.coerceAtLeast(1), v.height.coerceAtLeast(1), Bitmap.Config.ARGB_8888)
        v.draw(Canvas(bmp))
        File(out).mkdirs()
        File(out, "$name.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }

    @Test
    fun mainListShowsAllQuotes() {
        val ctl = Robolectric.buildActivity(MainActivity::class.java).setup()
        val a = ctl.get()
        val rv = a.findViewById<RecyclerView>(R.id.list)
        ShadowLooper.idleMainLooper()
        assertEquals(QuoteRepo.all(a).size, rv.adapter!!.itemCount)
        assertTrue(rv.adapter!!.itemCount >= 150)
        snap(a.window.decorView, "main")
    }

    @Test
    fun practiceScreenWorks() {
        val ctx = ApplicationProvider.getApplicationContext<android.content.Context>()
        val ids = ArrayList(QuoteRepo.all(ctx).map { it.id })
        val intent = Intent(ctx, PracticeActivity::class.java)
            .putStringArrayListExtra(PracticeActivity.EXTRA_IDS, ids)
            .putExtra(PracticeActivity.EXTRA_INDEX, 0)
        val a = Robolectric.buildActivity(PracticeActivity::class.java, intent).setup().get()
        assertEquals("1 / ${ids.size}", a.findViewById<TextView>(R.id.tvCounter).text.toString())
        a.findViewById<View>(R.id.btnNext).performClick()
        assertEquals("2 / ${ids.size}", a.findViewById<TextView>(R.id.tvCounter).text.toString())
        assertEquals("나카마가 이루요", a.findViewById<TextView>(R.id.tvHangul).text.toString())
        snap(a.window.decorView, "practice")
    }
}

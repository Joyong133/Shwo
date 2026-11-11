package app.bimeong.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import kotlin.random.Random

private class Streak(val x: Float, val phase: Float, val speed: Float, val length: Float, val alpha: Float)

/**
 * Faint rain falling behind the content while rain is playing.
 * It only animates while [falling] is true, so a silent or backgrounded app draws nothing.
 */
@Composable
fun RainBackdrop(falling: Boolean, modifier: Modifier = Modifier) {
    val streaks = remember {
        val rnd = Random(7)
        List(46) {
            Streak(
                x = rnd.nextFloat(),
                phase = rnd.nextFloat(),
                speed = 0.35f + rnd.nextFloat() * 0.45f,
                length = 0.035f + rnd.nextFloat() * 0.05f,
                alpha = 0.05f + rnd.nextFloat() * 0.11f,
            )
        }
    }
    var time by remember { mutableFloatStateOf(0f) }
    LaunchedEffect(falling) {
        if (!falling) return@LaunchedEffect
        var last = 0L
        while (true) {
            withFrameNanos { now ->
                if (last != 0L) time += (now - last) / 1e9f
                last = now
            }
        }
    }
    if (!falling) return
    Canvas(modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height
        val slant = w * 0.035f
        for (s in streaks) {
            val p = (s.phase + time * s.speed) % 1f
            val y = p * (h * 1.2f) - h * 0.1f
            val len = s.length * h
            val x = s.x * w - slant * p
            drawLine(
                color = Color(0xFFBFE6FF).copy(alpha = s.alpha),
                start = Offset(x, y),
                end = Offset(x - slant * s.length, y + len),
                strokeWidth = 1.6f * density,
                cap = StrokeCap.Round,
            )
        }
    }
}

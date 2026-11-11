package app.bimeong.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.setProgress
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Slim slider that fits inside a sound tile. Drag or tap anywhere along it.
 *
 * @param min the lowest value the user can reach; the track still spans 0..1
 */
@Composable
fun LevelSlider(
    value: Float,
    onValueChange: (Float) -> Unit,
    color: Color,
    label: String,
    modifier: Modifier = Modifier,
    min: Float = 0f,
    trackHeight: Dp = 4.dp,
    thumbRadius: Dp = 7.dp,
) {
    val change by rememberUpdatedState(onValueChange)
    Canvas(
        modifier
            .height(28.dp)
            .semantics {
                contentDescription = label
                progressBarRangeInfo = ProgressBarRangeInfo(value, min..1f)
                setProgress { target ->
                    change(target.coerceIn(min, 1f))
                    true
                }
            }
            .pointerInput(min) {
                val pad = thumbRadius.toPx()
                detectTapGestures { pos -> change(((pos.x - pad) / (size.width - 2 * pad)).coerceIn(min, 1f)) }
            }
            .pointerInput(min) {
                val pad = thumbRadius.toPx()
                detectHorizontalDragGestures(
                    onDragStart = { pos -> change(((pos.x - pad) / (size.width - 2 * pad)).coerceIn(min, 1f)) },
                ) { input, _ ->
                    input.consume()
                    change(((input.position.x - pad) / (size.width - 2 * pad)).coerceIn(min, 1f))
                }
            },
    ) {
        val pad = thumbRadius.toPx()
        val h = trackHeight.toPx()
        val y = size.height / 2
        val span = size.width - 2 * pad
        val x = pad + span * value.coerceIn(0f, 1f)
        val radius = CornerRadius(h / 2)
        drawRoundRect(color.copy(alpha = 0.22f), Offset(pad, y - h / 2), Size(span, h), radius)
        drawRoundRect(color, Offset(pad, y - h / 2), Size(x - pad, h), radius)
        drawCircle(color, pad, Offset(x, y))
        drawCircle(Color.White.copy(alpha = 0.9f), pad * 0.42f, Offset(x, y))
    }
}

/** 75_000 -> "1:15", 3_725_000 -> "1:02:05". */
fun formatClock(millis: Long): String {
    val total = (millis.coerceAtLeast(0L) + 999L) / 1000L
    val h = total / 3600
    val m = (total % 3600) / 60
    val s = total % 60
    return if (h > 0) "%d:%02d:%02d".format(h, m, s) else "%d:%02d".format(m, s)
}

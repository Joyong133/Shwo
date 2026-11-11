package app.bimeong.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import app.bimeong.data.Mood
import app.bimeong.engine.Category

/** The app is dark only: it is meant to be used in bed and at a desk late at night. */
object Palette {
    val SkyTop = Color(0xFF0E1830)
    val SkyBottom = Color(0xFF070B16)
    val Tile = Color(0xFF131C31)
    val TileBorder = Color(0xFF202C4A)
    val Bar = Color(0xFF18223B)
    val Sheet = Color(0xFF121A2E)
    val Text = Color(0xFFE8EEF9)
    val TextDim = Color(0xFF93A0BD)
    val Primary = Color(0xFF7FD1FF)

    fun accent(category: Category): Color = when (category) {
        Category.RAIN -> Color(0xFF6EC6FF)
        Category.NATURE -> Color(0xFF7EDC9A)
        Category.ASMR -> Color(0xFFFFC078)
        Category.NOISE -> Color(0xFFB8A6FF)
    }

    fun moodColors(mood: Mood?): Pair<Color, Color> = when (mood) {
        Mood.SLEEP -> Color(0xFF2F3F86) to Color(0xFF1A2350)
        Mood.FOCUS -> Color(0xFF1E5F6C) to Color(0xFF123843)
        Mood.REST -> Color(0xFF6B4A2B) to Color(0xFF3A281A)
        null -> Color(0xFF55408A) to Color(0xFF2B2150)
    }
}

@Composable
fun BimeongTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Palette.Primary,
            onPrimary = Color(0xFF05263A),
            secondary = Palette.Primary,
            background = Palette.SkyBottom,
            onBackground = Palette.Text,
            surface = Palette.Sheet,
            onSurface = Palette.Text,
            surfaceVariant = Palette.Tile,
            onSurfaceVariant = Palette.TextDim,
            surfaceContainer = Palette.Sheet,
            surfaceContainerHigh = Palette.Bar,
            surfaceContainerLow = Palette.Sheet,
            outline = Palette.TileBorder,
            outlineVariant = Palette.TileBorder,
        ),
        content = content,
    )
}

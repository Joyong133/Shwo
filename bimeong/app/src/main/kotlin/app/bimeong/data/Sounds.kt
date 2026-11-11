package app.bimeong.data

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Air
import androidx.compose.material.icons.rounded.BeachAccess
import androidx.compose.material.icons.rounded.BlurCircular
import androidx.compose.material.icons.rounded.BlurOn
import androidx.compose.material.icons.rounded.Bolt
import androidx.compose.material.icons.rounded.BubbleChart
import androidx.compose.material.icons.rounded.DirectionsCar
import androidx.compose.material.icons.rounded.Eco
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.Festival
import androidx.compose.material.icons.rounded.FlutterDash
import androidx.compose.material.icons.rounded.Forest
import androidx.compose.material.icons.rounded.Grain
import androidx.compose.material.icons.rounded.Grass
import androidx.compose.material.icons.rounded.Keyboard
import androidx.compose.material.icons.rounded.LocalFireDepartment
import androidx.compose.material.icons.rounded.NightsStay
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Opacity
import androidx.compose.material.icons.rounded.Pets
import androidx.compose.material.icons.rounded.Roofing
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material.icons.rounded.SelfImprovement
import androidx.compose.material.icons.rounded.Shower
import androidx.compose.material.icons.rounded.Tonality
import androidx.compose.material.icons.rounded.Train
import androidx.compose.material.icons.rounded.Water
import androidx.compose.material.icons.rounded.WaterDrop
import androidx.compose.material.icons.rounded.Waves
import androidx.compose.material.icons.rounded.WindPower
import androidx.compose.material.icons.rounded.Window
import androidx.compose.ui.graphics.vector.ImageVector
import app.bimeong.engine.Catalog
import app.bimeong.engine.Category

/** What the user sees for one sound of the engine's catalog. */
class SoundInfo(val id: String, val name: String, val icon: ImageVector) {
    val category: Category = Catalog.sounds[Catalog.indexOf(id)].category
}

object Sounds {
    val all: List<SoundInfo> = listOf(
        SoundInfo("rain_drizzle", "보슬비", Icons.Rounded.Grain),
        SoundInfo("rain_steady", "주룩주룩 비", Icons.Rounded.WaterDrop),
        SoundInfo("rain_heavy", "장대비", Icons.Rounded.Shower),
        SoundInfo("rain_window", "창가의 비", Icons.Rounded.Window),
        SoundInfo("rain_tent", "텐트 위 비", Icons.Rounded.Festival),
        SoundInfo("rain_roof", "양철 지붕", Icons.Rounded.Roofing),
        SoundInfo("rain_umbrella", "우산 속", Icons.Rounded.BeachAccess),
        SoundInfo("rain_leaves", "숲속의 비", Icons.Rounded.Forest),
        SoundInfo("rain_eaves", "처마 낙숫물", Icons.Rounded.Opacity),
        SoundInfo("rain_car", "차 안에서", Icons.Rounded.DirectionsCar),
        SoundInfo("thunder", "먼 천둥", Icons.Rounded.Bolt),

        SoundInfo("waves", "파도", Icons.Rounded.Waves),
        SoundInfo("stream", "시냇물", Icons.Rounded.Water),
        SoundInfo("wind", "바람", Icons.Rounded.Air),
        SoundInfo("fire", "모닥불", Icons.Rounded.LocalFireDepartment),
        SoundInfo("crickets", "풀벌레", Icons.Rounded.Grass),
        SoundInfo("birds", "새소리", Icons.Rounded.FlutterDash),
        SoundInfo("frogs", "개구리", Icons.Rounded.NightsStay),

        SoundInfo("purr", "고양이 골골송", Icons.Rounded.Pets),
        SoundInfo("keyboard", "키보드", Icons.Rounded.Keyboard),
        SoundInfo("pencil", "연필 사각사각", Icons.Rounded.Edit),
        SoundInfo("clock", "시계 초침", Icons.Rounded.Schedule),
        SoundInfo("chimes", "풍경", Icons.Rounded.Notifications),
        SoundInfo("bowl", "싱잉볼", Icons.Rounded.SelfImprovement),
        SoundInfo("heartbeat", "심장 박동", Icons.Rounded.Favorite),
        SoundInfo("train", "밤기차", Icons.Rounded.Train),
        SoundInfo("fan", "선풍기", Icons.Rounded.WindPower),
        SoundInfo("fizz", "탄산 방울", Icons.Rounded.BubbleChart),

        SoundInfo("noise_white", "백색소음", Icons.Rounded.BlurOn),
        SoundInfo("noise_pink", "핑크 노이즈", Icons.Rounded.Tonality),
        SoundInfo("noise_brown", "브라운 노이즈", Icons.Rounded.BlurCircular),
        SoundInfo("noise_green", "그린 노이즈", Icons.Rounded.Eco),
    )

    private val byId = all.associateBy { it.id }

    fun get(id: String): SoundInfo? = byId[id]

    fun title(category: Category): String = when (category) {
        Category.RAIN -> "빗소리"
        Category.NATURE -> "자연"
        Category.ASMR -> "ASMR · 공간"
        Category.NOISE -> "노이즈"
    }

    /** Short description of a mix for the notification and the control bar, e.g. "보슬비 · 모닥불 외 2". */
    fun summary(levels: Map<String, Float>, max: Int = 2): String {
        val names = all.filter { it.id in levels }.map { it.name }
        return when {
            names.isEmpty() -> ""
            names.size <= max -> names.joinToString(" · ")
            else -> names.take(max).joinToString(" · ") + " 외 ${names.size - max}"
        }
    }
}

enum class Mood(val label: String) { SLEEP("수면"), FOCUS("집중"), REST("휴식") }

class Preset(val name: String, val mood: Mood, val levels: Map<String, Float>)

object Presets {
    val all: List<Preset> = listOf(
        Preset("깊은 잠", Mood.SLEEP, mapOf("rain_steady" to 0.6f, "rain_window" to 0.5f, "noise_brown" to 0.45f, "thunder" to 0.3f)),
        Preset("창가에서 집중", Mood.FOCUS, mapOf("rain_window" to 0.65f, "rain_drizzle" to 0.4f, "noise_pink" to 0.3f)),
        Preset("빗속 캠핑", Mood.SLEEP, mapOf("rain_tent" to 0.7f, "rain_leaves" to 0.4f, "wind" to 0.25f)),
        Preset("딥 포커스", Mood.FOCUS, mapOf("noise_brown" to 0.6f, "rain_steady" to 0.45f, "fan" to 0.3f)),
        Preset("모닥불 옆", Mood.REST, mapOf("fire" to 0.7f, "crickets" to 0.35f, "wind" to 0.25f)),
        Preset("비 오는 날 공부", Mood.FOCUS, mapOf("rain_steady" to 0.5f, "pencil" to 0.4f, "clock" to 0.35f)),
        Preset("양철 지붕 아래", Mood.SLEEP, mapOf("rain_roof" to 0.6f, "rain_heavy" to 0.35f, "thunder" to 0.35f)),
        Preset("고양이와 비", Mood.SLEEP, mapOf("purr" to 0.6f, "rain_window" to 0.5f, "rain_steady" to 0.25f)),
        Preset("여름밤 시골", Mood.SLEEP, mapOf("crickets" to 0.5f, "frogs" to 0.35f, "stream" to 0.3f)),
        Preset("파도와 낮잠", Mood.REST, mapOf("waves" to 0.7f, "wind" to 0.2f, "chimes" to 0.25f)),
        Preset("숲속 아침", Mood.REST, mapOf("birds" to 0.5f, "stream" to 0.5f, "wind" to 0.2f)),
        Preset("밤기차", Mood.SLEEP, mapOf("train" to 0.65f, "rain_window" to 0.4f)),
        Preset("차 안의 빗소리", Mood.REST, mapOf("rain_car" to 0.7f, "thunder" to 0.3f)),
        Preset("명상", Mood.REST, mapOf("bowl" to 0.6f, "rain_drizzle" to 0.3f, "chimes" to 0.2f)),
    )

    /** What plays when the user presses play with nothing selected. */
    val default: Preset = all[0]
}

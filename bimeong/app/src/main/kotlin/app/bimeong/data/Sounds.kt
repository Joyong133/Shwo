package app.bimeong.data

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.DirectionsWalk
import androidx.compose.material.icons.automirrored.rounded.MenuBook
import androidx.compose.material.icons.rounded.AcUnit
import androidx.compose.material.icons.rounded.AddRoad
import androidx.compose.material.icons.rounded.Adjust
import androidx.compose.material.icons.rounded.Air
import androidx.compose.material.icons.rounded.Anchor
import androidx.compose.material.icons.rounded.BeachAccess
import androidx.compose.material.icons.rounded.Bedtime
import androidx.compose.material.icons.rounded.BlurCircular
import androidx.compose.material.icons.rounded.BlurOn
import androidx.compose.material.icons.rounded.Bolt
import androidx.compose.material.icons.rounded.Brush
import androidx.compose.material.icons.rounded.BubbleChart
import androidx.compose.material.icons.rounded.ChildCare
import androidx.compose.material.icons.rounded.ContentCut
import androidx.compose.material.icons.rounded.DirectionsCar
import androidx.compose.material.icons.rounded.Dry
import androidx.compose.material.icons.rounded.Eco
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.Festival
import androidx.compose.material.icons.rounded.Flight
import androidx.compose.material.icons.rounded.FlutterDash
import androidx.compose.material.icons.rounded.Forest
import androidx.compose.material.icons.rounded.Grain
import androidx.compose.material.icons.rounded.GraphicEq
import androidx.compose.material.icons.rounded.Grass
import androidx.compose.material.icons.rounded.Groups
import androidx.compose.material.icons.rounded.Headphones
import androidx.compose.material.icons.rounded.Hearing
import androidx.compose.material.icons.rounded.Hotel
import androidx.compose.material.icons.rounded.Keyboard
import androidx.compose.material.icons.rounded.Landscape
import androidx.compose.material.icons.rounded.LocalCafe
import androidx.compose.material.icons.rounded.LocalFireDepartment
import androidx.compose.material.icons.rounded.MusicNote
import androidx.compose.material.icons.rounded.Nightlight
import androidx.compose.material.icons.rounded.NightsStay
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Opacity
import androidx.compose.material.icons.rounded.OutdoorGrill
import androidx.compose.material.icons.rounded.Pets
import androidx.compose.material.icons.rounded.Pool
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material.icons.rounded.RecordVoiceOver
import androidx.compose.material.icons.rounded.RocketLaunch
import androidx.compose.material.icons.rounded.Roofing
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material.icons.rounded.ScubaDiving
import androidx.compose.material.icons.rounded.SelfImprovement
import androidx.compose.material.icons.rounded.Shower
import androidx.compose.material.icons.rounded.SoupKitchen
import androidx.compose.material.icons.rounded.Spa
import androidx.compose.material.icons.rounded.Sports
import androidx.compose.material.icons.rounded.Storm
import androidx.compose.material.icons.rounded.TempleBuddhist
import androidx.compose.material.icons.rounded.Terrain
import androidx.compose.material.icons.rounded.Tonality
import androidx.compose.material.icons.rounded.TouchApp
import androidx.compose.material.icons.rounded.Train
import androidx.compose.material.icons.rounded.Water
import androidx.compose.material.icons.rounded.WaterDrop
import androidx.compose.material.icons.rounded.Waves
import androidx.compose.material.icons.rounded.WbSunny
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
    /** In the order they appear on screen. Every sound of the engine's catalog is listed exactly once. */
    val all: List<SoundInfo> = listOf(
        SoundInfo("rain_drizzle", "보슬비", Icons.Rounded.Grain),
        SoundInfo("rain_steady", "주룩주룩 비", Icons.Rounded.WaterDrop),
        SoundInfo("rain_heavy", "장대비", Icons.Rounded.Storm),
        SoundInfo("rain_window", "창가의 비", Icons.Rounded.Window),
        SoundInfo("rain_tent", "텐트 위 비", Icons.Rounded.Festival),
        SoundInfo("rain_roof", "양철 지붕", Icons.Rounded.Roofing),
        SoundInfo("rain_umbrella", "우산 속", Icons.Rounded.BeachAccess),
        SoundInfo("rain_leaves", "숲속의 비", Icons.Rounded.Forest),
        SoundInfo("rain_eaves", "처마 낙숫물", Icons.Rounded.Opacity),
        SoundInfo("rain_car", "차 안에서", Icons.Rounded.DirectionsCar),
        SoundInfo("rain_road", "빗길 자동차", Icons.Rounded.AddRoad),
        SoundInfo("thunder", "먼 천둥", Icons.Rounded.Bolt),

        SoundInfo("waves", "파도", Icons.Rounded.Waves),
        SoundInfo("stream", "시냇물", Icons.Rounded.Water),
        SoundInfo("waterfall", "폭포", Icons.Rounded.Landscape),
        SoundInfo("lake", "호숫가", Icons.Rounded.Pool),
        SoundInfo("cave", "동굴 물방울", Icons.Rounded.Terrain),
        SoundInfo("underwater", "물속", Icons.Rounded.ScubaDiving),
        SoundInfo("whale", "고래 노래", Icons.Rounded.Anchor),
        SoundInfo("wind", "바람", Icons.Rounded.Air),
        SoundInfo("fire", "모닥불", Icons.Rounded.LocalFireDepartment),
        SoundInfo("birds", "새소리", Icons.Rounded.FlutterDash),
        SoundInfo("cicada", "매미", Icons.Rounded.WbSunny),
        SoundInfo("crickets", "풀벌레", Icons.Rounded.Grass),
        SoundInfo("frogs", "개구리", Icons.Rounded.NightsStay),
        SoundInfo("owl", "부엉이", Icons.Rounded.Nightlight),
        SoundInfo("steps_snow", "눈 밟는 소리", Icons.Rounded.AcUnit),
        SoundInfo("steps_leaves", "낙엽 밟기", Icons.AutoMirrored.Rounded.DirectionsWalk),

        SoundInfo("purr", "고양이 골골송", Icons.Rounded.Pets),
        SoundInfo("keyboard", "키보드", Icons.Rounded.Keyboard),
        SoundInfo("typewriter", "타자기", Icons.Rounded.Print),
        SoundInfo("pencil", "연필 사각사각", Icons.Rounded.Edit),
        SoundInfo("page", "책장 넘기기", Icons.AutoMirrored.Rounded.MenuBook),
        SoundInfo("tapping", "태핑", Icons.Rounded.TouchApp),
        SoundInfo("brushing", "브러싱", Icons.Rounded.Brush),
        SoundInfo("scissors", "가위 소리", Icons.Rounded.ContentCut),
        SoundInfo("clock", "시계 초침", Icons.Rounded.Schedule),
        SoundInfo("heartbeat", "심장 박동", Icons.Rounded.Favorite),
        SoundInfo("fizz", "탄산 방울", Icons.Rounded.BubbleChart),
        SoundInfo("boil", "보글보글", Icons.Rounded.SoupKitchen),
        SoundInfo("sizzle", "지글지글", Icons.Rounded.OutdoorGrill),
        SoundInfo("shower", "샤워", Icons.Rounded.Shower),
        SoundInfo("chimes", "풍경", Icons.Rounded.Notifications),
        SoundInfo("bowl", "싱잉볼", Icons.Rounded.Spa),
        SoundInfo("templebell", "범종", Icons.Rounded.TempleBuddhist),
        SoundInfo("moktak", "목탁", Icons.Rounded.Adjust),
        SoundInfo("musicbox", "오르골", Icons.Rounded.MusicNote),
        SoundInfo("train", "밤기차", Icons.Rounded.Train),
        SoundInfo("airplane", "비행기 기내", Icons.Rounded.Flight),
        SoundInfo("spaceship", "우주선", Icons.Rounded.RocketLaunch),
        SoundInfo("fan", "선풍기", Icons.Rounded.WindPower),
        SoundInfo("dryer", "드라이기", Icons.Rounded.Dry),

        SoundInfo("whisper", "속삭임", Icons.Rounded.Hearing),
        SoundInfo("mouth", "입소리", Icons.Rounded.RecordVoiceOver),
        SoundInfo("hum", "허밍 자장가", Icons.Rounded.Bedtime),
        SoundInfo("shush", "쉬— 소리", Icons.Rounded.ChildCare),
        SoundInfo("breath", "새근새근 숨소리", Icons.Rounded.Hotel),
        SoundInfo("whistle", "휘파람", Icons.Rounded.Sports),
        SoundInfo("choir", "합창", Icons.Rounded.Groups),
        SoundInfo("om", "옴 명상", Icons.Rounded.SelfImprovement),
        SoundInfo("cafe", "카페 수다", Icons.Rounded.LocalCafe),

        SoundInfo("noise_white", "백색소음", Icons.Rounded.BlurOn),
        SoundInfo("noise_pink", "핑크 노이즈", Icons.Rounded.Tonality),
        SoundInfo("noise_brown", "브라운 노이즈", Icons.Rounded.BlurCircular),
        SoundInfo("noise_green", "그린 노이즈", Icons.Rounded.Eco),
        SoundInfo("beat_delta", "델타 비트", Icons.Rounded.Headphones),
        SoundInfo("beat_alpha", "알파 비트", Icons.Rounded.GraphicEq),
    )

    private val byId = all.associateBy { it.id }

    fun get(id: String): SoundInfo? = byId[id]

    fun title(category: Category): String = when (category) {
        Category.RAIN -> "빗소리"
        Category.NATURE -> "자연"
        Category.ASMR -> "ASMR · 생활"
        Category.VOICE -> "목소리"
        Category.NOISE -> "노이즈 · 톤"
    }

    /** One-word name for the filter chips. */
    fun shortTitle(category: Category): String = when (category) {
        Category.RAIN -> "빗소리"
        Category.NATURE -> "자연"
        Category.ASMR -> "ASMR"
        Category.VOICE -> "목소리"
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
        Preset("카페에서 공부", Mood.FOCUS, mapOf("cafe" to 0.55f, "rain_window" to 0.4f)),
        Preset("아기 재우기", Mood.SLEEP, mapOf("shush" to 0.6f, "heartbeat" to 0.45f, "musicbox" to 0.3f)),
        Preset("모닥불 옆", Mood.REST, mapOf("fire" to 0.7f, "crickets" to 0.35f, "wind" to 0.25f)),
        Preset("딥 포커스", Mood.FOCUS, mapOf("noise_brown" to 0.6f, "rain_steady" to 0.45f, "fan" to 0.3f)),
        Preset("비 오는 날 부침개", Mood.REST, mapOf("sizzle" to 0.55f, "rain_steady" to 0.5f, "rain_eaves" to 0.3f)),
        Preset("자장가", Mood.SLEEP, mapOf("hum" to 0.55f, "rain_window" to 0.4f)),
        Preset("도서관", Mood.FOCUS, mapOf("page" to 0.5f, "pencil" to 0.35f, "clock" to 0.3f, "rain_window" to 0.3f)),
        Preset("빗길 드라이브", Mood.REST, mapOf("rain_car" to 0.6f, "rain_road" to 0.5f)),
        Preset("귓가 ASMR", Mood.REST, mapOf("whisper" to 0.6f, "brushing" to 0.4f, "tapping" to 0.3f)),
        Preset("양철 지붕 아래", Mood.SLEEP, mapOf("rain_roof" to 0.6f, "rain_heavy" to 0.35f, "thunder" to 0.35f)),
        Preset("비 오는 날 공부", Mood.FOCUS, mapOf("rain_steady" to 0.5f, "pencil" to 0.4f, "clock" to 0.35f)),
        Preset("고양이와 비", Mood.SLEEP, mapOf("purr" to 0.6f, "rain_window" to 0.5f, "rain_steady" to 0.25f)),
        Preset("산사의 아침", Mood.REST, mapOf("templebell" to 0.5f, "moktak" to 0.4f, "chimes" to 0.3f, "stream" to 0.3f, "birds" to 0.25f)),
        Preset("여름밤 시골", Mood.SLEEP, mapOf("crickets" to 0.5f, "frogs" to 0.35f, "stream" to 0.3f)),
        Preset("한여름 낮", Mood.REST, mapOf("cicada" to 0.45f, "wind" to 0.35f, "stream" to 0.3f)),
        Preset("눈 내리는 밤", Mood.SLEEP, mapOf("fire" to 0.5f, "wind" to 0.35f, "steps_snow" to 0.35f)),
        Preset("깊은 바다", Mood.SLEEP, mapOf("underwater" to 0.6f, "whale" to 0.45f)),
        Preset("파도와 낮잠", Mood.REST, mapOf("waves" to 0.7f, "wind" to 0.2f, "chimes" to 0.25f)),
        Preset("숲속 아침", Mood.REST, mapOf("birds" to 0.5f, "stream" to 0.5f, "wind" to 0.2f)),
        Preset("비행기에서 잠들기", Mood.SLEEP, mapOf("airplane" to 0.7f)),
        Preset("밤기차", Mood.SLEEP, mapOf("train" to 0.65f, "rain_window" to 0.4f)),
        Preset("명상", Mood.REST, mapOf("bowl" to 0.5f, "om" to 0.45f, "choir" to 0.3f)),
    )

    /** What plays when the user presses play with nothing selected. */
    val default: Preset = all[0]
}

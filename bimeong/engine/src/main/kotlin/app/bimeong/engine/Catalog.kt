package app.bimeong.engine

enum class Category { RAIN, NATURE, ASMR, VOICE, NOISE }

/**
 * One selectable sound.
 *
 * @param trim level correction so that every sound is about equally loud at the same slider position
 * @param reverb whether the sound feeds the shared reverb
 */
class SoundDef internal constructor(
    val id: String,
    val category: Category,
    val trim: Float,
    val reverb: Boolean,
    internal val make: (fs: Int, seed: Long) -> Voice,
)

object Catalog {
    val sounds: List<SoundDef> = listOf(
        SoundDef("rain_drizzle", Category.RAIN, 0.2399f, true, ::drizzle),
        SoundDef("rain_steady", Category.RAIN, 0.2915f, true, ::steadyRain),
        SoundDef("rain_heavy", Category.RAIN, 0.2856f, true, ::heavyRain),
        SoundDef("rain_window", Category.RAIN, 0.1972f, false, ::WindowRain),
        SoundDef("rain_tent", Category.RAIN, 0.1799f, false, ::TentRain),
        SoundDef("rain_roof", Category.RAIN, 0.1738f, true, ::TinRoofRain),
        SoundDef("rain_umbrella", Category.RAIN, 0.1429f, false, ::UmbrellaRain),
        SoundDef("rain_leaves", Category.RAIN, 0.3020f, true, ::LeafRain),
        SoundDef("rain_eaves", Category.RAIN, 0.6026f, true, ::EavesDrip),
        SoundDef("rain_car", Category.RAIN, 0.1984f, false, ::CarRain),
        SoundDef("rain_road", Category.RAIN, 0.4406f, false, ::RoadRain),
        SoundDef("thunder", Category.RAIN, 0.3846f, true, ::Thunder),

        SoundDef("waves", Category.NATURE, 0.1928f, false, ::Waves),
        SoundDef("stream", Category.NATURE, 1.8351f, false, ::Stream),
        SoundDef("waterfall", Category.NATURE, 0.2349f, true, ::Waterfall),
        SoundDef("lake", Category.NATURE, 0.2516f, false, ::Lake),
        SoundDef("cave", Category.NATURE, 0.6531f, true, ::CaveDrips),
        SoundDef("underwater", Category.NATURE, 0.3467f, true, ::Underwater),
        SoundDef("whale", Category.NATURE, 0.3311f, true, ::Whale),
        SoundDef("wind", Category.NATURE, 0.2399f, false, ::Wind),
        SoundDef("fire", Category.NATURE, 1.2445f, false, ::Fire),
        SoundDef("birds", Category.NATURE, 0.2586f, true, ::Birds),
        SoundDef("cicada", Category.NATURE, 0.4169f, true, ::Cicada),
        SoundDef("crickets", Category.NATURE, 0.1982f, true, ::Crickets),
        SoundDef("frogs", Category.NATURE, 0.5433f, true, ::Frogs),
        SoundDef("owl", Category.NATURE, 0.2884f, true, ::Owl),
        SoundDef("steps_snow", Category.NATURE, 0.8610f, false, { fs, seed -> Footsteps(fs, seed, snow = true) }),
        SoundDef("steps_leaves", Category.NATURE, 0.5370f, false, { fs, seed -> Footsteps(fs, seed, snow = false) }),

        SoundDef("purr", Category.ASMR, 3.1261f, false, ::Purr),
        SoundDef("keyboard", Category.ASMR, 0.4217f, false, ::Keyboard),
        SoundDef("typewriter", Category.ASMR, 0.2630f, true, ::Typewriter),
        SoundDef("pencil", Category.ASMR, 0.4821f, false, ::Pencil),
        SoundDef("page", Category.ASMR, 0.6531f, false, ::PageTurn),
        SoundDef("tapping", Category.ASMR, 0.3428f, false, ::Tapping),
        SoundDef("brushing", Category.ASMR, 1.2259f, false, ::Brushing),
        SoundDef("scissors", Category.ASMR, 0.4519f, false, ::Scissors),
        SoundDef("clock", Category.ASMR, 0.2851f, true, ::Clock),
        SoundDef("heartbeat", Category.ASMR, 0.8222f, false, ::Heartbeat),
        SoundDef("fizz", Category.ASMR, 1.6132f, false, ::Fizz),
        SoundDef("boil", Category.ASMR, 1.0172f, false, ::Boil),
        SoundDef("sizzle", Category.ASMR, 0.1660f, false, ::Sizzle),
        SoundDef("shower", Category.ASMR, 0.2464f, true, ::Shower),
        SoundDef("chimes", Category.ASMR, 0.9661f, true, ::Chimes),
        SoundDef("bowl", Category.ASMR, 1.3804f, true, { fs, seed -> Bowl(fs, seed) }),
        SoundDef("templebell", Category.ASMR, 1.0839f, true, ::TempleBell),
        SoundDef("moktak", Category.ASMR, 0.3981f, true, ::Moktak),
        SoundDef("musicbox", Category.ASMR, 0.5487f, true, ::MusicBox),
        SoundDef("train", Category.ASMR, 0.5821f, false, ::Train),
        SoundDef("airplane", Category.ASMR, 0.3083f, false, ::Airplane),
        SoundDef("spaceship", Category.ASMR, 0.6502f, false, ::Spaceship),
        SoundDef("fan", Category.ASMR, 0.2469f, false, ::Fan),
        SoundDef("dryer", Category.ASMR, 0.2615f, false, ::HairDryer),

        SoundDef("whisper", Category.VOICE, 1.5279f, false, ::Whisper),
        SoundDef("mouth", Category.VOICE, 0.3467f, false, ::MouthSounds),
        SoundDef("hum", Category.VOICE, 0.0861f, true, ::Hum),
        SoundDef("shush", Category.VOICE, 1.2400f, false, ::Shush),
        SoundDef("breath", Category.VOICE, 0.8557f, false, ::Breath),
        SoundDef("whistle", Category.VOICE, 0.1947f, true, ::Whistle),
        SoundDef("choir", Category.VOICE, 0.4020f, true, ::Choir),
        SoundDef("om", Category.VOICE, 0.3644f, true, ::Om),
        SoundDef("cafe", Category.VOICE, 0.8202f, true, ::Cafe),

        SoundDef("noise_white", Category.NOISE, 0.2207f, false, { fs, seed -> ColorNoise(fs, seed, ColorNoise.Kind.WHITE) }),
        SoundDef("noise_pink", Category.NOISE, 0.1620f, false, { fs, seed -> ColorNoise(fs, seed, ColorNoise.Kind.PINK) }),
        SoundDef("noise_brown", Category.NOISE, 0.2568f, false, { fs, seed -> ColorNoise(fs, seed, ColorNoise.Kind.BROWN) }),
        SoundDef("noise_green", Category.NOISE, 0.2286f, false, { fs, seed -> ColorNoise(fs, seed, ColorNoise.Kind.GREEN) }),
        SoundDef("beat_delta", Category.NOISE, 0.5012f, false, { fs, _ -> Binaural(fs, 100f, 2f) }),
        SoundDef("beat_alpha", Category.NOISE, 0.3981f, false, { fs, _ -> Binaural(fs, 200f, 10f) }),
    )

    private val byId: Map<String, Int> = sounds.withIndex().associate { it.value.id to it.index }

    fun indexOf(id: String): Int = byId[id] ?: -1
}

package app.bimeong.engine

enum class Category { RAIN, NATURE, ASMR, NOISE }

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
        SoundDef("rain_drizzle", Category.RAIN, 0.2891f, false, ::drizzle),
        SoundDef("rain_steady", Category.RAIN, 0.3337f, false, ::steadyRain),
        SoundDef("rain_heavy", Category.RAIN, 0.3163f, false, ::heavyRain),
        SoundDef("rain_window", Category.RAIN, 0.2851f, false, ::WindowRain),
        SoundDef("rain_tent", Category.RAIN, 0.2661f, false, ::TentRain),
        SoundDef("rain_roof", Category.RAIN, 0.2317f, false, ::TinRoofRain),
        SoundDef("rain_umbrella", Category.RAIN, 0.2786f, false, ::UmbrellaRain),
        SoundDef("rain_leaves", Category.RAIN, 0.4022f, false, ::LeafRain),
        SoundDef("rain_eaves", Category.RAIN, 0.7586f, true, ::EavesDrip),
        SoundDef("rain_car", Category.RAIN, 0.3863f, false, ::CarRain),
        SoundDef("thunder", Category.RAIN, 0.3846f, true, ::Thunder),

        SoundDef("waves", Category.NATURE, 0.2113f, false, ::Waves),
        SoundDef("stream", Category.NATURE, 1.8351f, false, ::Stream),
        SoundDef("wind", Category.NATURE, 0.3126f, false, ::Wind),
        SoundDef("fire", Category.NATURE, 1.3804f, false, ::Fire),
        SoundDef("crickets", Category.NATURE, 0.1959f, true, ::Crickets),
        SoundDef("birds", Category.NATURE, 0.2208f, true, ::Birds),
        SoundDef("frogs", Category.NATURE, 0.6026f, true, ::Frogs),

        SoundDef("purr", Category.ASMR, 3.1623f, false, ::Purr),
        SoundDef("keyboard", Category.ASMR, 0.3162f, false, ::Keyboard),
        SoundDef("pencil", Category.ASMR, 0.4821f, false, ::Pencil),
        SoundDef("clock", Category.ASMR, 0.2851f, true, ::Clock),
        SoundDef("chimes", Category.ASMR, 1.0839f, true, ::Chimes),
        SoundDef("bowl", Category.ASMR, 1.3804f, true, { fs, seed -> Bowl(fs, seed) }),
        SoundDef("heartbeat", Category.ASMR, 0.8222f, false, ::Heartbeat),
        SoundDef("train", Category.ASMR, 0.5821f, false, ::Train),
        SoundDef("fan", Category.ASMR, 0.2469f, false, ::Fan),
        SoundDef("fizz", Category.ASMR, 1.6132f, false, ::Fizz),

        SoundDef("noise_white", Category.NOISE, 0.2207f, false, { fs, seed -> ColorNoise(fs, seed, ColorNoise.Kind.WHITE) }),
        SoundDef("noise_pink", Category.NOISE, 0.1620f, false, { fs, seed -> ColorNoise(fs, seed, ColorNoise.Kind.PINK) }),
        SoundDef("noise_brown", Category.NOISE, 0.2585f, false, { fs, seed -> ColorNoise(fs, seed, ColorNoise.Kind.BROWN) }),
        SoundDef("noise_green", Category.NOISE, 0.2286f, false, { fs, seed -> ColorNoise(fs, seed, ColorNoise.Kind.GREEN) }),
    )

    private val byId: Map<String, Int> = sounds.withIndex().associate { it.value.id to it.index }

    fun indexOf(id: String): Int = byId[id] ?: -1
}

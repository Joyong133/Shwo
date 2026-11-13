package app.bimeong

import androidx.test.ext.junit.runners.AndroidJUnit4
import app.bimeong.data.Presets
import app.bimeong.data.Sounds
import app.bimeong.engine.Catalog
import app.bimeong.engine.Category
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config

@RunWith(AndroidJUnit4::class)
@Config(sdk = [35])
class SoundsTest {
    @Test
    fun everyEngineSoundHasANameAndIconAndNothingElseIsListed() {
        assertEquals(Catalog.sounds.map { it.id }.toSet(), Sounds.all.map { it.id }.toSet())
        assertEquals(Sounds.all.size, Sounds.all.map { it.id }.toSet().size)
        assertEquals(Sounds.all.size, Sounds.all.map { it.name }.toSet().size)
    }

    @Test
    fun everyCategoryHasSounds() {
        for (category in Category.entries) assertTrue(Sounds.all.any { it.category == category })
    }

    @Test
    fun presetsOnlyUseSoundsThatExist() {
        assertEquals(Presets.all.size, Presets.all.map { it.name }.toSet().size)
        for (preset in Presets.all) {
            assertTrue(preset.name, preset.levels.isNotEmpty())
            for ((id, level) in preset.levels) {
                assertTrue("${preset.name}: $id", Catalog.indexOf(id) >= 0)
                assertTrue("${preset.name}: $id", level > 0f && level <= 1f)
            }
        }
    }

    @Test
    fun summaryNamesTheFirstFewSounds() {
        assertEquals("", Sounds.summary(emptyMap()))
        assertEquals("속삭임", Sounds.summary(mapOf("whisper" to 0.5f)))
        assertEquals("보슬비 · 모닥불 외 1", Sounds.summary(mapOf("fire" to 0.5f, "whisper" to 0.5f, "rain_drizzle" to 0.5f)))
    }
}

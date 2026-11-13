package app.bimeong.ui

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Bookmark
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Timer
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.layout
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.bimeong.audio.Player
import app.bimeong.audio.PlayerState
import app.bimeong.audio.SavedMix
import app.bimeong.data.Mood
import app.bimeong.data.Preset
import app.bimeong.data.Presets
import app.bimeong.data.SoundInfo
import app.bimeong.data.Sounds
import app.bimeong.engine.Category

/** Everything the screen can ask the player to do. Lets the screen be rendered without a real player. */
interface PlayerActions {
    fun toggle(id: String)
    fun setLevel(id: String, level: Float)
    fun setMaster(value: Float)
    fun setWarmth(value: Float)
    fun setMixWithOthers(enabled: Boolean)
    fun playPause()
    fun clear()
    fun applyMix(levels: Map<String, Float>)
    fun saveMix(name: String)
    fun deleteMix(name: String)
    fun startSleepTimer(minutes: Int)
    fun cancelSleepTimer()
    fun startFocus(focusMin: Int, breakMin: Int)
    fun stopFocus()
}

private val Side = 16.dp

@Composable
fun MainScreen(state: PlayerState, now: Long, actions: PlayerActions, animateBackdrop: Boolean = true) {
    var showTimer by rememberSaveable { mutableStateOf(false) }
    var showTune by rememberSaveable { mutableStateOf(false) }
    var filter by rememberSaveable { mutableStateOf(FILTER_ALL) }
    var deleting by remember { mutableStateOf<SavedMix?>(null) }
    val bars = WindowInsets.systemBars.asPaddingValues()
    val raining = state.playing && state.levels.keys.any { it.startsWith("rain_") }

    Box(
        Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Palette.SkyTop, Palette.SkyBottom))),
    ) {
        RainBackdrop(falling = raining && animateBackdrop)

        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 104.dp),
            contentPadding = PaddingValues(
                start = Side, end = Side,
                top = bars.calculateTopPadding() + 12.dp,
                bottom = bars.calculateBottomPadding() + 124.dp,
            ),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize(),
        ) {
            item(span = { GridItemSpan(maxLineSpan) }, key = "header") {
                Header(state, now, onTimer = { showTimer = true })
            }
            item(span = { GridItemSpan(maxLineSpan) }, key = "mixes") {
                MixRow(
                    state = state,
                    onPreset = { actions.applyMix(it.levels) },
                    onSaved = { actions.applyMix(it.levels) },
                    onSavedLongPress = { deleting = it },
                    modifier = Modifier.bleed(Side),
                )
            }
            item(span = { GridItemSpan(maxLineSpan) }, key = "filters") {
                FilterRow(filter, state.levels.size, onSelect = { filter = it }, modifier = Modifier.bleed(Side))
            }
            if (filter == FILTER_ON) {
                // Everything that is switched on, gathered in one place.
                val sounds = Sounds.all.filter { it.id in state.levels }
                if (sounds.isEmpty()) {
                    item(span = { GridItemSpan(maxLineSpan) }, key = "none") {
                        Text("켜진 소리가 없어요. 다른 분류에서 소리를 골라 보세요.", color = Palette.TextDim, fontSize = 14.sp, modifier = Modifier.padding(vertical = 24.dp))
                    }
                }
                items(sounds, key = { it.id }) { sound ->
                    SoundTile(sound, state.levels[sound.id], onToggle = { actions.toggle(sound.id) }, onLevel = { actions.setLevel(sound.id, it) })
                }
            } else {
                for (category in Category.entries) {
                    if (filter != FILTER_ALL && filter != category.name) continue
                    val sounds = Sounds.all.filter { it.category == category }
                    item(span = { GridItemSpan(maxLineSpan) }, key = "title-$category") {
                        SectionTitle(Sounds.title(category), sounds.count { it.id in state.levels }, Palette.accent(category))
                    }
                    items(sounds, key = { it.id }) { sound ->
                        SoundTile(sound, state.levels[sound.id], onToggle = { actions.toggle(sound.id) }, onLevel = { actions.setLevel(sound.id, it) })
                    }
                }
            }
        }

        // The grid fades out underneath the control bar instead of being cut off by it.
        Box(
            Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(bars.calculateBottomPadding() + 150.dp)
                .background(Brush.verticalGradient(listOf(Color.Transparent, Palette.SkyBottom.copy(alpha = 0.92f), Palette.SkyBottom))),
        )

        ControlBar(
            state = state,
            actions = actions,
            onTune = { showTune = true },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(start = 12.dp, end = 12.dp, bottom = bars.calculateBottomPadding() + 12.dp),
        )
    }

    if (showTimer) TimerSheet(state, now, actions, onDismiss = { showTimer = false })
    if (showTune) TuneSheet(state, actions, onDismiss = { showTune = false })
    deleting?.let { mix ->
        AlertDialog(
            onDismissRequest = { deleting = null },
            title = { Text("믹스 삭제") },
            text = { Text("'${mix.name}' 믹스를 삭제할까요?") },
            confirmButton = {
                TextButton(onClick = {
                    actions.deleteMix(mix.name)
                    deleting = null
                }) { Text("삭제") }
            },
            dismissButton = { TextButton(onClick = { deleting = null }) { Text("취소") } },
        )
    }
}

/** Lets a row scroll edge to edge although the grid around it is padded. */
private fun Modifier.bleed(side: Dp) = layout { measurable, constraints ->
    val extra = side.roundToPx() * 2
    val placeable = measurable.measure(constraints.copy(minWidth = 0, maxWidth = constraints.maxWidth + extra))
    layout(constraints.maxWidth, placeable.height) { placeable.place(-extra / 2, 0) }
}

@Composable
private fun Header(state: PlayerState, now: Long, onTimer: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(top = 4.dp, bottom = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text("비멍", color = Palette.Text, fontSize = 30.sp, fontWeight = FontWeight.Bold)
            Text("빗소리에 멍하니, 잠도 집중도 깊게", color = Palette.TextDim, fontSize = 13.sp)
        }
        val focus = state.focus
        val label = when {
            state.sleepEndsAt != 0L -> formatClock(state.sleepEndsAt - now)
            focus != null -> (if (focus.onBreak) "휴식 " else "집중 ") + formatClock(focus.endsAt - now)
            else -> "타이머"
        }
        val running = state.sleepEndsAt != 0L || focus != null
        Row(
            Modifier
                .clip(RoundedCornerShape(50))
                .background(if (running) Palette.Primary.copy(alpha = 0.18f) else Palette.Tile)
                .border(1.dp, if (running) Palette.Primary.copy(alpha = 0.6f) else Palette.TileBorder, RoundedCornerShape(50))
                .clickable(role = Role.Button, onClickLabel = "타이머 설정", onClick = onTimer)
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Rounded.Timer, contentDescription = null, tint = if (running) Palette.Primary else Palette.TextDim, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(6.dp))
            Text(label, color = if (running) Palette.Primary else Palette.Text, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun MixRow(
    state: PlayerState,
    onPreset: (Preset) -> Unit,
    onSaved: (SavedMix) -> Unit,
    onSavedLongPress: (SavedMix) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier) {
        Text(
            "추천 믹스", color = Palette.Text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(start = Side, top = 6.dp, bottom = 10.dp),
        )
        LazyRow(contentPadding = PaddingValues(horizontal = Side), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            items(state.saved, key = { "saved-${it.name}" }) { mix ->
                MixCard(
                    name = mix.name, tag = "내 믹스", mood = null, levels = mix.levels,
                    selected = state.levels == mix.levels,
                    modifier = Modifier.combinedClickable(
                        role = Role.Button,
                        onLongClickLabel = "삭제",
                        onLongClick = { onSavedLongPress(mix) },
                        onClick = { onSaved(mix) },
                    ),
                )
            }
            items(Presets.all, key = { it.name }) { preset ->
                MixCard(
                    name = preset.name, tag = preset.mood.label, mood = preset.mood, levels = preset.levels,
                    selected = state.levels == preset.levels,
                    modifier = Modifier.clickable(role = Role.Button) { onPreset(preset) },
                )
            }
        }
    }
}

@Composable
private fun MixCard(name: String, tag: String, mood: Mood?, levels: Map<String, Float>, selected: Boolean, modifier: Modifier = Modifier) {
    val (from, to) = Palette.moodColors(mood)
    val shape = RoundedCornerShape(20.dp)
    Column(
        Modifier
            .size(width = 150.dp, height = 96.dp)
            .clip(shape)
            .background(Brush.linearGradient(listOf(from, to)))
            .border(1.5.dp, if (selected) Color.White.copy(alpha = 0.85f) else Color.White.copy(alpha = 0.08f), shape)
            .then(modifier)
            .padding(horizontal = 14.dp, vertical = 12.dp)
            .semantics { if (selected) stateDescription = "선택됨" },
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (mood == null) {
                Icon(Icons.Rounded.Bookmark, contentDescription = null, tint = Color.White.copy(alpha = 0.75f), modifier = Modifier.size(13.dp))
                Spacer(Modifier.width(3.dp))
            }
            Text(tag, color = Color.White.copy(alpha = 0.75f), fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
        Spacer(Modifier.height(2.dp))
        Text(name, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Spacer(Modifier.weight(1f))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            for (sound in Sounds.all.filter { it.id in levels }.take(5)) {
                Icon(sound.icon, contentDescription = sound.name, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(16.dp))
            }
        }
    }
}

private const val FILTER_ALL = "all"
private const val FILTER_ON = "on"

/** Chips that narrow the long list down to one kind of sound, or to what is switched on right now. */
@Composable
private fun FilterRow(selected: String, activeCount: Int, onSelect: (String) -> Unit, modifier: Modifier = Modifier) {
    LazyRow(
        modifier = modifier.padding(top = 14.dp),
        contentPadding = PaddingValues(horizontal = Side),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item(key = FILTER_ALL) { FilterChip("전체", selected == FILTER_ALL, Palette.Primary) { onSelect(FILTER_ALL) } }
        if (activeCount > 0 || selected == FILTER_ON) {
            item(key = FILTER_ON) { FilterChip("켜짐 $activeCount", selected == FILTER_ON, Palette.Primary) { onSelect(FILTER_ON) } }
        }
        items(Category.entries, key = { it.name }) { category ->
            FilterChip(Sounds.shortTitle(category), selected == category.name, Palette.accent(category)) { onSelect(category.name) }
        }
    }
}

@Composable
private fun FilterChip(text: String, selected: Boolean, accent: Color, onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Text(
        text,
        color = if (selected) accent else Palette.Text,
        fontSize = 14.sp,
        fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
        modifier = Modifier
            .clip(shape)
            .background(if (selected) accent.copy(alpha = 0.18f) else Palette.Tile)
            .border(1.dp, if (selected) accent.copy(alpha = 0.65f) else Palette.TileBorder, shape)
            .clickable(role = Role.Tab, onClick = onClick)
            .semantics { if (selected) stateDescription = "선택됨" }
            .padding(horizontal = 14.dp, vertical = 8.dp),
    )
}

@Composable
private fun SectionTitle(title: String, active: Int, accent: Color) {
    Row(Modifier.padding(top = 14.dp, bottom = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(8.dp).clip(CircleShape).background(accent))
        Spacer(Modifier.width(8.dp))
        Text(title, color = Palette.Text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
        if (active > 0) {
            Spacer(Modifier.width(8.dp))
            Text("${active}개 켜짐", color = accent, fontSize = 12.sp, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun SoundTile(sound: SoundInfo, level: Float?, onToggle: () -> Unit, onLevel: (Float) -> Unit) {
    val on = level != null
    val accent = Palette.accent(sound.category)
    val shape = RoundedCornerShape(20.dp)
    Column(
        Modifier
            .fillMaxWidth()
            .height(112.dp)
            .clip(shape)
            .background(if (on) accent.copy(alpha = 0.15f) else Palette.Tile.copy(alpha = 0.92f))
            .border(1.dp, if (on) accent.copy(alpha = 0.65f) else Palette.TileBorder, shape)
            .clickable(role = Role.Switch, onClick = onToggle)
            .semantics { stateDescription = if (on) "켜짐" else "꺼짐" }
            .padding(start = 8.dp, end = 8.dp, top = 14.dp, bottom = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(sound.icon, contentDescription = null, tint = if (on) accent else Palette.TextDim, modifier = Modifier.size(30.dp))
        Spacer(Modifier.height(8.dp))
        Text(
            sound.name,
            color = if (on) Palette.Text else Palette.TextDim,
            fontSize = 12.5.sp,
            fontWeight = if (on) FontWeight.SemiBold else FontWeight.Normal,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Spacer(Modifier.weight(1f))
        if (level != null) {
            LevelSlider(
                value = level, onValueChange = onLevel, color = accent, min = Player.MIN_LEVEL,
                label = "${sound.name} 음량", modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
private fun ControlBar(state: PlayerState, actions: PlayerActions, onTune: () -> Unit, modifier: Modifier = Modifier) {
    val shape = RoundedCornerShape(30.dp)
    Row(
        modifier
            .fillMaxWidth()
            .clip(shape)
            .background(Palette.Bar)
            .border(1.dp, Color.White.copy(alpha = 0.10f), shape)
            // Swallow taps so they do not fall through to the tiles underneath.
            .clickable(enabled = false) {}
            .padding(start = 12.dp, end = 4.dp, top = 12.dp, bottom = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(Brush.linearGradient(listOf(Color(0xFF9BDCFF), Color(0xFF4FA8E8))))
                .clickable(role = Role.Button, onClick = actions::playPause)
                .semantics { contentDescription = if (state.playing) "일시정지" else "재생" },
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                if (state.playing) Icons.Rounded.Pause else Icons.Rounded.PlayArrow,
                contentDescription = null, tint = Color(0xFF062338), modifier = Modifier.size(34.dp),
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            val count = state.levels.size
            Text(
                text = when {
                    count == 0 -> "소리를 골라 나만의 빗소리를 만들어 보세요"
                    state.playing -> "${count}개 재생 중 · ${Sounds.summary(state.levels)}"
                    else -> "${count}개 선택됨 · ${Sounds.summary(state.levels)}"
                },
                color = if (count == 0) Palette.TextDim else Palette.Text,
                fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(start = 2.dp),
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.AutoMirrored.Rounded.VolumeUp, contentDescription = null, tint = Palette.TextDim, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(2.dp))
                LevelSlider(
                    value = state.master, onValueChange = actions::setMaster, color = Palette.Primary,
                    label = "전체 음량", modifier = Modifier.weight(1f), trackHeight = 5.dp, thumbRadius = 9.dp,
                )
            }
        }
        IconButton(onClick = onTune) {
            Icon(Icons.Rounded.Tune, contentDescription = "소리 조절", tint = Palette.Text)
        }
    }
}

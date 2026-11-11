package app.bimeong.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.bimeong.audio.PlayerState

private val sleepChoices = listOf(15 to "15분", 30 to "30분", 45 to "45분", 60 to "1시간", 90 to "1시간 30분", 120 to "2시간", 180 to "3시간")
private val focusChoices = listOf(15, 25, 45, 50)
private val breakChoices = listOf(5, 10, 15)

@Composable
private fun Pill(text: String, selected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val shape = RoundedCornerShape(50)
    Text(
        text,
        color = if (selected) Palette.Primary else Palette.Text,
        fontSize = 14.sp,
        fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
        modifier = modifier
            .clip(shape)
            .background(if (selected) Palette.Primary.copy(alpha = 0.18f) else Palette.Tile)
            .border(1.dp, if (selected) Palette.Primary.copy(alpha = 0.65f) else Palette.TileBorder, shape)
            .clickable(role = Role.RadioButton, onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 10.dp),
    )
}

@Composable
private fun SheetTitle(text: String) {
    Text(text, color = Palette.Text, fontSize = 20.sp, fontWeight = FontWeight.Bold)
}

@Composable
private fun Caption(text: String) {
    Text(text, color = Palette.TextDim, fontSize = 13.sp, lineHeight = 19.sp)
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun TimerSheet(state: PlayerState, now: Long, actions: PlayerActions, onDismiss: () -> Unit) {
    var tab by rememberSaveable { mutableIntStateOf(if (state.focus != null && state.sleepEndsAt == 0L) 1 else 0) }
    var focusMin by rememberSaveable { mutableIntStateOf(25) }
    var breakMin by rememberSaveable { mutableIntStateOf(5) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = Palette.Sheet,
    ) {
        Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(horizontal = 20.dp).padding(bottom = 20.dp)) {
            SheetTitle("타이머")
            Spacer(Modifier.height(14.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Pill("수면 타이머", tab == 0, { tab = 0 })
                Pill("집중 타이머", tab == 1, { tab = 1 })
            }
            Spacer(Modifier.height(18.dp))

            if (tab == 0) {
                val running = state.sleepEndsAt != 0L
                if (running) {
                    Text(formatClock(state.sleepEndsAt - now), color = Palette.Primary, fontSize = 44.sp, fontWeight = FontWeight.Light)
                    Caption("뒤에 소리가 서서히 작아지며 꺼져요.")
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = actions::cancelSleepTimer) { Text("타이머 끄기") }
                } else {
                    Caption("설정한 시간이 지나면 마지막 1분 동안 소리가 서서히 작아지며 꺼져요.")
                }
                Spacer(Modifier.height(16.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    for ((minutes, label) in sleepChoices) {
                        Pill(label, selected = false, onClick = {
                            actions.startSleepTimer(minutes)
                        })
                    }
                }
            } else {
                val focus = state.focus
                if (focus != null) {
                    Text(
                        if (focus.onBreak) "쉬는 시간" else "${focus.round}번째 집중",
                        color = Palette.Text, fontSize = 15.sp, fontWeight = FontWeight.Medium,
                    )
                    Text(formatClock(focus.endsAt - now), color = Palette.Primary, fontSize = 44.sp, fontWeight = FontWeight.Light)
                    Caption("집중 ${focus.focusMin}분 · 휴식 ${focus.breakMin}분. 바뀔 때마다 종소리가 울려요.")
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = actions::stopFocus) { Text("그만하기") }
                } else {
                    Caption("집중 시간과 쉬는 시간이 끝날 때마다 부드러운 종소리로 알려드려요.")
                    Spacer(Modifier.height(16.dp))
                    Text("집중", color = Palette.Text, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        for (m in focusChoices) Pill("${m}분", focusMin == m, { focusMin = m })
                    }
                    Spacer(Modifier.height(14.dp))
                    Text("휴식", color = Palette.Text, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        for (m in breakChoices) Pill("${m}분", breakMin == m, { breakMin = m })
                    }
                    Spacer(Modifier.height(18.dp))
                    Button(onClick = { actions.startFocus(focusMin, breakMin) }, modifier = Modifier.fillMaxWidth()) {
                        Text("집중 시작", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TuneSheet(state: PlayerState, actions: PlayerActions, onDismiss: () -> Unit) {
    var saving by rememberSaveable { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = Palette.Sheet,
    ) {
        Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(horizontal = 20.dp).padding(bottom = 20.dp)) {
            SheetTitle("소리 조절")
            Spacer(Modifier.height(18.dp))

            Text("포근함", color = Palette.Text, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            Caption("날카로운 고음을 덜어내 밤에도 편안하게 들려요.")
            LevelSlider(
                value = state.warmth, onValueChange = actions::setWarmth, color = Palette.Primary,
                label = "포근함", modifier = Modifier.fillMaxWidth(), trackHeight = 5.dp, thumbRadius = 9.dp,
            )
            Row(Modifier.fillMaxWidth()) {
                Text("선명하게", color = Palette.TextDim, fontSize = 12.sp)
                Spacer(Modifier.weight(1f))
                Text("포근하게", color = Palette.TextDim, fontSize = 12.sp)
            }

            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("다른 앱 소리와 함께 재생", color = Palette.Text, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    Caption("음악이나 팟캐스트를 틀어도 멈추지 않아요.")
                }
                Spacer(Modifier.width(12.dp))
                Switch(
                    checked = state.mixWithOthers,
                    onCheckedChange = actions::setMixWithOthers,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Palette.SkyBottom,
                        checkedTrackColor = Palette.Primary,
                        uncheckedThumbColor = Palette.TextDim,
                        uncheckedTrackColor = Palette.Tile,
                        uncheckedBorderColor = Palette.TextDim,
                    ),
                )
            }

            Spacer(Modifier.height(22.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FilledTonalButton(
                    onClick = { saving = true },
                    enabled = state.levels.isNotEmpty(),
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = Palette.Primary.copy(alpha = 0.2f),
                        contentColor = Palette.Primary,
                    ),
                    modifier = Modifier.weight(1f),
                ) {
                    Text("지금 믹스 저장")
                }
                OutlinedButton(
                    onClick = {
                        actions.clear()
                        onDismiss()
                    },
                    enabled = state.levels.isNotEmpty(),
                    modifier = Modifier.weight(1f),
                ) {
                    Text("모두 끄기")
                }
            }
            Spacer(Modifier.height(16.dp))
            Caption("모든 소리는 녹음 파일이 아니라 기기 안에서 실시간으로 만들어져요. 그래서 같은 구간이 반복되지 않고, 인터넷도 필요 없어요.")
        }
    }

    if (saving) {
        var name by rememberSaveable { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { saving = false },
            title = { Text("믹스 저장") },
            text = {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it.take(20) },
                    singleLine = true,
                    label = { Text("이름") },
                    placeholder = { Text("예: 나의 빗소리") },
                )
            },
            confirmButton = {
                TextButton(
                    enabled = name.isNotBlank(),
                    onClick = {
                        actions.saveMix(name)
                        saving = false
                        onDismiss()
                    },
                ) { Text("저장") }
            },
            dismissButton = { TextButton(onClick = { saving = false }) { Text("취소") } },
        )
    }
}

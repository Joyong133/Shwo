package com.shwo.animeshadow

import android.content.Context
import org.json.JSONArray

data class Quote(
    val id: String,
    val anime: String,
    val who: String,
    val jp: String,
    val kana: String,
    val ko: String,
    val tts: String?,
) {
    /** 한글 발음 표기 (히라가나 읽기에서 자동 변환) */
    val hangul: String by lazy { KanaHangul.toHangul(kana) }

    /** 원문에 한자가 없으면 히라가나 읽기를 따로 보여줄 필요가 없음 */
    val needsReading: Boolean by lazy {
        Scorer.normalize(jp).text != Scorer.normalize(kana).text
    }

    /** 1=초급, 2=중급, 3=고급 */
    val level: Int by lazy {
        val n = kana.count { !it.isWhitespace() }
        when {
            n <= 7 -> 1
            n <= 17 -> 2
            else -> 3
        }
    }

    val speakText: String get() = tts ?: jp
}

object QuoteRepo {
    @Volatile private var cache: List<Quote>? = null

    fun all(ctx: Context): List<Quote> = cache ?: synchronized(this) {
        cache ?: load(ctx).also { cache = it }
    }

    fun byId(ctx: Context): Map<String, Quote> = all(ctx).associateBy { it.id }

    private fun load(ctx: Context): List<Quote> {
        val json = ctx.assets.open("quotes.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
        val arr = JSONArray(json)
        return List(arr.length()) { i ->
            val o = arr.getJSONObject(i)
            Quote(
                id = o.getString("id"),
                anime = o.getString("anime"),
                who = o.getString("who"),
                jp = o.getString("jp"),
                kana = o.getString("kana"),
                ko = o.getString("ko"),
                tts = if (o.has("tts")) o.getString("tts") else null,
            )
        }
    }
}

fun levelLabel(level: Int) = when (level) {
    1 -> "초급"
    2 -> "중급"
    else -> "고급"
}

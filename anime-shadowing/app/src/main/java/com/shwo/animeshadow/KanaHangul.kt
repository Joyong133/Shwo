package com.shwo.animeshadow

/**
 * 히라가나/가타카나 → 한글 발음 표기 변환.
 * 한글 음절 = 0xAC00 + (초성 * 21 + 중성) * 28 + 종성
 */
object KanaHangul {
    private const val SPEC = """
あ 11 0|い 11 20|う 11 13|え 11 5|お 11 8|
か 15 0|き 15 20|く 15 13|け 15 5|こ 15 8|
が 0 0|ぎ 0 20|ぐ 0 13|げ 0 5|ご 0 8|
さ 9 0|し 9 20|す 9 18|せ 9 5|そ 9 8|
ざ 12 0|じ 12 20|ず 12 18|ぜ 12 5|ぞ 12 8|
た 16 0|ち 14 20|つ 14 18|て 16 5|と 16 8|
だ 3 0|ぢ 12 20|づ 12 18|で 3 5|ど 3 8|
な 2 0|に 2 20|ぬ 2 13|ね 2 5|の 2 8|
は 18 0|ひ 18 20|ふ 18 13|へ 18 5|ほ 18 8|
ば 7 0|び 7 20|ぶ 7 13|べ 7 5|ぼ 7 8|
ぱ 17 0|ぴ 17 20|ぷ 17 13|ぺ 17 5|ぽ 17 8|
ま 6 0|み 6 20|む 6 13|め 6 5|も 6 8|
や 11 2|ゆ 11 17|よ 11 12|
ら 5 0|り 5 20|る 5 13|れ 5 5|ろ 5 8|
わ 11 9|を 11 8|ゔ 7 13|
ぁ 11 0|ぃ 11 20|ぅ 11 13|ぇ 11 5|ぉ 11 8|ゃ 11 2|ゅ 11 17|ょ 11 12|
きゃ 15 2|きゅ 15 17|きょ 15 12|ぎゃ 0 2|ぎゅ 0 17|ぎょ 0 12|
しゃ 9 2|しゅ 9 17|しょ 9 12|しぇ 9 7|じゃ 12 0|じゅ 12 13|じょ 12 8|じぇ 12 5|
ちゃ 14 0|ちゅ 14 17|ちょ 14 8|ちぇ 14 5|ぢゃ 12 0|ぢゅ 12 13|ぢょ 12 8|
にゃ 2 2|にゅ 2 17|にょ 2 12|ひゃ 18 2|ひゅ 18 17|ひょ 18 12|
びゃ 7 2|びゅ 7 17|びょ 7 12|ぴゃ 17 2|ぴゅ 17 17|ぴょ 17 12|
みゃ 6 2|みゅ 6 17|みょ 6 12|りゃ 5 2|りゅ 5 17|りょ 5 12|
ふぁ 18 9|ふぃ 18 16|ふぇ 18 15|ふぉ 18 14|てぃ 16 20|でぃ 3 20|とぅ 16 13|どぅ 3 13|
うぃ 11 16|うぇ 11 15|うぉ 11 14|いぇ 11 7|ゔぁ 7 0|ゔぃ 7 20|ゔぇ 7 5|ゔぉ 7 8|つぁ 14 0
"""

    private val map: Map<String, Char> = SPEC.split('|').mapNotNull { e ->
        val p = e.trim().split(' ').filter { it.isNotEmpty() }
        if (p.size == 3) p[0] to compose(p[1].toInt(), p[2].toInt()) else null
    }.toMap()

    private fun compose(l: Int, v: Int, t: Int = 0): Char = (0xAC00 + (l * 21 + v) * 28 + t).toChar()

    fun toHiragana(s: String): String = buildString(s.length) {
        for (c in s) append(if (c in 'ァ'..'ヶ') c - 0x60 else c)
    }

    /** 앞 글자(받침 없는 한글)에 받침을 붙임 */
    private fun addFinal(sb: StringBuilder, t: Int): Boolean {
        if (sb.isEmpty()) return false
        val last = sb[sb.length - 1]
        if (last !in '가'..'힣') return false
        if ((last.code - 0xAC00) % 28 != 0) return false
        sb.setCharAt(sb.length - 1, (last.code + t).toChar())
        return true
    }

    /** "もーん" 처럼 장음 뒤의 ん: "모-" → "모온" */
    private fun longVowelN(sb: StringBuilder): Boolean {
        if (sb.length < 2 || sb[sb.length - 1] != '-') return false
        val prev = sb[sb.length - 2]
        if (prev !in '\uAC00'..'\uD7A3') return false
        val v = ((prev.code - 0xAC00) / 28) % 21
        sb.setCharAt(sb.length - 1, compose(11, v, 4))
        return true
    }

    fun toHangul(input: String): String {
        val s = toHiragana(input)
        val sb = StringBuilder()
        var i = 0
        while (i < s.length) {
            if (i + 1 < s.length) {
                val two = map[s.substring(i, i + 2)]
                if (two != null) {
                    sb.append(two); i += 2; continue
                }
            }
            when (val c = s[i]) {
                'っ' -> addFinal(sb, 19)          // ㅅ 받침
                'ん' -> if (!addFinal(sb, 4) && !longVowelN(sb)) sb.append('응') // ㄴ 받침
                'ー', '〜', '～' -> sb.append('-')
                '、' -> sb.append(", ")
                '。' -> sb.append(". ")
                'ゎ' -> sb.append('와')
                else -> sb.append(map[c.toString()] ?: c)
            }
            i++
        }
        return sb.toString().replace(Regex(" {2,}"), " ").trim()
    }
}

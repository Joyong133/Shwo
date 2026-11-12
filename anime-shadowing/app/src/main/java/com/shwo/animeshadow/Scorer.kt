package com.shwo.animeshadow

import kotlin.math.roundToInt

object Scorer {
    /** 비교용 정규화: 문장부호·공백 제거, 가타카나→히라가나, 소문자. src = 원문에서의 위치 */
    class Norm(val text: String, val src: IntArray)

    fun normalize(s: String): Norm {
        val h = KanaHangul.toHiragana(s)
        val sb = StringBuilder()
        val idx = ArrayList<Int>()
        h.forEachIndexed { i, raw ->
            var c = raw
            if (c in '！'..'～') c = c - 0xFEE0 // 전각 영숫자 → 반각
            if (Character.isLetterOrDigit(c)) {
                sb.append(c.lowercaseChar()); idx.add(i)
            }
        }
        return Norm(sb.toString(), idx.toIntArray())
    }

    class Result(
        val score: Int,
        val heard: String,
        /** 색칠해서 보여줄 기준 문장 (원문 또는 히라가나) */
        val target: String,
        /** target의 각 글자가 맞았는지 (문장부호 등은 null) */
        val hit: Array<Boolean?>,
    )

    fun evaluate(candidates: List<String>, jp: String, kana: String): Result? {
        if (candidates.isEmpty()) return null
        val targets = listOf(jp, kana).map { it to normalize(it) }
        var best: Result? = null
        var bestRaw = -1.0
        for (heardRaw in candidates) {
            val heard = normalize(heardRaw).text
            for ((orig, norm) in targets) {
                val (raw, matched) = similarity(norm.text, heard)
                if (raw > bestRaw) {
                    bestRaw = raw
                    val hit = arrayOfNulls<Boolean>(orig.length)
                    norm.src.forEachIndexed { k, pos -> hit[pos] = matched[k] }
                    // 유사도 0.88 이상이면 만점(한자/가나 표기 차이 감안), 0.2 이하는 0점 (우연히 겹친 글자 무시)
                    val score = (100 * (raw - 0.2) / (0.88 - 0.2)).coerceIn(0.0, 100.0).roundToInt()
                    best = Result(score, heardRaw, orig, hit)
                }
            }
        }
        return best
    }

    /** LCS 기반 유사도 (0~1) + 기준 문장 각 글자의 일치 여부 */
    private fun similarity(a: String, b: String): Pair<Double, BooleanArray> {
        val n = a.length
        val m = b.length
        val matched = BooleanArray(n)
        if (n == 0 || m == 0) return 0.0 to matched
        val dp = Array(n + 1) { IntArray(m + 1) }
        for (i in n - 1 downTo 0) for (j in m - 1 downTo 0) {
            dp[i][j] = if (a[i] == b[j]) dp[i + 1][j + 1] + 1 else maxOf(dp[i + 1][j], dp[i][j + 1])
        }
        var i = 0
        var j = 0
        while (i < n && j < m) {
            when {
                a[i] == b[j] -> { matched[i] = true; i++; j++ }
                dp[i + 1][j] >= dp[i][j + 1] -> i++
                else -> j++
            }
        }
        return (2.0 * dp[0][0] / (n + m)) to matched
    }

    fun message(score: Int): String = when {
        score >= 95 -> "완벽해요! 성우 데뷔해도 되겠어요 🎉"
        score >= 80 -> "아주 좋아요! 거의 원어민이에요 💪"
        score >= 60 -> "좋아요! 조금만 더 또박또박 🙂"
        score >= 40 -> "아쉬워요. 한 번 더 듣고 따라 해봐요 👂"
        else -> "다시 도전! '천천히 듣기'부터 해봐요 🐢"
    }
}

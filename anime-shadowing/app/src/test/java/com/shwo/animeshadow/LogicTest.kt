package com.shwo.animeshadow

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LogicTest {
    @Test
    fun hangul() {
        assertEquals("카이조쿠오우니 오레와 나루", KanaHangul.toHangul("かいぞくおうに おれわ なる"))
        assertEquals("맛스구", KanaHangul.toHangul("まっすぐ"))
        assertEquals("니게차 다메다", KanaHangul.toHangul("にげちゃ だめだ"))
        assertEquals("피카츄", KanaHangul.toHangul("ぴかちゅう").dropLast(1))
        assertEquals("신지츠와 이츠모 히토츠", KanaHangul.toHangul("しんじつわ いつも ひとつ"))
        assertEquals("도라에모온", KanaHangul.toHangul("どらえもーん"))
        assertEquals("난바-완다", KanaHangul.toHangul("なんばーわんだ"))
        assertEquals("료우이키텐카이", KanaHangul.toHangul("りょういきてんかい"))
        assertEquals("슈타인즈 게-토노", KanaHangul.toHangul("シュタインズ ゲートの"))
    }

    @Test
    fun scoring() {
        val perfect = Scorer.evaluate(listOf("海賊王におれはなる"), "海賊王におれはなる！", "かいぞくおうに おれわ なる")!!
        assertEquals(100, perfect.score)
        // 인식기가 "おれ"를 "俺"로 돌려줘도 높은 점수
        val kanji = Scorer.evaluate(listOf("海賊王に俺はなる"), "海賊王におれはなる！", "かいぞくおうに おれわ なる")!!
        assertTrue("kanji variant ${kanji.score}", kanji.score >= 90)
        val half = Scorer.evaluate(listOf("海賊"), "海賊王におれはなる！", "かいぞくおうに おれわ なる")!!
        assertTrue("partial ${half.score}", half.score < 50)
        val wrong = Scorer.evaluate(listOf("こんにちは"), "逃げちゃダメだ", "にげちゃ だめだ")!!
        assertTrue("wrong ${wrong.score}", wrong.score < 30)
        // 가타카나로 인식돼도 OK
        val kata = Scorer.evaluate(listOf("ピカチュウキミニキメタ"), "ピカチュウ、君に決めた！", "ぴかちゅう きみに きめた")!!
        assertEquals(100, kata.score)
    }

    @Test
    fun allQuotesConvert() {
        val text = java.io.File("src/main/assets/quotes.json").readText()
        val arr = org.json.JSONArray(text)
        for (i in 0 until arr.length()) {
            val kana = arr.getJSONObject(i).getString("kana")
            val h = KanaHangul.toHangul(kana)
            val leftover = h.filter { it in '぀'..'ヿ' && it != 'ー' }
            assertTrue("unconverted kana in $kana -> $h", leftover.isEmpty())
        }
    }
}


package com.shwo.animeshadow

import android.content.Context
import android.content.SharedPreferences

class Prefs(ctx: Context) {
    private val sp: SharedPreferences = ctx.getSharedPreferences("progress", Context.MODE_PRIVATE)

    fun best(id: String): Int = sp.getInt("best_$id", -1)

    /** 새 최고 점수면 true */
    fun saveScore(id: String, score: Int): Boolean {
        val e = sp.edit().putInt("tries", tries() + 1)
        val isBest = score > best(id)
        if (isBest) e.putInt("best_$id", score)
        e.apply()
        return isBest
    }

    fun tries(): Int = sp.getInt("tries", 0)

    fun favorites(): Set<String> = sp.getStringSet("favs", emptySet()) ?: emptySet()
    fun isFav(id: String) = id in favorites()
    fun toggleFav(id: String): Boolean {
        val s = favorites().toMutableSet()
        val now = if (id in s) { s.remove(id); false } else { s.add(id); true }
        sp.edit().putStringSet("favs", s).apply()
        return now
    }

    var speed: Float
        get() = sp.getFloat("speed", 1.0f)
        set(v) = sp.edit().putFloat("speed", v).apply()
    var showKana: Boolean
        get() = sp.getBoolean("showKana", true)
        set(v) = sp.edit().putBoolean("showKana", v).apply()
    var showHangul: Boolean
        get() = sp.getBoolean("showHangul", true)
        set(v) = sp.edit().putBoolean("showHangul", v).apply()
    var showKo: Boolean
        get() = sp.getBoolean("showKo", true)
        set(v) = sp.edit().putBoolean("showKo", v).apply()
    var shadowing: Boolean
        get() = sp.getBoolean("shadowing", false)
        set(v) = sp.edit().putBoolean("shadowing", v).apply()

    companion object {
        const val PASS = 70
    }
}

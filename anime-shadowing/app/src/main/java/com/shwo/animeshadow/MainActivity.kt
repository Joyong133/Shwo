package com.shwo.animeshadow

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton
import com.google.android.material.progressindicator.LinearProgressIndicator

class MainActivity : AppCompatActivity() {

    private lateinit var prefs: Prefs
    private lateinit var all: List<Quote>
    private lateinit var adapter: QuoteAdapter
    private lateinit var tvStats: TextView
    private lateinit var tvEmpty: TextView
    private lateinit var progress: LinearProgressIndicator

    private var filter = F_ALL
    private var query = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        prefs = Prefs(this)
        all = QuoteRepo.all(this)

        tvStats = findViewById(R.id.tvStats)
        tvEmpty = findViewById(R.id.tvEmpty)
        progress = findViewById(R.id.progress)

        adapter = QuoteAdapter(prefs,
            onClick = { pos -> openPractice(adapter.items, pos) },
            onFav = { q -> prefs.toggleFav(q.id); if (filter == F_FAV) applyFilter() })
        findViewById<RecyclerView>(R.id.list).apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = this@MainActivity.adapter
        }

        buildChips()

        findViewById<EditText>(R.id.etSearch).addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
            override fun onTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
            override fun afterTextChanged(s: Editable?) {
                query = s?.toString()?.trim().orEmpty(); applyFilter()
            }
        })

        findViewById<ExtendedFloatingActionButton>(R.id.fabStart).setOnClickListener {
            if (adapter.items.isNotEmpty()) openPractice(adapter.items, 0)
        }
        findViewById<View>(R.id.btnRandom).setOnClickListener {
            val pool = adapter.items.ifEmpty { all }
            openPractice(pool.shuffled(), 0)
        }
    }

    override fun onResume() {
        super.onResume()
        applyFilter()
    }

    private fun buildChips() {
        val group = findViewById<ChipGroup>(R.id.chips)
        val inflater = LayoutInflater.from(this)
        val entries = mutableListOf(
            F_ALL to "전체 ${all.size}",
            F_FAV to "★ 즐겨찾기",
            F_NEW to "안 해본 대사",
            F_RETRY to "다시 연습 (${Prefs.PASS}점 미만)",
            "L1" to "초급", "L2" to "중급", "L3" to "고급",
        )
        all.groupingBy { it.anime }.eachCount().forEach { (anime, n) -> entries += "A:$anime" to "$anime $n" }
        entries.forEach { (key, label) ->
            val chip = inflater.inflate(R.layout.chip_filter, group, false) as Chip
            chip.text = label
            chip.tag = key
            chip.id = View.generateViewId()
            chip.isChecked = key == filter
            group.addView(chip)
        }
        group.setOnCheckedStateChangeListener { g, ids ->
            filter = ids.firstOrNull()?.let { g.findViewById<Chip>(it).tag as String } ?: F_ALL
            applyFilter()
        }
    }

    private fun applyFilter() {
        val favs = prefs.favorites()
        val list = all.filter { q ->
            val okFilter = when {
                filter == F_ALL -> true
                filter == F_FAV -> q.id in favs
                filter == F_NEW -> prefs.best(q.id) < 0
                filter == F_RETRY -> prefs.best(q.id) in 0 until Prefs.PASS
                filter.startsWith("L") -> q.level == filter.substring(1).toInt()
                filter.startsWith("A:") -> q.anime == filter.substring(2)
                else -> true
            }
            okFilter && (query.isEmpty() || listOf(q.jp, q.kana, q.ko, q.anime, q.who, q.hangul)
                .any { it.contains(query, ignoreCase = true) })
        }
        adapter.submit(list)
        tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
        updateStats()
    }

    private fun updateStats() {
        val scores = all.map { prefs.best(it.id) }.filter { it >= 0 }
        val passed = scores.count { it >= Prefs.PASS }
        val avg = if (scores.isEmpty()) 0 else scores.average().toInt()
        tvStats.text = "연습 ${scores.size}/${all.size} · 통과 $passed · 평균 ${avg}점 · 도전 ${prefs.tries()}회"
        progress.max = all.size
        progress.setProgressCompat(passed, true)
    }

    private fun openPractice(list: List<Quote>, index: Int) {
        startActivity(Intent(this, PracticeActivity::class.java)
            .putStringArrayListExtra(PracticeActivity.EXTRA_IDS, ArrayList(list.map { it.id }))
            .putExtra(PracticeActivity.EXTRA_INDEX, index))
    }

    companion object {
        const val F_ALL = "all"
        const val F_FAV = "fav"
        const val F_NEW = "new"
        const val F_RETRY = "retry"
    }
}

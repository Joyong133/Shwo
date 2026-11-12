package com.shwo.animeshadow

import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView

class QuoteAdapter(
    private val prefs: Prefs,
    private val onClick: (Int) -> Unit,
    private val onFav: (Quote) -> Unit,
) : RecyclerView.Adapter<QuoteAdapter.VH>() {

    var items: List<Quote> = emptyList()
        private set

    fun submit(list: List<Quote>) {
        items = list
        notifyDataSetChanged()
    }

    class VH(v: View) : RecyclerView.ViewHolder(v) {
        val meta: TextView = v.findViewById(R.id.tvMeta)
        val jp: TextView = v.findViewById(R.id.tvJp)
        val ko: TextView = v.findViewById(R.id.tvKo)
        val fav: TextView = v.findViewById(R.id.tvFav)
        val score: TextView = v.findViewById(R.id.tvScore)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_quote, parent, false))

    override fun getItemCount() = items.size

    override fun onBindViewHolder(h: VH, position: Int) {
        val q = items[position]
        val ctx = h.itemView.context
        h.meta.text = "${q.anime} · ${q.who} · ${levelLabel(q.level)}"
        h.jp.text = q.jp
        h.ko.text = q.ko
        h.fav.text = if (prefs.isFav(q.id)) "★" else "☆"
        h.fav.setOnClickListener { onFav(q); notifyItemChanged(h.bindingAdapterPosition) }
        h.itemView.setOnClickListener { onClick(h.bindingAdapterPosition) }

        val best = prefs.best(q.id)
        val color = when {
            best < 0 -> R.color.score_none
            best >= Prefs.PASS -> R.color.score_good
            best >= 40 -> R.color.score_mid
            else -> R.color.score_bad
        }
        h.score.text = if (best < 0) "NEW" else "${best}점"
        h.score.background = GradientDrawable().apply {
            cornerRadius = 40f
            setColor(ContextCompat.getColor(ctx, color))
        }
    }
}

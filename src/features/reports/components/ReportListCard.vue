<template>
  <div
    class="rounded-2xl border shadow-sm dark:shadow-none p-5 h-full"
    :class="panel[tone] ?? panel.slate"
  >
    <div class="mb-4">
      <h3 class="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-wide">{{ title }}</h3>
      <p v-if="hint" class="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">{{ hint }}</p>
    </div>

    <ul v-if="items.length" class="divide-y divide-slate-100 dark:divide-white/10">
      <li v-for="(item, i) in items" :key="item.id ?? i" class="py-2.5 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-100 truncate">{{ item.title }}</p>
          <p v-if="item.sub" class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ item.sub }}</p>
        </div>
        <div class="text-right shrink-0">
          <span
            v-if="item.badge"
            class="inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase"
            :class="badge[item.tone] ?? badge.slate"
          >{{ item.badge }}</span>
          <p v-if="item.meta" class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{{ item.meta }}</p>
        </div>
      </li>
    </ul>

    <p v-else class="py-8 text-center text-sm text-slate-300 dark:text-slate-600 font-bold">{{ emptyText }}</p>
  </div>
</template>

<script setup>
// items = [{ id, title, sub?, badge?, tone?, meta? }]
defineProps({
  title: { type: String, default: '' },
  hint: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  emptyText: { type: String, default: '—' },
  tone: { type: String, default: 'slate' }, // panel accent: slate | emerald | indigo
})

// Full literal class names so Tailwind JIT can see them.
const panel = {
  slate:   'bg-white dark:bg-slate-800/50 border-gray-100 dark:border-white/10',
  emerald: 'bg-emerald-50/60 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-400/20',
  indigo:  'bg-indigo-50/60 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-400/20',
}
const badge = {
  slate:   'bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/20',
  red:     'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30',
  amber:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30',
  blue:    'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/30',
  orange:  'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-400/30',
}
</script>
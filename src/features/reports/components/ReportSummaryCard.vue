<template>
  <div
    :class="[
      'group relative overflow-hidden rounded-2xl border p-4 sm:p-5 h-full flex flex-col',
      'shadow-sm dark:shadow-lg dark:ring-1 dark:ring-inset dark:ring-white/10',
      'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl',
      theme.card,
    ]"
  >
    <!-- decorative orb (kept subtle) + glossy overlay (dark only) -->
    <span :class="['pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl', theme.orb]"></span>
    <span class="pointer-events-none absolute inset-0 hidden bg-gradient-to-br from-white/15 to-transparent dark:block"></span>

    <!-- Top row: icon (left) + badge (right, from sm up so it never gets cut off) -->
    <div class="relative flex items-center justify-between gap-2 mb-3 sm:mb-4">
      <div
        v-if="icon"
        :class="['w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white ring-1 ring-white/30 shrink-0', theme.icon]"
      >
        <component :is="icon" class="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span
        v-if="badge"
        :class="['hidden sm:inline-flex px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap', theme.badge]"
      >
        {{ badge }}
      </span>
    </div>

    <!-- Value + label (full text, wraps instead of truncating) -->
    <div class="relative flex items-end justify-between gap-3">
      <div class="min-w-0">
        <p class="text-2xl font-black tracking-tight leading-none text-slate-900 dark:text-white whitespace-nowrap">{{ displayValue }}</p>
        <p class="text-[11px] font-bold tracking-wide leading-snug text-slate-600 dark:text-white/85 mt-1.5 line-clamp-2">{{ label }}</p>
      </div>

      <!-- Sparkline: only when there is room (sm and up) -->
      <div class="hidden sm:block shrink-0 text-slate-500 dark:text-white/80 pointer-events-none">
        <slot name="spark" />
      </div>
    </div>

    <!-- Trend pill: pinned to the bottom so cards in one row line up. Short on phones. -->
    <div v-if="trend !== null" class="relative mt-auto pt-3">
      <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-white/20 dark:text-white">
        {{ trend >= 0 ? '▲' : '▼' }} {{ Math.abs(trend) }}%
        <span class="hidden sm:inline text-[10px] font-semibold text-slate-500 dark:text-white/80">{{ t('reports.summaryCard.vsPrevious') }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  label: { type: String, required: true },  // caller passes already-translated text
  value: { type: [Number, String], default: 0 },
  format: { type: String, default: 'number' }, // 'number' | 'currency'
  // Callers still pass e.g. "bg-blue-600"; only the colour name is used to pick the theme.
  bg: { type: String, default: 'bg-blue-600' },
  trend: { type: Number, default: null },
  icon: { type: [Object, Function], default: null },
  badge: { type: String, default: null },
})

/*
 * Light mode: soft tinted card, solid coloured icon, coloured badge.
 * Dark mode : bright gradient 500 -> 600 -> 800, translucent white icon/badge.
 * Full literal class names so Tailwind JIT can see them.
 */
const palette = {
  slate: {
    card: 'border-slate-200 bg-gradient-to-br from-slate-100 via-white to-white hover:shadow-slate-400/25 dark:border-slate-300/30 dark:from-slate-500 dark:via-slate-600 dark:to-slate-800 dark:hover:shadow-slate-500/40',
    icon: 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-md shadow-slate-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-slate-300/40 dark:bg-white/10',
  },
  emerald: {
    card: 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white hover:shadow-emerald-500/20 dark:border-emerald-300/30 dark:from-emerald-500 dark:via-emerald-600 dark:to-emerald-800 dark:hover:shadow-emerald-500/40',
    icon: 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-emerald-300/40 dark:bg-white/10',
  },
  blue: {
    card: 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white hover:shadow-blue-500/20 dark:border-blue-300/30 dark:from-blue-500 dark:via-blue-600 dark:to-blue-800 dark:hover:shadow-blue-500/40',
    icon: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-blue-300/40 dark:bg-white/10',
  },
  red: {
    card: 'border-red-200 bg-gradient-to-br from-red-50 via-white to-white hover:shadow-red-500/20 dark:border-red-300/30 dark:from-red-500 dark:via-red-600 dark:to-red-800 dark:hover:shadow-red-500/40',
    icon: 'bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-red-300/40 dark:bg-white/10',
  },
  purple: {
    card: 'border-purple-200 bg-gradient-to-br from-purple-50 via-white to-white hover:shadow-purple-500/20 dark:border-purple-300/30 dark:from-purple-500 dark:via-purple-600 dark:to-purple-800 dark:hover:shadow-purple-500/40',
    icon: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-purple-300/40 dark:bg-white/10',
  },
  orange: {
    card: 'border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white hover:shadow-orange-500/20 dark:border-orange-300/30 dark:from-orange-500 dark:via-orange-600 dark:to-orange-800 dark:hover:shadow-orange-500/40',
    icon: 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-orange-300/40 dark:bg-white/10',
  },
  rose: {
    card: 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white hover:shadow-rose-500/20 dark:border-rose-300/30 dark:from-rose-500 dark:via-rose-600 dark:to-rose-800 dark:hover:shadow-rose-500/40',
    icon: 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-md shadow-rose-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-rose-300/40 dark:bg-white/10',
  },
  indigo: {
    card: 'border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white hover:shadow-indigo-500/20 dark:border-indigo-300/30 dark:from-indigo-500 dark:via-indigo-600 dark:to-indigo-800 dark:hover:shadow-indigo-500/40',
    icon: 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-indigo-300/40 dark:bg-white/10',
  },
  teal: {
    card: 'border-teal-200 bg-gradient-to-br from-teal-50 via-white to-white hover:shadow-teal-500/20 dark:border-teal-300/30 dark:from-teal-500 dark:via-teal-600 dark:to-teal-800 dark:hover:shadow-teal-500/40',
    icon: 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-md shadow-teal-500/30 dark:from-white/25 dark:to-white/20 dark:shadow-none',
    badge: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-white/15 dark:text-white dark:border-white/30',
    orb: 'bg-teal-300/40 dark:bg-white/10',
  },
}

const theme = computed(() => {
  const name = props.bg.match(/bg-([a-z]+)-\d+/)?.[1]
  return palette[name] ?? palette.blue
})

const displayValue = computed(() => {
  if (props.format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.value || 0)
  }
  return new Intl.NumberFormat('en-US').format(props.value || 0)
})
</script>
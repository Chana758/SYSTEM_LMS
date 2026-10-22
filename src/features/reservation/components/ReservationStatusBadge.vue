<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-2xs"
    :class="classes"
  >
    <span class="w-1.5 h-1.5 rounded-full ring-2" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ status: { type: String, required: true } })
const { t } = useI18n()

// Light colours first, then dark: variants. Dot ring uses a dark tint so it
// does not glow white against the dark card.
const map = {
  pending: {
    labelKey: 'reservation.statusPending',
    classes: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/25',
    dot: 'bg-amber-500 ring-amber-100 dark:bg-amber-400 dark:ring-amber-400/20',
  },
  ready: {
    labelKey: 'reservation.statusReady',
    classes: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/25',
    dot: 'bg-blue-500 ring-blue-100 dark:bg-sky-400 dark:ring-sky-400/20',
  },
  fulfilled: {
    labelKey: 'reservation.statusFulfilled',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25',
    dot: 'bg-emerald-500 ring-emerald-100 dark:bg-emerald-400 dark:ring-emerald-400/20',
  },
  cancelled: {
    labelKey: 'reservation.statusCancelled',
    classes: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-400/25',
    dot: 'bg-slate-400 ring-slate-200 dark:bg-slate-400 dark:ring-slate-400/20',
  },
  expired: {
    labelKey: 'reservation.statusExpired',
    classes: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/25',
    dot: 'bg-rose-500 ring-rose-100 dark:bg-rose-400 dark:ring-rose-400/20',
  },
}

const info = computed(() => map[props.status] || map.pending)
const label = computed(() => t(info.value.labelKey))
const classes = computed(() => info.value.classes)
const dotClass = computed(() => info.value.dot)
</script>
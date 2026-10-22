<template>
  <div
    class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm p-4 sm:p-6 h-full flex flex-col"
  >
    <div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
      <div class="min-w-0">
        <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ $t('dashboard.recentActivity.title') }}</h3>
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ $t('dashboard.recentActivity.subtitle') }}</p>
      </div>
      <span class="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 text-[10px] font-black uppercase tracking-wider">
        {{ items.length }}
      </span>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-10">
      <div class="w-6 h-6 border-[3px] border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!items.length" class="flex-1 flex items-center justify-center py-10 text-center">
      <p class="text-xs font-bold text-slate-400 dark:text-slate-500">{{ $t('dashboard.recentActivity.noActivity') }}</p>
    </div>

    <ul v-else class="app-scroll space-y-2.5 sm:space-y-3 overflow-y-auto max-h-[320px] sm:max-h-[380px] pr-1">
      <li
        v-for="item in items"
        :key="item.id"
        class="group flex items-start gap-3 sm:gap-3.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-900 dark:hover:border-white/20 transition-all"
      >
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ring-1 transition-transform duration-300 group-hover:scale-105"
          :class="[typeStyle(item.type).bg, typeStyle(item.type).ring]"
        >
          <component :is="typeStyle(item.type).icon" class="w-4 h-4" :class="typeStyle(item.type).color" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">{{ item.description }}</p>
          <p class="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            <ClockIcon class="w-3 h-3" />
            {{ formatTime(item.created_at) }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import {
  ArrowsRightLeftIcon,
  ArrowUturnLeftIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  UserPlusIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const { t } = useI18n()

// Full class names are written out so Tailwind can generate them.
const STYLE_MAP = {
  borrow: {
    icon: ArrowsRightLeftIcon,
    bg: 'bg-emerald-100 dark:bg-emerald-400/15',
    color: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-200 dark:ring-emerald-300/20',
  },
  return: {
    icon: ArrowUturnLeftIcon,
    bg: 'bg-blue-100 dark:bg-sky-400/15',
    color: 'text-blue-700 dark:text-sky-300',
    ring: 'ring-blue-200 dark:ring-sky-300/20',
  },
  reservation: {
    icon: CalendarDaysIcon,
    bg: 'bg-purple-100 dark:bg-purple-400/15',
    color: 'text-purple-700 dark:text-purple-300',
    ring: 'ring-purple-200 dark:ring-purple-300/20',
  },
  fine: {
    icon: BanknotesIcon,
    bg: 'bg-rose-100 dark:bg-rose-400/15',
    color: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-200 dark:ring-rose-300/20',
  },
  member: {
    icon: UserPlusIcon,
    bg: 'bg-amber-100 dark:bg-amber-400/15',
    color: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-300/20',
  },
}

function typeStyle(type) {
  return STYLE_MAP[type] || STYLE_MAP.borrow
}

function formatTime(d) {
  if (!d) return '—'
  const time = new Date(d).getTime()
  // Invalid date strings would otherwise render "NaN days ago".
  if (Number.isNaN(time)) return '—'
  const diffMs = Date.now() - time
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return t('dashboard.recentActivity.justNow')
  if (mins < 60) return t('dashboard.recentActivity.minAgo', { n: mins })
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return t('dashboard.recentActivity.hourAgo', { n: hrs })
  const days = Math.floor(hrs / 24)
  return t('dashboard.recentActivity.dayAgo', { n: days })
}
</script>

<style scoped>
.app-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
}
.app-scroll::-webkit-scrollbar {
  width: 6px;
}
.app-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.45);
  border-radius: 9999px;
}
</style>
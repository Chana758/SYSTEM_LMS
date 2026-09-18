<template>
  <div class="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 h-full flex flex-col">
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
      <div>
        <h3 class="text-base font-black text-slate-900 tracking-tight">{{ $t('dashboard.recentActivity.title') }}</h3>
        <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ $t('dashboard.recentActivity.subtitle') }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-10">
      <div class="w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!items.length" class="flex-1 flex items-center justify-center py-10 text-center">
      <p class="text-xs font-bold text-slate-400">{{ $t('dashboard.recentActivity.noActivity') }}</p>
    </div>

    <ul v-else class="space-y-3 overflow-y-auto max-h-[380px] pr-1">
      <li 
        v-for="item in items" 
        :key="item.id" 
        class="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs"
          :class="typeStyle(item.type).bg"
        >
          <component :is="typeStyle(item.type).icon" class="w-4 h-4" :class="typeStyle(item.type).color" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-slate-800 leading-snug">{{ item.description }}</p>
          <p class="text-[11px] font-semibold text-slate-400 mt-0.5">{{ formatTime(item.created_at) }}</p>
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
} from '@heroicons/vue/24/outline'

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const { t } = useI18n()

const STYLE_MAP = {
  borrow: { icon: ArrowsRightLeftIcon, bg: 'bg-emerald-100', color: 'text-emerald-700' },
  return: { icon: ArrowUturnLeftIcon, bg: 'bg-blue-100', color: 'text-blue-700' },
  reservation: { icon: CalendarDaysIcon, bg: 'bg-purple-100', color: 'text-purple-700' },
  fine: { icon: BanknotesIcon, bg: 'bg-rose-100', color: 'text-rose-700' },
  member: { icon: UserPlusIcon, bg: 'bg-amber-100', color: 'text-amber-700' },
}

function typeStyle(type) {
  return STYLE_MAP[type] || STYLE_MAP.borrow
}

function formatTime(d) {
  if (!d) return '—'
  const diffMs = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return t('dashboard.recentActivity.justNow')
  if (mins < 60) return t('dashboard.recentActivity.minAgo', { n: mins })
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return t('dashboard.recentActivity.hourAgo', { n: hrs })
  const days = Math.floor(hrs / 24)
  return t('dashboard.recentActivity.dayAgo', { n: days })
}
</script>
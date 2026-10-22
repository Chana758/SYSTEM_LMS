<template>
  <div class="flex gap-2.5 mb-6 overflow-x-auto px-1 py-2">
    <router-link
      v-for="item in items" :key="item.to"
      :to="item.to"
      class="group flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-2xl border-2 text-sm font-bold whitespace-nowrap transition-all duration-200"
      :class="isActive(item.to)
        ? [theme(item).activeCard, 'dark:bg-gradient-to-br dark:from-emerald-500 dark:via-emerald-600 dark:to-emerald-700 dark:border-emerald-300/40 dark:text-white dark:shadow-lg dark:shadow-emerald-500/30 dark:ring-1 dark:ring-inset dark:ring-white/20']
        : ['bg-white text-slate-700 border-slate-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md', 'dark:bg-slate-800 dark:text-slate-200 dark:border-white/20', theme(item).hover]"
    >
      <span
        class="flex h-8 w-8 items-center justify-center rounded-xl border transition-colors"
        :class="isActive(item.to) ? theme(item).activeIcon : theme(item).idleIcon"
      >
        <component :is="item.icon" class="w-4 h-4" />
      </span>
      {{ t(item.labelKey) }}
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ChartBarIcon, ArrowsRightLeftIcon, BanknotesIcon,
  CurrencyDollarIcon, ArchiveBoxIcon, UsersIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const isActive = (path) => route.path === path

const darkActiveIcon = 'dark:bg-white/25 dark:border-white/30 dark:text-white'

const palette = {
  emerald: {
    activeCard: 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md shadow-emerald-500/20',
    activeIcon: `bg-emerald-600 border-emerald-600 text-white ${darkActiveIcon}`,
    idleIcon: 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-400/30 dark:text-emerald-300',
    hover: 'hover:border-emerald-400 hover:bg-emerald-50/60 dark:hover:border-emerald-400/60 dark:hover:bg-slate-800 dark:hover:text-emerald-300',
  },
  blue: {
    activeCard: 'bg-blue-50 border-blue-500 text-blue-800 shadow-md shadow-blue-500/20',
    activeIcon: `bg-blue-600 border-blue-600 text-white ${darkActiveIcon}`,
    idleIcon: 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/15 dark:border-blue-400/30 dark:text-blue-300',
    hover: 'hover:border-blue-400 hover:bg-blue-50/60 dark:hover:border-blue-400/60 dark:hover:bg-slate-800 dark:hover:text-blue-300',
  },
  orange: {
    activeCard: 'bg-orange-50 border-orange-500 text-orange-800 shadow-md shadow-orange-500/20',
    activeIcon: `bg-orange-500 border-orange-500 text-white ${darkActiveIcon}`,
    idleIcon: 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-500/15 dark:border-orange-400/30 dark:text-orange-300',
    hover: 'hover:border-orange-400 hover:bg-orange-50/60 dark:hover:border-orange-400/60 dark:hover:bg-slate-800 dark:hover:text-orange-300',
  },
  amber: {
    activeCard: 'bg-amber-50 border-amber-500 text-amber-800 shadow-md shadow-amber-500/20',
    activeIcon: `bg-amber-500 border-amber-500 text-white ${darkActiveIcon}`,
    idleIcon: 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/15 dark:border-amber-400/30 dark:text-amber-300',
    hover: 'hover:border-amber-400 hover:bg-amber-50/60 dark:hover:border-amber-400/60 dark:hover:bg-slate-800 dark:hover:text-amber-300',
  },
  teal: {
    activeCard: 'bg-teal-50 border-teal-500 text-teal-800 shadow-md shadow-teal-500/20',
    activeIcon: `bg-teal-600 border-teal-600 text-white ${darkActiveIcon}`,
    idleIcon: 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-500/15 dark:border-teal-400/30 dark:text-teal-300',
    hover: 'hover:border-teal-400 hover:bg-teal-50/60 dark:hover:border-teal-400/60 dark:hover:bg-slate-800 dark:hover:text-teal-300',
  },
  purple: {
    activeCard: 'bg-purple-50 border-purple-500 text-purple-800 shadow-md shadow-purple-500/20',
    activeIcon: `bg-purple-600 border-purple-600 text-white ${darkActiveIcon}`,
    idleIcon: 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-500/15 dark:border-purple-400/30 dark:text-purple-300',
    hover: 'hover:border-purple-400 hover:bg-purple-50/60 dark:hover:border-purple-400/60 dark:hover:bg-slate-800 dark:hover:text-purple-300',
  },
}

const theme = (item) => palette[item.color] ?? palette.emerald

const items = computed(() => {
  const base = [
    { to: '/reports', labelKey: 'reports.navOverview', icon: ChartBarIcon, color: 'emerald' },
    { to: '/reports/borrow', labelKey: 'reports.navBorrow', icon: ArrowsRightLeftIcon, color: 'blue' },
    { to: '/reports/fine', labelKey: 'reports.navFine', icon: BanknotesIcon, color: 'orange' },
  ]
  if (authStore.role === 'admin') {
    base.push({ to: '/reports/revenue', labelKey: 'reports.navRevenue', icon: CurrencyDollarIcon, color: 'amber' })
  }
  base.push(
    { to: '/reports/stock', labelKey: 'reports.navStock', icon: ArchiveBoxIcon, color: 'teal' },
    { to: '/reports/user', labelKey: 'reports.navUser', icon: UsersIcon, color: 'purple' },
  )
  return base
})
</script>
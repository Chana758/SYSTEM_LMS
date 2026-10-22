<template>
  <div
    class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5"
  >
    <div>
      <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ $t('dashboard.quickActions.title') }}</h3>
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ $t('dashboard.quickActions.subtitle') }}</p>
    </div>

    <!-- 2 per row on phones, 4 per row on large screens -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <component
        v-for="action in actions"
        :key="action.key"
        :is="action.to ? 'router-link' : 'button'"
        v-bind="action.to ? { to: action.to } : { type: 'button' }"
        class="group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-3.5 sm:p-5 flex flex-col justify-between text-left text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer"
        :class="action.card"
      >
        <!-- Decorative glow -->
        <span class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125"></span>

        <div class="relative flex items-center justify-between mb-3 sm:mb-4">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 ring-1 ring-white/25 text-white flex items-center justify-center shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6">
            <component :is="action.icon" class="w-5 h-5" />
          </div>
          <span
            class="hidden sm:inline text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border"
            :class="action.badge"
          >
            {{ $t(action.badgeKey, action.badgeDefault) }}
          </span>
        </div>

        <div class="relative flex items-end justify-between gap-2">
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-black text-white tracking-tight mb-0.5 leading-snug">{{ $t(action.titleKey) }}</p>
            <p class="text-[10px] sm:text-[11px] font-bold tracking-wide leading-snug" :class="action.desc">{{ $t(action.descKey) }}</p>
          </div>
          <ArrowRightIcon
            class="hidden sm:block h-4 w-4 flex-shrink-0 -translate-x-1 text-white/80 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </div>
      </component>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  QrCodeIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'

// Full class names are written out so Tailwind can generate them.
// Badge labels go through $t() with an English fallback.
// Add these keys to your locale files:
//   dashboard.quickActions.badgeAction / badgeReserve / badgeMember / badgeScan
const actions = [
  {
    key: 'borrow',
    to: '/scanner',
    icon: ArrowsRightLeftIcon,
    badgeKey: 'dashboard.quickActions.badgeAction',
    badgeDefault: 'Action',
    titleKey: 'dashboard.quickActions.newBorrow',
    descKey: 'dashboard.quickActions.newBorrowDesc',
    card: 'from-teal-500 to-teal-700 border-teal-400/60 dark:from-teal-600 dark:to-teal-900 dark:border-teal-300/20 hover:shadow-teal-500/30',
    badge: 'bg-teal-900/30 text-teal-50 border-teal-200/30',
    desc: 'text-teal-100',
  },
  {
    key: 'reservation',
    to: { name: 'reservation-create' },
    icon: CalendarDaysIcon,
    badgeKey: 'dashboard.quickActions.badgeReserve',
    badgeDefault: 'Reserve',
    titleKey: 'dashboard.quickActions.newReservation',
    descKey: 'dashboard.quickActions.newReservationDesc',
    card: 'from-rose-500 to-rose-700 border-rose-400/60 dark:from-rose-600 dark:to-rose-900 dark:border-rose-300/20 hover:shadow-rose-500/30',
    badge: 'bg-rose-900/30 text-rose-50 border-rose-200/30',
    desc: 'text-rose-100',
  },
  {
    key: 'member',
    to: { name: 'member-list' },
    icon: UserPlusIcon,
    badgeKey: 'dashboard.quickActions.badgeMember',
    badgeDefault: 'Member',
    titleKey: 'dashboard.quickActions.addMember',
    descKey: 'dashboard.quickActions.addMemberDesc',
    card: 'from-indigo-500 to-indigo-700 border-indigo-400/60 dark:from-indigo-600 dark:to-indigo-900 dark:border-indigo-300/20 hover:shadow-indigo-500/30',
    badge: 'bg-indigo-900/30 text-indigo-50 border-indigo-200/30',
    desc: 'text-indigo-100',
  },
  {
    key: 'scan',
    to: '/scanner',
    icon: QrCodeIcon,
    badgeKey: 'dashboard.quickActions.badgeScan',
    badgeDefault: 'Scan',
    titleKey: 'dashboard.quickActions.scanBarcode',
    descKey: 'dashboard.quickActions.scanBarcodeDesc',
    card: 'from-sky-500 to-sky-700 border-sky-400/60 dark:from-sky-600 dark:to-sky-900 dark:border-sky-300/20 hover:shadow-sky-500/30',
    badge: 'bg-sky-900/30 text-sky-50 border-sky-200/30',
    desc: 'text-sky-100',
  },
]
</script>
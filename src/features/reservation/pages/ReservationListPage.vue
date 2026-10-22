<template>
  <div class="space-y-6 pb-12">
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-white/10 shadow-sm dark:shadow-black/30 p-4 sm:p-6 md:p-8 space-y-6 transition-colors">

      <!-- Header: button always on the right (icon-only on phones, icon + text from sm up) -->
      <div class="flex items-start justify-between gap-3 pb-6 border-b border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 sm:gap-5 min-w-0">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-100 dark:border-emerald-400/25 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <CalendarDaysIcon class="w-6 h-6 sm:w-7 sm:h-7 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('reservation.pageTitle') }}</h1>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ $t('reservation.pageSubtitle') }}</p>
          </div>
        </div>

        <router-link
          to="/reservations/create"
          :title="$t('reservation.newReservation')"
          :aria-label="$t('reservation.newReservation')"
          class="shrink-0 inline-flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-5 rounded-full sm:rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <PlusIcon class="w-5 h-5 sm:w-4 sm:h-4" />
          <span class="hidden sm:inline">{{ $t('reservation.newReservation') }}</span>
        </router-link>
      </div>

      <!-- Stat cards: 2x2 on phones. Real server totals; click a card to filter the table -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
        <button
          v-for="c in cards"
          :key="c.key"
          type="button"
          @click="applyStatus(c.status)"
          class="group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 sm:p-5 flex flex-col justify-between text-left text-white shadow-md dark:shadow-lg ring-1 ring-inset ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
          :class="[c.card, store.filters.status === c.status ? '!ring-2 !ring-white/80' : '']"
        >
          <span class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent dark:from-white/20"></span>
          <span class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl transition-transform duration-500 group-hover:scale-125"></span>

          <div class="relative flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/25 ring-1 ring-white/30 flex items-center justify-center backdrop-blur-sm">
              <component :is="c.icon" class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span class="hidden sm:inline-flex text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-white/15 text-white border-white/30">{{ c.badge }}</span>
          </div>
          <div class="relative">
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5">{{ c.value }}</p>
            <p class="text-[11px] font-bold tracking-wide leading-snug" :class="c.sub">{{ c.label }}</p>
          </div>
        </button>
      </div>

      <!-- Filter bar -->
      <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 shadow-sm">
        <ReservationFilter v-model="store.filters" @change="handleFilterChange" />
      </div>

      <!-- Table / mobile cards (the component draws its own border) -->
      <ReservationTable
        :reservations="store.reservations"
        :loading="store.loading"
        @row-click="goDetail"
        @fulfill="handleFulfill"
        @cancel="handleCancel"
      />

      <!-- Pagination -->
      <div v-if="store.pagination.last_page > 1" class="flex flex-wrap justify-center items-center gap-2 pt-2">
        <button
          @click="goToPage(store.pagination.current_page - 1)"
          :disabled="store.pagination.current_page <= 1"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
        >‹</button>

        <button
          v-for="p in pageWindow"
          :key="p"
          @click="goToPage(p)"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          :class="p === store.pagination.current_page
            ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md'
            : 'bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'"
        >{{ p }}</button>

        <button
          @click="goToPage(store.pagination.current_page + 1)"
          :disabled="store.pagination.current_page >= store.pagination.last_page"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
        >›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import {
  CalendarDaysIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, PlusIcon,
} from '@heroicons/vue/24/outline'
import { useReservationStore } from '../store/reservationStore'
import ReservationFilter from '../components/ReservationFilter.vue'
import ReservationTable from '../components/ReservationTable.vue'

const router = useRouter()
const store = useReservationStore()
const toast = useToast()
const { t } = useI18n()

// Full class names so Tailwind can generate them.
const cards = computed(() => [
  {
    key: 'total', status: '', icon: CalendarDaysIcon,
    value: store.stats.total, label: t('reservation.totalHolds'), badge: t('reservation.total'),
    card: 'from-slate-500 via-slate-600 to-slate-700 border-slate-400/60 dark:from-slate-500 dark:via-slate-600 dark:to-slate-800 dark:border-white/20 hover:shadow-slate-500/40',
    sub: 'text-slate-100',
  },
  {
    key: 'pending', status: 'pending', icon: ClockIcon,
    value: store.stats.pending, label: t('reservation.inQueue'), badge: t('reservation.queue'),
    card: 'from-amber-500 via-amber-600 to-amber-700 border-amber-400/60 dark:from-amber-500 dark:via-amber-600 dark:to-amber-800 dark:border-amber-300/30 hover:shadow-amber-500/40',
    sub: 'text-amber-100',
  },
  {
    key: 'ready', status: 'ready', icon: CheckCircleIcon,
    value: store.stats.ready, label: t('reservation.readyForPickup'), badge: t('reservation.pickup'),
    card: 'from-blue-500 via-blue-600 to-blue-700 border-blue-400/60 dark:from-blue-500 dark:via-blue-600 dark:to-blue-800 dark:border-blue-300/30 hover:shadow-blue-500/40',
    sub: 'text-blue-100',
  },
  {
    key: 'expired', status: 'expired', icon: ExclamationTriangleIcon,
    value: store.stats.expired, label: t('reservation.expired'), badge: t('reservation.alert'),
    card: 'from-rose-500 via-rose-600 to-rose-700 border-rose-400/60 dark:from-rose-500 dark:via-rose-600 dark:to-rose-800 dark:border-rose-300/30 hover:shadow-rose-500/40',
    sub: 'text-rose-100',
  },
])

const pageWindow = computed(() => {
  const { current_page: c, last_page: l } = store.pagination
  const start = Math.max(1, Math.min(c - 2, l - 4))
  const end = Math.min(l, start + 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const goToPage = (p) => {
  const { current_page, last_page } = store.pagination
  if (p < 1 || p > last_page || p === current_page) return
  store.fetchReservations(p)
}

let searchTimeout = null
function handleFilterChange() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => store.fetchReservations(1), 350)
}

function applyStatus(status) {
  store.filters = { ...store.filters, status }
  store.fetchReservations(1)
}

function goDetail(id) {
  router.push({ name: 'reservation-detail', params: { id } })
}

// Reload the current page AND the real totals after any change.
function refresh() {
  return Promise.all([store.fetchReservations(store.pagination.current_page), store.fetchStats()])
}

async function handleFulfill(id) {
  const result = await store.fulfillReservation(id)
  result.success ? toast.success(result.message) : toast.error(result.message)
  await refresh()
}

async function handleCancel(id) {
  if (!confirm(t('reservation.confirmCancel'))) return
  const result = await store.cancelReservation(id)
  result.success ? toast.success(result.message) : toast.error(result.message)
  await refresh()
}

onMounted(() => {
  store.filters = { search: '', status: '' }
  Promise.all([store.fetchReservations(), store.fetchStats()])
})

onBeforeUnmount(() => clearTimeout(searchTimeout))
</script>
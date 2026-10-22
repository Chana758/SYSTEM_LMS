<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div
      class="relative overflow-hidden rounded-2xl border-2 border-slate-300 dark:border-white/10 p-6 shadow-lg dark:shadow-none
             bg-gradient-to-br from-emerald-50 via-white to-white
             dark:from-emerald-500/10 dark:via-slate-800/50 dark:to-slate-800/50"
    >
      <!-- decorative orbs -->
      <span class="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-emerald-300/30 dark:bg-emerald-400/10 blur-3xl"></span>
      <span class="pointer-events-none absolute right-40 -bottom-20 h-40 w-40 rounded-full bg-sky-300/20 dark:bg-sky-400/10 blur-3xl"></span>

      <div class="relative flex items-center justify-between flex-wrap gap-5">
        <!-- Left: icon + title -->
        <div class="flex items-center gap-4 min-w-0">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/30 ring-1 ring-white/30">
            <ChartBarIcon class="w-7 h-7" />
          </div>
          <div class="min-w-0">
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('reports.dashboardPage.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('reports.dashboardPage.subtitle') }}</p>
          </div>
        </div>

        <!-- Right: live info -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- period -->
          <span
            v-if="rangeText"
            class="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-200"
          >
            <CalendarDaysIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {{ rangeText }}
          </span>

          <!-- unpaid fines -->
          <RouterLink
            v-if="dashboard"
            to="/reports/fine?status=unpaid"
            class="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-400/30 text-xs font-bold text-orange-600 dark:text-orange-300 hover:-translate-y-0.5 transition-transform"
          >
            <CreditCardIcon class="w-4 h-4" />
            {{ t('reports.dashboardPage.outstandingFines') }}
            <span class="font-black">{{ analyticsService.formatCurrency(k.unpaid_fines ?? 0) }}</span>
          </RouterLink>

          <!-- refresh -->
          <button
            type="button"
            @click="refresh"
            :disabled="loading"
            class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-60"
          >
            <ArrowPathIcon class="w-5 h-5" :class="loading ? 'animate-spin' : ''" />
          </button>
        </div>
      </div>
    </div>

    <ReportFilter :show-search="false" @apply="onFilterApply" />

    <ReportsNav />

    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/15 p-6 md:p-8 shadow-lg dark:shadow-none border-dashed space-y-6">

      <div v-if="!dashboard && loading" class="p-16 text-center text-slate-400 dark:text-slate-500 font-bold text-sm uppercase tracking-widest animate-pulse">
        {{ t('reports.dashboardPage.loading') }}
      </div>

      <template v-else-if="dashboard">

        <!-- ROW 1 · six KPI cards (click = drill down) -->
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <ReportKpi to="/reports/borrow?status=borrowed" :label="t('reports.dashboardPage.borrowsToday')" :value="k.borrows_today" :trend="tr.borrows_today" :spark="sp.borrows" bg="bg-blue-600" :badge="t('reports.badge.total')" :icon="BookOpenIcon" />
          <ReportKpi to="/reports/borrow?status=returned" :label="t('reports.dashboardPage.returnsToday')" :value="k.returns_today" :trend="tr.returns_today" :spark="sp.returns" bg="bg-emerald-600" :badge="t('reports.badge.returned')" :icon="ArrowUturnLeftIcon" />
          <ReportKpi to="/reports/borrow?status=borrowed" :label="t('reports.dashboardPage.borrowedNow')" :value="k.active_borrows" :trend="tr.active_borrows" bg="bg-indigo-600" :badge="t('reports.badge.active')" :icon="ArrowsRightLeftIcon" />
          <ReportKpi to="/reports/borrow?status=overdue" :label="t('reports.dashboardPage.overdue')" :value="k.overdue_borrows" bg="bg-red-500" :badge="t('reports.badge.alert')" :icon="ExclamationTriangleIcon" />
          <ReportKpi to="/reports/fine?status=unpaid" :label="t('reports.dashboardPage.outstandingFines')" :value="k.unpaid_fines" format="currency" :trend="tr.unpaid_fines" bg="bg-orange-500" :badge="t('reports.badge.unpaid')" :icon="CreditCardIcon" />
          <ReportKpi to="/reports/user" :label="t('reports.dashboardPage.newMembers')" :value="k.new_members" :trend="tr.new_members" :spark="sp.members" bg="bg-purple-600" :badge="t('reports.badge.users')" :icon="UsersIcon" />
        </div>

        <!-- ROW 2 · borrows vs returns + 2 donuts -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="lg:col-span-2 min-w-0">
            <ReportSeriesChart :title="t('reports.dashboardPage.borrowReturnTrend')" :labels="lineLabels" :series="lineSeries" type="line" :height="280" />
          </div>
          <div class="min-w-0">
            <ReportDonut :title="t('reports.dashboardPage.borrowsByCategory')" :items="categoryItems" :height="280" />
          </div>
          <div class="min-w-0">
            <ReportDonut :title="t('reports.dashboardPage.copyStatus')" :items="copyItems" :height="280" />
          </div>
        </div>

        <!-- ROW 3 · rankings + overdue aging -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="min-w-0">
            <ReportRankList :title="t('reports.dashboardPage.mostBorrowedBooks')" :items="topBookItems" :suffix="` ${t('reports.dashboardPage.borrowsSuffix')}`" />
          </div>
          <div class="min-w-0">
            <ReportRankList :title="t('reports.dashboardPage.topMembers')" :items="topMemberItems" variant="avatar" bar-color="bg-blue-500" :suffix="` ${t('reports.dashboardPage.borrowsSuffix')}`" />
          </div>
          <div class="min-w-0">
            <ReportChart :title="t('reports.dashboardPage.overdueAging')" :labels="agingSeries.labels" :values="agingSeries.values" type="bar" color="#ef4444" :height="200" />
          </div>
        </div>

        <!-- ROW 4 · activity + due soon + waiting reservations -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="lg:col-span-2 min-w-0">
            <ReportListCard :title="t('reports.dashboardPage.recentActivity')" :items="activityItems" :empty-text="t('reports.dashboardPage.noDataYet')" />
          </div>
          <div class="min-w-0">
            <ReportListCard :title="t('reports.dashboardPage.dueSoon')" :hint="t('reports.dashboardPage.dueSoonHint')" tone="emerald" :items="dueSoonItems" :empty-text="t('reports.dashboardPage.noDataYet')" />
          </div>
          <div class="min-w-0">
            <ReportListCard :title="t('reports.dashboardPage.waitingReservations')" :hint="t('reports.dashboardPage.waitingHint')" tone="indigo" :items="waitingItems" :empty-text="t('reports.dashboardPage.noDataYet')" />
          </div>
        </div>

        <!-- ROW 5 · period totals + quick links -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 grid grid-cols-2 gap-4">
            <ReportSummaryCard :label="t('reports.dashboardPage.totalBorrows')" :value="k.total_borrows" :trend="tr.total_borrows" bg="bg-blue-600" :badge="t('reports.badge.total')" :icon="BookOpenIcon" />
            <ReportSummaryCard :label="t('reports.dashboardPage.finesPeriod')" :value="k.total_fines" :trend="tr.total_fines" format="currency" bg="bg-orange-500" :badge="t('reports.badge.fines')" :icon="BanknotesIcon" />
            <ReportSummaryCard :label="t('reports.dashboardPage.totalBooks')" :value="k.total_books" bg="bg-indigo-600" :badge="t('reports.badge.catalog')" :icon="RectangleStackIcon" />
            <ReportSummaryCard :label="t('reports.dashboardPage.availableCopies')" :value="k.available_copies" bg="bg-teal-600" :badge="t('reports.badge.stock')" :icon="CheckCircleIcon" />
          </div>

          <div class="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border-2 border-slate-200 dark:border-white/10 p-5 space-y-2">
            <h3 class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">{{ t('reports.dashboardPage.detailedReports') }}</h3>
            <RouterLink
              v-for="link in quickLinks" :key="link.to" :to="link.to"
              class="group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
              :class="link.hoverCls"
            >
              <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110" :class="link.iconCls">
                <component :is="link.icon" class="w-4 h-4" />
              </span>
              <span class="flex-1 min-w-0 truncate">{{ t(link.labelKey) }}</span>
              <ChevronRightIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5" />
            </RouterLink>
          </div>
        </div>
      </template>

      <div v-else class="p-16 text-center text-slate-400 dark:text-slate-500 text-sm font-bold">
        {{ t('reports.dashboardPage.noDashboardData') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChartBarIcon, ArrowsRightLeftIcon, BanknotesIcon, UsersIcon, ChevronRightIcon,
  BookOpenIcon, ExclamationTriangleIcon, CreditCardIcon, RectangleStackIcon, CheckCircleIcon,
  ArrowUturnLeftIcon, CalendarDaysIcon, ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import { useReportStore } from '../store'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportKpi from '../components/ReportKpi.vue'
import ReportChart from '../components/ReportChart.vue'
import ReportSeriesChart from '../components/ReportSeriesChart.vue'
import ReportDonut from '../components/ReportDonut.vue'
import ReportRankList from '../components/ReportRankList.vue'
import ReportListCard from '../components/ReportListCard.vue'
import ReportsNav from '../components/ReportsNav.vue'

const { t, locale } = useI18n()
const store = useReportStore()
const loading = ref(true)

const dashboard = computed(() => store.dashboard)
const k = computed(() => dashboard.value?.kpis ?? {})
const tr = computed(() => dashboard.value?.trends ?? {})
const sp = computed(() => dashboard.value?.sparks ?? {})

/* ------------------------------------------------------------------ */
/*  Charts                                                             */
/* ------------------------------------------------------------------ */
const trendRows = computed(() => dashboard.value?.trend ?? [])
const lineLabels = computed(() => trendRows.value.map((r) => r.date))
const lineSeries = computed(() => [
  { name: t('reports.dashboardPage.borrows'), values: trendRows.value.map((r) => r.borrows), color: '#3b82f6' },
  { name: t('reports.dashboardPage.returns'), values: trendRows.value.map((r) => r.returns), color: '#10b981' },
])

const categoryItems = computed(() =>
  (dashboard.value?.by_category ?? []).map((c) => ({ name: c.name, value: c.value })),
)

const copyLabels = computed(() => ({
  available: t('reports.dashboardPage.copyAvailable'),
  borrowed: t('reports.dashboardPage.copyBorrowed'),
  lost: t('reports.dashboardPage.copyLost'),
  damaged: t('reports.dashboardPage.copyDamaged'),
}))
const copyColors = {
  available: '#10b981',
  borrowed: '#3b82f6',
  lost: '#ef4444',
  damaged: '#f59e0b',
}
const copyItems = computed(() =>
  (dashboard.value?.copy_status ?? []).map((c) => ({
    name: copyLabels.value[c.status] ?? c.status,
    value: c.value,
    color: copyColors[c.status],
  })),
)

const agingSeries = computed(() => ({
  labels: (dashboard.value?.overdue_aging ?? []).map((a) => `${a.label} ${t('reports.dashboardPage.days')}`),
  values: (dashboard.value?.overdue_aging ?? []).map((a) => a.value),
}))

/* ------------------------------------------------------------------ */
/*  Rankings                                                           */
/* ------------------------------------------------------------------ */
const topBookItems = computed(() =>
  (dashboard.value?.top_books ?? []).map((b) => ({ key: b.id, name: b.title, value: b.borrow_count })),
)
const topMemberItems = computed(() =>
  (dashboard.value?.top_members ?? []).map((m) => ({ key: m.id, name: m.name, sub: m.email, value: m.borrow_count })),
)

/* ------------------------------------------------------------------ */
/*  Lists                                                              */
/* ------------------------------------------------------------------ */
// Intl does not know "kh" — it must be "km" for Khmer.
const intlLocale = computed(() => (locale.value === 'kh' ? 'km' : locale.value))

const timeAgo = (iso) => {
  try {
    const diff = (new Date(iso).getTime() - Date.now()) / 1000
    const rtf = new Intl.RelativeTimeFormat(intlLocale.value, { numeric: 'auto' })
    for (const [unit, secs] of [['day', 86400], ['hour', 3600], ['minute', 60]]) {
      if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
    }
    return rtf.format(0, 'second')
  } catch {
    return analyticsService.formatDate(iso)
  }
}

const activityMeta = computed(() => ({
  borrow:      { tone: 'blue',    label: t('reports.dashboardPage.actBorrow') },
  return:      { tone: 'emerald', label: t('reports.dashboardPage.actReturn') },
  fine:        { tone: 'orange',  label: t('reports.dashboardPage.actFine') },
  reservation: { tone: 'amber',   label: t('reports.dashboardPage.actReservation') },
}))

const activitySub = (a) => {
  if (a.type === 'fine') return analyticsService.formatCurrency(a.amount)
  // reservations send the book title as both name and book — don't repeat it
  return a.book && a.book !== a.name ? a.book : ''
}

const activityItems = computed(() =>
  (dashboard.value?.recent_activity ?? []).map((a, i) => ({
    id: `${a.type}-${i}`,
    title: a.name,
    sub: activitySub(a),
    badge: activityMeta.value[a.type]?.label,
    tone: activityMeta.value[a.type]?.tone,
    meta: timeAgo(a.at),
  })),
)

const dueSoonItems = computed(() =>
  (dashboard.value?.due_soon ?? []).map((r) => ({
    id: r.id,
    title: r.book,
    sub: r.member,
    badge: r.days_left <= 0
      ? t('reports.dashboardPage.dueToday')
      : t('reports.dashboardPage.daysLeft', { n: r.days_left }),
    tone: r.days_left <= 0 ? 'red' : 'amber',
  })),
)

const waitingItems = computed(() =>
  (dashboard.value?.waiting_reservations ?? []).map((r) => ({
    id: r.book_id,
    title: r.title,
    sub: t('reports.dashboardPage.inStock', { n: r.available }),
    badge: t('reports.dashboardPage.waitingCount', { n: r.waiting }),
    tone: r.available === 0 ? 'red' : 'blue',
  })),
)

/* ------------------------------------------------------------------ */
/*  Quick links                                                        */
/* ------------------------------------------------------------------ */
const quickLinks = [
  {
    to: '/reports/borrow', labelKey: 'reports.borrowPage.title', icon: ArrowsRightLeftIcon,
    iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    hoverCls: 'hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-400/30 hover:text-emerald-700 dark:hover:text-emerald-300',
  },
  {
    to: '/reports/fine', labelKey: 'reports.finePage.title', icon: BanknotesIcon,
    iconCls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    hoverCls: 'hover:bg-amber-50/60 dark:hover:bg-amber-500/10 hover:border-amber-300 dark:hover:border-amber-400/30 hover:text-amber-700 dark:hover:text-amber-300',
  },
  {
    to: '/reports/user', labelKey: 'reports.userPage.title', icon: UsersIcon,
    iconCls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
    hoverCls: 'hover:bg-violet-50/60 dark:hover:bg-violet-500/10 hover:border-violet-300 dark:hover:border-violet-400/30 hover:text-violet-700 dark:hover:text-violet-300',
  },
]

/* ------------------------------------------------------------------ */
/*  Header info                                                        */
/* ------------------------------------------------------------------ */
const rangeText = computed(() => {
  const r = dashboard.value?.range
  if (!r?.from || !r?.to) return ''
  return `${analyticsService.formatDate(r.from)} → ${analyticsService.formatDate(r.to)}`
})

/* ------------------------------------------------------------------ */
/*  Data loading                                                       */
/* ------------------------------------------------------------------ */
let lastFilters = {}

// ReportFilter emits on mount, so no separate onMounted(load) is needed.
const onFilterApply = async (filters) => {
  lastFilters = filters
  loading.value = true
  try {
    await store.loadDashboard(filters)
  } finally {
    loading.value = false
  }
}

const refresh = () => onFilterApply(lastFilters)
</script>
<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center flex-shrink-0 text-xl shadow-2xs">
          <ChartBarIcon class="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('reports.dashboardPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('reports.dashboardPage.subtitle') }}</p>
        </div>
      </div>
      <ReportFilter :show-search="false" @apply="onFilterApply" />
    </div>

    <!-- Reports Navigation -->
    <ReportsNav />

    <!-- Main Content Container with White Box & Dashed Border -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">

      <div v-if="loading" class="p-16 text-center text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">
        {{ t('reports.dashboardPage.loading') }}
      </div>

      <template v-else-if="dashboard">
        <!-- Solid Colored KPI Summary Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportSummaryCard :label="t('reports.dashboardPage.totalBorrows')"     :value="dashboard.kpis.total_borrows"     bg="bg-blue-600"    :badge="t('reports.badge.total')"    :icon="BookOpenIcon" />
          <ReportSummaryCard :label="t('reports.dashboardPage.activeBorrows')"    :value="dashboard.kpis.active_borrows"    bg="bg-emerald-600" :badge="t('reports.badge.active')"   :icon="ArrowsRightLeftIcon" />
          <ReportSummaryCard :label="t('reports.dashboardPage.overdue')"         :value="dashboard.kpis.overdue_borrows"   bg="bg-red-500"      :badge="t('reports.badge.alert')"    :icon="ExclamationTriangleIcon" />
          <ReportSummaryCard :label="t('reports.dashboardPage.newMembers')"       :value="dashboard.kpis.new_members"       bg="bg-purple-600"   :badge="t('reports.badge.users')"    :icon="UsersIcon" />
          <ReportSummaryCard :label="t('reports.dashboardPage.finesPeriod')"      :value="dashboard.kpis.total_fines"       format="currency" bg="bg-orange-500" :badge="t('reports.badge.fines')" :icon="BanknotesIcon" />
          <ReportSummaryCard :label="t('reports.dashboardPage.outstandingFines')" :value="dashboard.kpis.unpaid_fines"      format="currency" bg="bg-rose-600"   :badge="t('reports.badge.unpaid')" :icon="CreditCardIcon" />
          <ReportSummaryCard :label="t('reports.dashboardPage.totalBooks')"       :value="dashboard.kpis.total_books"       bg="bg-indigo-600"   :badge="t('reports.badge.catalog')"  :icon="RectangleStackIcon" />
          <ReportSummaryCard :label="t('reports.dashboardPage.availableCopies')"  :value="dashboard.kpis.available_copies"  bg="bg-teal-600"     :badge="t('reports.badge.stock')"    :icon="CheckCircleIcon" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <ReportChart :title="t('reports.dashboardPage.borrowsOverTime')" :labels="borrowSeries.labels" :values="borrowSeries.values" type="line" color="#10b981" />
          <ReportChart :title="t('reports.dashboardPage.revenueOverTime')" :labels="revenueSeries.labels" :values="revenueSeries.values" type="bar" color="#f97316" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-slate-50/50 rounded-2xl border-2 border-slate-200 p-5">
            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">{{ t('reports.dashboardPage.mostBorrowedBooks') }}</h3>
            <ul class="divide-y divide-slate-200">
              <li v-for="book in dashboard.top_books" :key="book.id" class="py-3 flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-700">{{ book.title }}</span>
                <span class="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">{{ book.borrow_count }} {{ t('reports.dashboardPage.borrowsSuffix') }}</span>
              </li>
              <li v-if="!dashboard.top_books.length" class="py-6 text-center text-sm text-slate-400 font-bold">{{ t('reports.dashboardPage.noDataYet') }}</li>
            </ul>
          </div>

          <div class="bg-slate-50/50 rounded-2xl border-2 border-slate-200 p-5 space-y-2">
            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">{{ t('reports.dashboardPage.detailedReports') }}</h3>
            <RouterLink
              v-for="link in quickLinks" :key="link.to" :to="link.to"
              class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors shadow-2xs"
            >
              <component :is="link.icon" class="w-4 h-4 flex-shrink-0" />
              <span class="flex-1">{{ t(link.labelKey) }}</span>
              <ChevronRightIcon class="w-4 h-4" />
            </RouterLink>
          </div>
        </div>
      </template>

      <div v-else class="p-16 text-center text-slate-400 text-sm font-bold">
        {{ t('reports.dashboardPage.noDashboardData') }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChartBarIcon, ArrowsRightLeftIcon, BanknotesIcon, UsersIcon, ChevronRightIcon,
  BookOpenIcon, ExclamationTriangleIcon, CreditCardIcon, RectangleStackIcon, CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useReportStore } from '../store'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportChart from '../components/ReportChart.vue'
import ReportsNav from '../components/ReportsNav.vue'

const { t } = useI18n()

const store = useReportStore()
const loading = ref(true)

const dashboard = computed(() => store.dashboard)
const borrowSeries = computed(() => analyticsService.toChartSeries(dashboard.value?.borrow_trend ?? []))
const revenueSeries = computed(() => analyticsService.toChartSeries(dashboard.value?.revenue_trend ?? []))

const quickLinks = [
  { to: '/reports/borrow', labelKey: 'reports.borrowPage.title', icon: ArrowsRightLeftIcon },
  { to: '/reports/fine',   labelKey: 'reports.finePage.title', icon: BanknotesIcon },
  { to: '/reports/user',   labelKey: 'reports.userPage.title', icon: UsersIcon },
]

const load = async (filters = {}) => {
  loading.value = true
  await store.loadDashboard(filters)
  loading.value = false
}

const onFilterApply = (filters) => load(filters)

onMounted(() => load())
</script>
<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-6 shadow-lg dark:shadow-none flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-600/20">
          <CurrencyDollarIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('reports.revenuePage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('reports.revenuePage.subtitle') }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ t('reports.revenuePage.backToReports') }}</span>
        </RouterLink>

        <ExportReportButton v-if="authStore.role === 'admin'" type="revenue" :filters="filters" />
      </div>
    </div>

    <!-- Revenue is admin-only -->
    <div
      v-if="authStore.role !== 'admin'"
      class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-10 shadow-lg dark:shadow-none text-center"
    >
      <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/15 border-2 border-amber-200 dark:border-amber-400/30 flex items-center justify-center mx-auto mb-3">
        <LockClosedIcon class="w-6 h-6 text-amber-600 dark:text-amber-300" />
      </div>
      <p class="text-sm font-black text-slate-800 dark:text-white">{{ t('reports.revenuePage.adminsOnly') }}</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{{ t('reports.revenuePage.adminsOnlyHint') }}</p>
    </div>

    <div v-else class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/15 p-6 md:p-8 shadow-lg dark:shadow-none border-dashed space-y-6">

      <ReportFilter
        :range="range" @apply="onApply" :show-search="false" />

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard :label="t('reports.revenuePage.totalRevenue')" :value="summary.total"      format="currency" bg="bg-emerald-600" :badge="t('reports.badge.total')"    :icon="BanknotesIcon" />
        <ReportSummaryCard :label="t('reports.revenuePage.thisMonth')"    :value="summary.this_month" format="currency" bg="bg-blue-600"    :badge="t('reports.badge.month')"    :icon="CalendarIcon" />
        <ReportSummaryCard :label="t('reports.revenuePage.fines')"        :value="summary.fines"      format="currency" bg="bg-orange-500"  :badge="t('reports.badge.fines')"    :icon="CurrencyDollarIcon" />
        <ReportSummaryCard :label="t('reports.revenuePage.services')"     :value="summary.services"   format="currency" bg="bg-slate-700"   :badge="t('reports.badge.services')" :icon="RectangleStackIcon" />
      </div>

      <!-- The API already returned `trend`, it just was never drawn -->
      <ReportChart v-if="summary" :title="t('reports.revenuePage.trend')" :labels="trendSeries.labels" :values="trendSeries.values" type="bar" color="#f97316" :height="260" />

      <ReportTable :columns="columns" :rows="rows" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <template #cell-description="{ row }">
          <span class="font-semibold text-slate-700 dark:text-slate-100">{{ row.description ?? '—' }}</span>
        </template>
        <template #cell-amount="{ row }">
          <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(row.amount) }}</span>
        </template>
        <template #cell-created_at="{ row }">
          <span class="text-slate-600 dark:text-slate-300">{{ row.created_at }}</span>
        </template>
      </ReportTable>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CurrencyDollarIcon, ArrowLeftIcon, BanknotesIcon, CalendarIcon, RectangleStackIcon, LockClosedIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ReportChart from '../components/ReportChart.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const { t } = useI18n()
const authStore = useAuthStore()

const columns = computed(() => [
  { key: 'id', label: '#' },
  { key: 'description', label: t('reports.columns.description') },
  { key: 'amount', label: t('reports.columns.amount') },
  { key: 'created_at', label: t('reports.columns.date') },
])

const rows = ref([])
const summary = ref(null)
const trend = ref([])
const loading = ref(false)
const range = ref(null)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '', all_time: false })

const trendSeries = computed(() => analyticsService.toChartSeries(trend.value))
const formatCurrency = (v) => analyticsService.formatCurrency(v)

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.revenue({ ...filters, page })
    rows.value = data.data.data
    summary.value = data.summary
    trend.value = data.trend ?? []
    range.value = data.range ?? null
    pagination.current_page = data.data.current_page
    pagination.last_page = data.data.last_page
  } finally {
    loading.value = false
  }
}

// ReportFilter emits on mount; only admins hit the API (a librarian would get a 403).
const onApply = (f) => {
  Object.assign(filters, f)
  if (authStore.role === 'admin') load(1)
}
const onPageChange = (page) => load(page)
</script>
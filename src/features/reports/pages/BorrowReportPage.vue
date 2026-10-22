<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-6 shadow-lg dark:shadow-none flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-600/20">
          <ArrowsRightLeftIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('reports.borrowPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('reports.borrowPage.subtitle') }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ t('reports.borrowPage.backToReports') }}</span>
        </RouterLink>

        <ExportReportButton type="borrow" :filters="filters" />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/15 p-6 md:p-8 shadow-lg dark:shadow-none border-dashed space-y-6">

      <ReportFilter
        :status-options="statusOptions"
        :status-label="t('reports.filter.status')"
        :show-search="false"
        :initial="{ status: route.query.status || '' }"
        @apply="onApply"
      />

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard :label="t('reports.borrowPage.total')"    :value="summary.total"    bg="bg-slate-700"   :badge="t('reports.badge.total')"    :icon="BookOpenIcon" />
        <ReportSummaryCard :label="t('reports.borrowPage.returned')" :value="summary.returned" bg="bg-emerald-600" :badge="t('reports.badge.returned')" :icon="CheckCircleIcon" />
        <ReportSummaryCard :label="t('reports.borrowPage.active')"   :value="summary.active"   bg="bg-blue-600"    :badge="t('reports.badge.active')"   :icon="ArrowsRightLeftIcon" />
        <ReportSummaryCard :label="t('reports.borrowPage.overdue')"  :value="summary.overdue"  bg="bg-red-500"     :badge="t('reports.badge.alert')"    :icon="ExclamationTriangleIcon" />
      </div>

      <div v-if="summary" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <ReportChart :title="t('reports.borrowPage.trend')" :labels="trendSeries.labels" :values="trendSeries.values" type="line" color="#3b82f6" :height="240" />
        </div>
        <ReportDonut :title="t('reports.borrowPage.statusSplit')" :items="statusItems" :height="240" />
      </div>

      <ReportTable :columns="columns" :rows="rows" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <!-- API returns row.member.user (not row.user) -->
        <template #cell-member.user.name="{ row }">
          <div>
            <p class="font-bold text-slate-700 dark:text-slate-100">{{ row.member?.user?.name ?? t('reports.common.guest') }}</p>
            <p class="text-[11px] text-slate-400 dark:text-slate-500">{{ row.member?.user?.email }}</p>
          </div>
        </template>
        <template #cell-book_copy.book.title="{ row }">
          <span class="font-semibold text-slate-700 dark:text-slate-100">{{ row.book_copy?.book?.title ?? row.bookCopy?.book?.title ?? '—' }}</span>
        </template>
        <template #cell-borrow_date="{ row }">{{ fmtDate(row.borrow_date) }}</template>
        <template #cell-due_date="{ row }">
          <span :class="isLate(row) ? 'text-red-600 dark:text-red-300 font-bold' : ''">{{ fmtDate(row.due_date) }}</span>
        </template>
        <template #cell-return_date="{ row }">{{ fmtDate(row.return_date) }}</template>
        <template #cell-status="{ row }">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border" :class="statusStyles[displayStatus(row)] ?? statusStyles.borrowed">
            {{ statusLabel(displayStatus(row)) }}
          </span>
        </template>
      </ReportTable>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowsRightLeftIcon, ArrowLeftIcon, BookOpenIcon, CheckCircleIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ReportChart from '../components/ReportChart.vue'
import ReportDonut from '../components/ReportDonut.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const { t } = useI18n()
const route = useRoute()

const statusOptions = computed(() => [
  { value: 'borrowed', label: t('reports.borrowPage.active') },
  { value: 'returned', label: t('reports.borrowPage.returned') },
  { value: 'overdue', label: t('reports.borrowPage.overdue') },
])

const statusStyles = {
  borrowed: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/30',
  returned: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30',
  overdue: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30',
}

const statusLabelMap = computed(() => ({
  borrowed: t('reports.borrowPage.active'),
  returned: t('reports.borrowPage.returned'),
  overdue: t('reports.borrowPage.overdue'),
}))
const statusLabel = (s) => statusLabelMap.value[s] || s

// A "borrowed" row that is past its due date is shown as overdue.
const isLate = (row) => row.status === 'borrowed' && row.due_date && new Date(row.due_date) < new Date()
const displayStatus = (row) => (isLate(row) ? 'overdue' : row.status)
const fmtDate = (v) => analyticsService.formatDate(v)

const columns = computed(() => [
  { key: 'id', label: '#' },
  { key: 'member.user.name', label: t('reports.columns.member') },
  { key: 'book_copy.book.title', label: t('reports.columns.book') },
  { key: 'borrow_date', label: t('reports.columns.borrowed') },
  { key: 'due_date', label: t('reports.columns.due') },
  { key: 'return_date', label: t('reports.columns.returnedOn') },
  { key: 'status', label: t('reports.columns.status') },
])

const rows = ref([])
const summary = ref(null)
const trend = ref([])
const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '', status: '', all_time: false })

const trendSeries = computed(() => analyticsService.toChartSeries(trend.value))
const statusItems = computed(() => !summary.value ? [] : [
  { name: t('reports.borrowPage.returned'), value: summary.value.returned, color: '#10b981' },
  { name: t('reports.borrowPage.active'), value: Math.max(summary.value.active - summary.value.overdue, 0), color: '#3b82f6' },
  { name: t('reports.borrowPage.overdue'), value: summary.value.overdue, color: '#ef4444' },
])

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.borrow({ ...filters, page })
    rows.value = data.data.data
    summary.value = data.summary
    trend.value = data.trend ?? []
    pagination.current_page = data.data.current_page
    pagination.last_page = data.data.last_page
  } finally {
    loading.value = false
  }
}

const onApply = (f) => { Object.assign(filters, f); load(1) }
const onPageChange = (page) => load(page)
</script>
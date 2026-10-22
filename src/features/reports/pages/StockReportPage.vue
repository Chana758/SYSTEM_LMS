<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-6 shadow-lg dark:shadow-none flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-600/20">
          <ArchiveBoxIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('reports.stockPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('reports.stockPage.subtitle') }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ t('reports.stockPage.backToReports') }}</span>
        </RouterLink>

        <ExportReportButton type="stock" :filters="filters" />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/15 p-6 md:p-8 shadow-lg dark:shadow-none border-dashed space-y-6">

      <ReportFilter @apply="onApply" :status-label="t('reports.stockPage.category')" :status-options="categories" :show-presets="false">
        <template #extra>
          <label class="h-11 inline-flex items-center gap-2 px-3 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-200 cursor-pointer">
            <input type="checkbox" v-model="lowOnly" @change="load(1)" class="accent-red-500" />
            {{ t('reports.stockPage.lowOnly') }}
          </label>
          <label class="h-11 inline-flex items-center gap-2 px-3 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-200 cursor-pointer">
            <input type="checkbox" v-model="deadOnly" @change="load(1)" class="accent-amber-500" />
            {{ t('reports.stockPage.deadOnly') }}<span v-if="summary" class="text-slate-400"> ({{ summary.dead_stock }})</span>
          </label>
        </template>
      </ReportFilter>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard :label="t('reports.stockPage.totalBooks')" :value="summary.total_books" bg="bg-slate-700" :badge="t('reports.badge.total')"     :icon="RectangleStackIcon" />
        <ReportSummaryCard :label="t('reports.stockPage.available')"  :value="summary.available"   bg="bg-teal-600" :badge="t('reports.badge.available')" :icon="CheckCircleIcon" />
        <ReportSummaryCard :label="t('reports.stockPage.borrowed')"   :value="summary.borrowed"    bg="bg-blue-600" :badge="t('reports.badge.borrowed')"  :icon="ArrowsRightLeftIcon" />
        <ReportSummaryCard :label="t('reports.stockPage.lowStock')"   :value="summary.low_stock"   bg="bg-red-500"  :badge="t('reports.badge.alert')"     :icon="ExclamationTriangleIcon" />
      </div>

      <ReportSeriesChart
        v-if="summary"
        :title="t('reports.stockPage.byCategory')"
        :labels="byCategory.map((c) => c.name)"
        :series="categorySeries"
        type="bar" stacked :height="260"
      />

      <ReportTable :columns="columns" :rows="rows" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <template #cell-title="{ row }">
          <span class="font-semibold text-slate-700 dark:text-slate-100">{{ row.title ?? '—' }}</span>
        </template>
        <template #cell-category.name="{ row }">
          <span class="text-slate-600 dark:text-slate-300">{{ row.category?.name ?? '—' }}</span>
        </template>
        <template #cell-availability="{ row }">
          <div class="w-28 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
            <div class="h-full rounded-full" :class="barTone[stockState(row)]" :style="{ width: availPct(row) + '%' }"></div>
          </div>
        </template>
        <template #cell-status="{ row }">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border" :class="badgeTone[stockState(row)]">
            {{ stateLabel[stockState(row)] }}
          </span>
        </template>
      </ReportTable>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArchiveBoxIcon, ArrowLeftIcon, RectangleStackIcon, CheckCircleIcon, ArrowsRightLeftIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import apiClient from '@/api/axios'
import { reportService } from '../services/reportService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ReportSeriesChart from '../components/ReportSeriesChart.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const { t } = useI18n()

const columns = computed(() => [
  { key: 'title', label: t('reports.columns.bookTitle') },
  { key: 'category.name', label: t('reports.columns.category') },
  { key: 'total_copies', label: t('reports.columns.total') },
  { key: 'available_copies', label: t('reports.columns.available') },
  { key: 'borrowed_copies', label: t('reports.columns.borrowedCopies') },
  { key: 'availability', label: t('reports.columns.availability') },
  { key: 'status', label: t('reports.columns.status') },
])

const rows = ref([])
const summary = ref(null)
const byCategory = ref([])
const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '', status: '', all_time: false })
const categories = ref([])
const lowOnly = ref(false)
const deadOnly = ref(false)

// 0 copies = out · ≤2 = low · else ok  (same threshold as the API)
const stockState = (r) => (r.available_copies <= 0 ? 'out' : r.available_copies <= 2 ? 'low' : 'ok')
const availPct = (r) => (r.total_copies ? Math.round((r.available_copies / r.total_copies) * 100) : 0)
const stateLabel = computed(() => ({
  out: t('reports.stockPage.outOfStock'),
  low: t('reports.stockPage.lowBadge'),
  ok: t('reports.stockPage.available'),
}))
const badgeTone = {
  ok:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30',
  low: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30',
  out: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30',
}
const barTone = { ok: 'bg-emerald-500', low: 'bg-amber-500', out: 'bg-red-500' }

const categorySeries = computed(() => [
  { name: t('reports.stockPage.available'), values: byCategory.value.map((c) => c.available), color: '#10b981' },
  { name: t('reports.stockPage.borrowed'), values: byCategory.value.map((c) => c.borrowed), color: '#3b82f6' },
  { name: t('reports.stockPage.lost'), values: byCategory.value.map((c) => c.lost), color: '#ef4444' },
])

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.stock({
      ...filters,
      low_stock: lowOnly.value || undefined,
      dead_stock: deadOnly.value || undefined,
      page,
    })
    rows.value = data.data.data
    summary.value = data.summary
    byCategory.value = data.by_category ?? []
    pagination.current_page = data.data.current_page
    pagination.last_page = data.data.last_page
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const { data } = await apiClient.get('/categories')
    const list = data.data ?? data
    categories.value = list.map((c) => ({ value: c.id, label: c.name }))
  } catch (e) {
    categories.value = []
  }
}

const onApply = (f) => { Object.assign(filters, f); load(1) }
const onPageChange = (page) => load(page)

// ReportFilter emits on mount, which already triggers load()
onMounted(loadCategories)
</script>
<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-600/20">
          <ArchiveBoxIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('reports.stockPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('reports.stockPage.subtitle') }}</p>
        </div>
      </div>

      <!-- Action Buttons Group (Back & Export) on the right -->
      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ t('reports.stockPage.backToReports') }}</span>
        </RouterLink>

        <ExportReportButton type="stock" :filters="filters" />
      </div>
    </div>

    <!-- Main Content Container with White Box & Dashed Border -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">

      <!-- Filters Section -->
      <ReportFilter @apply="onApply" :status-label="t('reports.stockPage.category')" :status-options="categories" />

      <!-- Solid Colored Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard :label="t('reports.stockPage.totalBooks')" :value="summary.total_books" bg="bg-slate-700" :badge="t('reports.badge.total')"     :icon="RectangleStackIcon" />
        <ReportSummaryCard :label="t('reports.stockPage.available')"  :value="summary.available"   bg="bg-teal-600" :badge="t('reports.badge.available')" :icon="CheckCircleIcon" />
        <ReportSummaryCard :label="t('reports.stockPage.borrowed')"   :value="summary.borrowed"    bg="bg-blue-600" :badge="t('reports.badge.borrowed')"  :icon="ArrowsRightLeftIcon" />
        <ReportSummaryCard :label="t('reports.stockPage.lowStock')"   :value="summary.low_stock"   bg="bg-red-500"  :badge="t('reports.badge.alert')"     :icon="ExclamationTriangleIcon" />
      </div>

      <!-- Data Table -->
      <ReportTable :columns="columns" :rows="rows" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <template #cell-title="{ row }">
          <span class="font-semibold text-slate-700">{{ row.title ?? '—' }}</span>
        </template>
        <template #cell-category.name="{ row }">
          <span class="text-slate-600">{{ row.category?.name ?? '—' }}</span>
        </template>
        <template #cell-status="{ row }">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border" :class="row.available_copies > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'">
            {{ row.available_copies > 0 ? t('reports.stockPage.available') : t('reports.stockPage.outOfStock') }}
          </span>
        </template>
      </ReportTable>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  RectangleStackIcon,
  CheckCircleIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import apiClient from '@/api/axios'
import { reportService } from '../services/reportService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const { t } = useI18n()

const columns = computed(() => [
  { key: 'title', label: t('reports.columns.bookTitle') },
  { key: 'category.name', label: t('reports.columns.category') },
  { key: 'total_copies', label: t('reports.columns.total') },
  { key: 'available_copies', label: t('reports.columns.available') },
])

const rows = ref([])
const summary = ref(null)
const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '', status: '' })
const categories = ref([])

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.stock({ ...filters, page })
    rows.value = data.data.data
    summary.value = data.summary
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

const onApply = (f) => {
  Object.assign(filters, f)
  load(1)
}

const onPageChange = (page) => load(page)

onMounted(() => {
  load()
  loadCategories()
})
</script>
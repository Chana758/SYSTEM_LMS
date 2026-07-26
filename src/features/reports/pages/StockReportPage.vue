<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center flex-shrink-0 text-xl shadow-2xs">
          <ArchiveBoxIcon class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Stock Report</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Inventory levels and availability</p>
        </div>
      </div>

      <!-- Action Buttons Group (Back & Export) on the right -->
      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>Back to Reports</span>
        </RouterLink>

        <ExportReportButton type="stock" :filters="filters" />
      </div>
    </div>

    <!-- Main Content Container with White Box & Dashed Border -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">
      
      <!-- Filters Section -->
      <ReportFilter @apply="onApply" status-label="Category" :status-options="categories" />

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard label="Total Books" :value="summary.total_books" color="text-slate-900"   bg="bg-slate-50" />
        <ReportSummaryCard label="Available"   :value="summary.available"   color="text-emerald-600" bg="bg-emerald-50" />
        <ReportSummaryCard label="Borrowed"    :value="summary.borrowed"    color="text-blue-600"    bg="bg-blue-50" />
        <ReportSummaryCard label="Low Stock"   :value="summary.low_stock"   color="text-red-500"     bg="bg-red-50" />
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
            {{ row.available_copies > 0 ? 'Available' : 'Out of Stock' }}
          </span>
        </template>
      </ReportTable>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArchiveBoxIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const columns = [
  { key: 'title', label: 'Book Title' },
  { key: 'category.name', label: 'Category' },
  { key: 'total_copies', label: 'Total' },
  { key: 'available_copies', label: 'Available' },
]

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

const onApply = (f) => {
  Object.assign(filters, f)
  load(1)
}

const onPageChange = (page) => load(page)
</script>
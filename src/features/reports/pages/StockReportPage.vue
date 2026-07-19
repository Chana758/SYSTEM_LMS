<template>
  <div class="p-6 space-y-6">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          <ArchiveBoxIcon class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Stock Report</h1>
          <p class="text-sm text-gray-400 mt-0.5">Inventory levels and availability</p>
        </div>
      </div>
      <ExportReportButton type="stock" :filters="filters" />
    </div>

    <ReportFilter @apply="onApply" status-label="Category" :status-options="categories" />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
      <ReportSummaryCard label="Total Books" :value="summary.total_books" color="text-gray-800" bg="bg-gray-50" />
      <ReportSummaryCard label="Available"   :value="summary.available" color="text-emerald-600" bg="bg-emerald-50" />
      <ReportSummaryCard label="Borrowed"    :value="summary.borrowed" color="text-blue-600" bg="bg-blue-50" />
      <ReportSummaryCard label="Low Stock"   :value="summary.low_stock" color="text-red-500" bg="bg-red-50" />
    </div>

    <ReportTable :columns="columns" :rows="rows" :loading="loading" :pagination="pagination" @page-change="onPageChange">
      <template #cell-status="{ row }">
        <span class="text-xs font-bold" :class="row.available_copies > 0 ? 'text-emerald-600' : 'text-red-500'">
          {{ row.available_copies > 0 ? 'Available' : 'Out of Stock' }}
        </span>
      </template>
    </ReportTable>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArchiveBoxIcon } from '@heroicons/vue/24/outline'
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

const rows = ref([]); const summary = ref(null); const loading = ref(false);
const pagination = reactive({ current_page: 1, last_page: 1 });
const filters = reactive({ date_from: '', date_to: '', status: '' });
const categories = ref([])

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.stock({ ...filters, page })
    rows.value = data.data.data
    summary.value = data.summary
    pagination.current_page = data.data.current_page
    pagination.last_page = data.data.last_page
  } finally { loading.value = false }
}

const onApply = (f) => { Object.assign(filters, f); load(1) }
const onPageChange = (page) => load(page)
</script>
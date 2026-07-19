<template>
  <div class="p-6 space-y-6">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <ArrowsRightLeftIcon class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Borrow Report</h1>
          <p class="text-sm text-gray-400 mt-0.5">Circulation activity for the selected period</p>
        </div>
      </div>
      <ExportReportButton type="borrow" :filters="filters" />
    </div>

    <ReportFilter
      :status-options="statusOptions"
      status-label="Status"
      :show-search="false"
      @apply="onApply"
    />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
      <ReportSummaryCard label="Total"    :value="summary.total"    color="text-gray-800"   bg="bg-gray-50" />
      <ReportSummaryCard label="Returned" :value="summary.returned" color="text-emerald-700" bg="bg-emerald-50" />
      <ReportSummaryCard label="Active"   :value="summary.active"   color="text-blue-600"   bg="bg-blue-50" />
      <ReportSummaryCard label="Overdue"  :value="summary.overdue"  color="text-red-500"    bg="bg-red-50" />
    </div>

    <ReportTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
    >
      <template #cell-user.name="{ row }">
        <div>
          <p class="font-bold text-gray-700">{{ row.user?.name ?? 'Guest' }}</p>
          <p class="text-[11px] text-gray-400">{{ row.user?.email }}</p>
        </div>
      </template>
      <template #cell-book_copy.book.title="{ row }">
        {{ row.book_copy?.book?.title ?? '—' }}
      </template>
      <template #cell-status="{ row }">
        <span
          class="px-3 py-1 rounded-full text-[10px] font-black uppercase border"
          :class="statusStyles[row.status] ?? statusStyles.borrowed"
        >
          {{ row.status }}
        </span>
      </template>
    </ReportTable>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const statusOptions = [
  { value: 'borrowed', label: 'Active' },
  { value: 'returned', label: 'Returned' },
  { value: 'overdue', label: 'Overdue' },
]

const statusStyles = {
  borrowed: 'bg-blue-50 text-blue-600 border-blue-200',
  returned: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  overdue: 'bg-red-50 text-red-600 border-red-200',
}

const columns = [
  { key: 'id', label: '#' },
  { key: 'user.name', label: 'Member' },
  { key: 'book_copy.book.title', label: 'Book' },
  { key: 'borrow_date', label: 'Borrowed' },
  { key: 'due_date', label: 'Due' },
  { key: 'status', label: 'Status' },
]

const rows = ref([])
const summary = ref(null)
const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '', status: '' })

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.borrow({ ...filters, page })
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
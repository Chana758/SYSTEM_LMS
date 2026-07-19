<template>
  <div class="p-6 space-y-6">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <BanknotesIcon class="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Fine Report</h1>
          <p class="text-sm text-gray-400 mt-0.5">Fines issued and collected for the selected period</p>
        </div>
      </div>
      <ExportReportButton type="fine" :filters="filters" />
    </div>

    <ReportFilter
      :status-options="statusOptions"
      status-label="Status"
      :show-search="false"
      @apply="onApply"
    />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
      <ReportSummaryCard label="Total Fines"  :value="summary.count"         color="text-gray-800" bg="bg-gray-50" />
      <ReportSummaryCard label="Total Amount" :value="summary.total_amount"  format="currency" color="text-gray-800" bg="bg-gray-50" />
      <ReportSummaryCard label="Collected"    :value="summary.paid_amount"   format="currency" color="text-emerald-700" bg="bg-emerald-50" />
      <ReportSummaryCard label="Outstanding"  :value="summary.unpaid_amount" format="currency" color="text-red-500" bg="bg-red-50" />
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
      <template #cell-amount="{ row }">
        {{ formatCurrency(row.amount) }}
      </template>
      <template #cell-status="{ row }">
        <span
          class="px-3 py-1 rounded-full text-[10px] font-black uppercase border"
          :class="row.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'"
        >
          {{ row.status }}
        </span>
      </template>
    </ReportTable>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { BanknotesIcon } from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const statusOptions = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
]

const columns = [
  { key: 'id', label: '#' },
  { key: 'user.name', label: 'Member' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'paid_at', label: 'Paid At' },
]

const rows = ref([])
const summary = ref(null)
const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '', status: '' })

const formatCurrency = (v) => analyticsService.formatCurrency(v)

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.fine({ ...filters, page })
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
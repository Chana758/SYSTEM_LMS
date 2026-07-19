<template>
  <div class="p-6 space-y-6">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <CurrencyDollarIcon class="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Revenue Report</h1>
          <p class="text-sm text-gray-400 mt-0.5">Financial insights and collection history</p>
        </div>
      </div>
      <ExportReportButton type="revenue" :filters="filters" />
    </div>

    <ReportFilter @apply="onApply" :show-search="false" />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
      <ReportSummaryCard label="Total Revenue" :value="summary.total" format="currency" color="text-emerald-700" bg="bg-emerald-50" />
      <ReportSummaryCard label="This Month"    :value="summary.this_month" format="currency" color="text-blue-600" bg="bg-blue-50" />
      <ReportSummaryCard label="Fines"         :value="summary.fines" format="currency" color="text-orange-600" bg="bg-orange-50" />
      <ReportSummaryCard label="Services"      :value="summary.services" format="currency" color="text-gray-800" bg="bg-gray-50" />
    </div>

    <ReportTable :columns="columns" :rows="rows" :loading="loading" :pagination="pagination" @page-change="onPageChange">
      <template #cell-amount="{ row }">{{ formatCurrency(row.amount) }}</template>
    </ReportTable>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const columns = [
  { key: 'id', label: '#' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'created_at', label: 'Date' },
]

const rows = ref([]); const summary = ref(null); const loading = ref(false);
const pagination = reactive({ current_page: 1, last_page: 1 });
const filters = reactive({ date_from: '', date_to: '' });

const formatCurrency = (v) => analyticsService.formatCurrency(v)

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.revenue({ ...filters, page })
    rows.value = data.data.data
    summary.value = data.summary
    pagination.current_page = data.data.current_page
    pagination.last_page = data.data.last_page
  } finally { loading.value = false }
}

const onApply = (f) => { Object.assign(filters, f); load(1) }
const onPageChange = (page) => load(page)
</script>
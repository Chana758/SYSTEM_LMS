<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-red-50 border-2 border-red-200 flex items-center justify-center flex-shrink-0 text-xl shadow-2xs">
          <BanknotesIcon class="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Fine Report</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Fines issued and collected for the selected period</p>
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

        <ExportReportButton type="fine" :filters="filters" />
      </div>
    </div>

    <!-- Main Content Container with White Box & Dashed Border -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">
      
      <!-- Filters Section -->
      <ReportFilter
        :status-options="statusOptions"
        status-label="Status"
        :show-search="false"
        @apply="onApply"
      />

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard label="Total Fines"  :value="summary.count"         color="text-slate-900"   bg="bg-slate-50" />
        <ReportSummaryCard label="Total Amount" :value="summary.total_amount"  format="currency" color="text-slate-900"   bg="bg-slate-50" />
        <ReportSummaryCard label="Collected"    :value="summary.paid_amount"   format="currency" color="text-emerald-700" bg="bg-emerald-50" />
        <ReportSummaryCard label="Outstanding"  :value="summary.unpaid_amount" format="currency" color="text-red-500"    bg="bg-red-50" />
      </div>

      <!-- Data Table -->
      <ReportTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #cell-user.name="{ row }">
          <div>
            <p class="font-bold text-slate-700">{{ row.user?.name ?? 'Guest' }}</p>
            <p class="text-[11px] text-slate-400">{{ row.user?.email }}</p>
          </div>
        </template>
        <template #cell-amount="{ row }">
          <span class="font-semibold text-slate-700">{{ formatCurrency(row.amount) }}</span>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { BanknotesIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
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
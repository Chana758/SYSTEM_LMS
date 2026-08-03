<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-600/20">
          <ArrowsRightLeftIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Borrow Report</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Circulation activity for the selected period</p>
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

        <ExportReportButton type="borrow" :filters="filters" />
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

      <!-- Solid Colored Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard label="Total Borrows" :value="summary.total"    bg="bg-slate-700"   badge="TOTAL"    :icon="BookOpenIcon" />
        <ReportSummaryCard label="Returned"     :value="summary.returned" bg="bg-emerald-600" badge="RETURNED" :icon="CheckCircleIcon" />
        <ReportSummaryCard label="Active"       :value="summary.active"   bg="bg-blue-600"    badge="ACTIVE"   :icon="ArrowsRightLeftIcon" />
        <ReportSummaryCard label="Overdue"      :value="summary.overdue"  bg="bg-red-500"     badge="ALERT"    :icon="ExclamationTriangleIcon" />
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
        <template #cell-book_copy.book.title="{ row }">
          <span class="font-semibold text-slate-700">{{ row.book_copy?.book?.title ?? '—' }}</span>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  ArrowsRightLeftIcon, 
  ArrowLeftIcon, 
  BookOpenIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/vue/24/outline'
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
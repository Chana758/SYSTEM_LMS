<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-cyan-50 border-2 border-cyan-200 flex items-center justify-center flex-shrink-0 text-xl shadow-2xs">
          <UsersIcon class="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">User Report</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Member activity and registrations for the selected period</p>
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

        <ExportReportButton type="user" :filters="filters" />
      </div>
    </div>

    <!-- Main Content Container with White Box & Dashed Border -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">
      
      <!-- Filters Section -->
      <ReportFilter
        :status-options="roleOptions"
        status-label="Role"
        @apply="onApply"
      />

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard label="Total Users" :value="summary.total_users" color="text-slate-900"   bg="bg-slate-50" />
        <ReportSummaryCard label="New (period)" :value="summary.new_users" color="text-emerald-700" bg="bg-emerald-50" />
        <ReportSummaryCard label="Members"     :value="summary.members"    color="text-blue-600"    bg="bg-blue-50" />
        <ReportSummaryCard label="Staff"       :value="summary.staff"      color="text-orange-600"  bg="bg-orange-50" />
      </div>

      <!-- Data Table -->
      <ReportTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #cell-name="{ row }">
          <span class="font-bold text-slate-700">{{ row.name ?? '—' }}</span>
        </template>
        <template #cell-email="{ row }">
          <span class="text-slate-500">{{ row.email ?? '—' }}</span>
        </template>
        <template #cell-role="{ row }">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-slate-50 text-slate-600 border-slate-200">
            {{ row.role }}
          </span>
        </template>
        <template #cell-total_fines="{ row }">
          <span class="font-semibold text-slate-700">{{ formatCurrency(row.total_fines) }}</span>
        </template>
      </ReportTable>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { UsersIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const roleOptions = [
  { value: 'member', label: 'Member' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'admin', label: 'Admin' },
]

const columns = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'total_borrows', label: 'Borrows' },
  { key: 'active_borrows', label: 'Active' },
  { key: 'total_fines', label: 'Fines' },
]

const rows = ref([])
const summary = ref(null)
const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '', status: '', search: '' })

const formatCurrency = (v) => analyticsService.formatCurrency(v)

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.user({
      ...filters,
      role: filters.status,
      page,
    })
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
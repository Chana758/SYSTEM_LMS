<template>
  <div class="p-6 space-y-6">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
          <UsersIcon class="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">User Report</h1>
          <p class="text-sm text-gray-400 mt-0.5">Member activity and registrations for the selected period</p>
        </div>
      </div>
      <ExportReportButton type="user" :filters="filters" />
    </div>

    <ReportFilter
      :status-options="roleOptions"
      status-label="Role"
      @apply="onApply"
    />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
      <ReportSummaryCard label="Total Users" :value="summary.total_users" color="text-gray-800"   bg="bg-gray-50" />
      <ReportSummaryCard label="New (period)" :value="summary.new_users" color="text-emerald-700" bg="bg-emerald-50" />
      <ReportSummaryCard label="Members"     :value="summary.members"    color="text-blue-600"    bg="bg-blue-50" />
      <ReportSummaryCard label="Staff"       :value="summary.staff"      color="text-orange-600"  bg="bg-orange-50" />
    </div>

    <ReportTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
    >
      <template #cell-role="{ row }">
        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-gray-50 text-gray-600 border-gray-200">
          {{ row.role }}
        </span>
      </template>
      <template #cell-total_fines="{ row }">
        {{ formatCurrency(row.total_fines) }}
      </template>
    </ReportTable>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { UsersIcon } from '@heroicons/vue/24/outline'
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
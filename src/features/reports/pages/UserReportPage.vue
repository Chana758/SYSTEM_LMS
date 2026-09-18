<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-600/20">
          <UsersIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('reports.userPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('reports.userPage.subtitle') }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ t('reports.userPage.backToReports') }}</span>
        </RouterLink>

        <ExportReportButton type="user" :filters="filters" />
      </div>
    </div>

    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">

      <ReportFilter
        :status-options="roleOptions"
        :status-label="t('reports.columns.role')"
        @apply="onApply"
      />

      <!-- Solid Colored Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard :label="t('reports.userPage.totalUsers')"  :value="summary.total_users" bg="bg-slate-700"   :badge="t('reports.badge.total')"   :icon="UserGroupIcon" />
        <ReportSummaryCard :label="t('reports.userPage.newPeriod')"   :value="summary.new_users"   bg="bg-emerald-600" :badge="t('reports.badge.new')"     :icon="UserPlusIcon" />
        <ReportSummaryCard :label="t('reports.userPage.members')"     :value="summary.members"     bg="bg-blue-600"    :badge="t('reports.badge.members')" :icon="UsersIcon" />
        <ReportSummaryCard :label="t('reports.userPage.staff')"       :value="summary.staff"       bg="bg-orange-500"  :badge="t('reports.badge.staff')"   :icon="ShieldCheckIcon" />
      </div>

      <ReportTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #cell-name="{ row }">
          <span class="font-bold text-slate-700">{{ row.user?.name ?? '—' }}</span>
        </template>
        <template #cell-email="{ row }">
          <span class="text-slate-500">{{ row.user?.email ?? '—' }}</span>
        </template>
        <template #cell-role="{ row }">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-slate-50 text-slate-600 border-slate-200">
            {{ roleLabel(row.user?.role?.name) }}
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
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  UsersIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  UserPlusIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const { t } = useI18n()

const roleOptions = computed(() => [
  { value: 'member', label: t('reports.userPage.roleMember') },
  { value: 'librarian', label: t('reports.userPage.roleLibrarian') },
  { value: 'admin', label: t('reports.userPage.roleAdmin') },
])

// row.user.role.name raw values (member/librarian/admin) come from the
// database — map to the same labels used in the role filter above,
// falling back to "Member" when no role is set (matches the previous
// hardcoded default).
const roleLabelMap = computed(() => ({
  member: t('reports.userPage.roleMember'),
  librarian: t('reports.userPage.roleLibrarian'),
  admin: t('reports.userPage.roleAdmin'),
}))
const roleLabel = (role) => roleLabelMap.value[role] || t('reports.userPage.roleMember')

const columns = computed(() => [
  { key: 'id', label: '#' },
  { key: 'name', label: t('reports.columns.name') },
  { key: 'email', label: t('reports.columns.email') },
  { key: 'role', label: t('reports.columns.role') },
  { key: 'total_borrows', label: t('reports.columns.borrows') },
  { key: 'active_borrows', label: t('reports.columns.active') },
  { key: 'total_fines', label: t('reports.columns.fines') },
])

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
<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-600/20">
          <CurrencyDollarIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('reports.revenuePage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('reports.revenuePage.subtitle') }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ t('reports.revenuePage.backToReports') }}</span>
        </RouterLink>

        <ExportReportButton v-if="authStore.role === 'admin'" type="revenue" :filters="filters" />
      </div>
    </div>

    <!-- Revenue is admin-only (see routes/api.php §10 and
         ReportController::authorizeAdmin()). A librarian who reaches
         this page directly by URL — the nav tab is already hidden in
         ReportsNav.vue — sees a clear access-denied message instead of a
         raw 403 from a failed API call. -->
    <div
      v-if="authStore.role !== 'admin'"
      class="bg-white rounded-2xl border-2 border-slate-300 p-10 shadow-lg text-center"
    >
      <div class="w-12 h-12 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-3">
        <LockClosedIcon class="w-6 h-6 text-amber-600" />
      </div>
      <p class="text-sm font-black text-slate-800">{{ t('reports.revenuePage.adminsOnly') }}</p>
      <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        {{ t('reports.revenuePage.adminsOnlyHint') }}
      </p>
    </div>

    <!-- Main Content Container with White Box & Dashed Border -->
    <div v-else class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">

      <!-- Filters Section -->
      <ReportFilter @apply="onApply" :show-search="false" />

      <!-- Solid Colored Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard :label="t('reports.revenuePage.totalRevenue')" :value="summary.total"      format="currency" bg="bg-emerald-600" :badge="t('reports.badge.total')"    :icon="BanknotesIcon" />
        <ReportSummaryCard :label="t('reports.revenuePage.thisMonth')"    :value="summary.this_month" format="currency" bg="bg-blue-600"    :badge="t('reports.badge.month')"    :icon="CalendarIcon" />
        <ReportSummaryCard :label="t('reports.revenuePage.fines')"        :value="summary.fines"      format="currency" bg="bg-orange-500"  :badge="t('reports.badge.fines')"    :icon="CurrencyDollarIcon" />
        <ReportSummaryCard :label="t('reports.revenuePage.services')"     :value="summary.services"   format="currency" bg="bg-slate-700"   :badge="t('reports.badge.services')" :icon="RectangleStackIcon" />
      </div>

      <!-- Data Table -->
      <ReportTable :columns="columns" :rows="rows" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <template #cell-description="{ row }">
          <span class="font-semibold text-slate-700">{{ row.description ?? '—' }}</span>
        </template>
        <template #cell-amount="{ row }">
          <span class="font-bold text-slate-900">{{ formatCurrency(row.amount) }}</span>
        </template>
        <template #cell-created_at="{ row }">
          <span class="text-slate-600">{{ row.created_at }}</span>
        </template>
      </ReportTable>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CurrencyDollarIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  CalendarIcon,
  RectangleStackIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const { t } = useI18n()
const authStore = useAuthStore()

const columns = computed(() => [
  { key: 'id', label: '#' },
  { key: 'description', label: t('reports.columns.description') },
  { key: 'amount', label: t('reports.columns.amount') },
  { key: 'created_at', label: t('reports.columns.date') },
])

const rows = ref([])
const summary = ref(null)
const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '' })

const formatCurrency = (v) => analyticsService.formatCurrency(v)

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.revenue({ ...filters, page })
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

// Only fetch when the viewer is actually allowed to see this data —
// avoids firing a request that's guaranteed to 403 for a librarian.
onMounted(() => {
  if (authStore.role === 'admin') load()
})
</script>
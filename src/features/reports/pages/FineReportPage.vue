<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-600/20">
          <BanknotesIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('reports.finePage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('reports.finePage.subtitle') }}</p>
        </div>
      </div>

      <!-- Action Buttons Group (Back & Export) on the right -->
      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ t('reports.finePage.backToReports') }}</span>
        </RouterLink>

        <ExportReportButton type="fine" :filters="filters" />
      </div>
    </div>

    <!-- Main Content Container with White Box & Dashed Border -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">

      <!-- Filters Section -->
      <ReportFilter
        :status-options="statusOptions"
        :status-label="t('reports.filter.status')"
        :show-search="false"
        @apply="onApply"
      />

      <!-- Solid Colored Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard :label="t('reports.finePage.totalFines')"  :value="summary.count"         bg="bg-slate-700"    :badge="t('reports.badge.total')"  :icon="DocumentTextIcon" />
        <ReportSummaryCard :label="t('reports.finePage.totalAmount')" :value="summary.total_amount"  format="currency" bg="bg-orange-500"  :badge="t('reports.badge.amount')" :icon="BanknotesIcon" />
        <ReportSummaryCard :label="t('reports.finePage.collected')"   :value="summary.paid_amount"   format="currency" bg="bg-emerald-600" :badge="t('reports.badge.paid')"   :icon="CheckCircleIcon" />
        <ReportSummaryCard :label="t('reports.finePage.outstanding')" :value="summary.unpaid_amount" format="currency" bg="bg-rose-600"    :badge="t('reports.badge.unpaid')" :icon="CreditCardIcon" />
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
            <p class="font-bold text-slate-700">{{ row.user?.name ?? t('reports.common.guest') }}</p>
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
            {{ row.status === 'paid' ? t('reports.finePage.statusPaid') : t('reports.finePage.statusUnpaid') }}
          </span>
        </template>
      </ReportTable>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BanknotesIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const { t } = useI18n()

const statusOptions = computed(() => [
  { value: 'unpaid', label: t('reports.finePage.statusUnpaid') },
  { value: 'paid', label: t('reports.finePage.statusPaid') },
])

const columns = computed(() => [
  { key: 'id', label: '#' },
  { key: 'user.name', label: t('reports.columns.member') },
  { key: 'amount', label: t('reports.columns.amount') },
  { key: 'status', label: t('reports.columns.status') },
  { key: 'paid_at', label: t('reports.columns.paidAt') },
])

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
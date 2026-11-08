<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-6 shadow-lg dark:shadow-none flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-600/20">
          <BanknotesIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('reports.finePage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('reports.finePage.subtitle') }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <RouterLink
          to="/reports"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-black tracking-wider uppercase transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>{{ t('reports.finePage.backToReports') }}</span>
        </RouterLink>

        <ExportReportButton type="fine" :filters="filters" />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/15 p-6 md:p-8 shadow-lg dark:shadow-none border-dashed space-y-6">

      <ReportFilter
        :range="range"
        :status-options="statusOptions"
        :status-label="t('reports.filter.status')"
        :show-search="false"
        :initial="{ status: route.query.status || '' }"
        @apply="onApply"
      />

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-if="summary">
        <ReportSummaryCard :label="t('reports.finePage.totalFines')"  :value="summary.count"         bg="bg-slate-700"    :badge="t('reports.badge.total')"  :icon="DocumentTextIcon" />
        <ReportSummaryCard :label="t('reports.finePage.totalAmount')" :value="summary.total_amount"  format="currency" bg="bg-orange-500"  :badge="t('reports.badge.amount')" :icon="BanknotesIcon" />
        <ReportSummaryCard :label="t('reports.finePage.collected')"   :value="summary.paid_amount"   format="currency" bg="bg-emerald-600" :badge="t('reports.badge.paid')"   :icon="CheckCircleIcon" />
        <ReportSummaryCard :label="t('reports.finePage.outstanding')" :value="summary.unpaid_amount" format="currency" bg="bg-rose-600"    :badge="t('reports.badge.unpaid')" :icon="CreditCardIcon" />
      </div>

      <div v-if="summary" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportDonut :title="t('reports.finePage.statusSplit')" :items="statusItems" :height="240" />
        <ReportRankList :title="t('reports.finePage.topDebtors')" :items="debtorItems" variant="avatar" />
      </div>

      <ReportTable :columns="columns" :rows="rows" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <!-- API returns row.borrow.member.user (not row.user) -->
        <template #cell-borrow.member.user.name="{ row }">
          <div>
            <p class="font-bold text-slate-700 dark:text-slate-100">{{ row.borrow?.member?.user?.name ?? t('reports.common.guest') }}</p>
            <p class="text-[11px] text-slate-400 dark:text-slate-500">{{ row.borrow?.member?.user?.email }}</p>
          </div>
        </template>
        <template #cell-amount="{ row }">
          <span class="font-semibold text-slate-700 dark:text-slate-100">{{ formatCurrency(row.amount) }}</span>
        </template>
        <template #cell-created_at="{ row }">{{ analyticsService.formatDate(row.created_at) }}</template>
        <template #cell-paid_at="{ row }">{{ analyticsService.formatDate(row.paid_at) }}</template>
        <template #cell-status="{ row }">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border" :class="statusStyles[row.status] ?? statusStyles.unpaid">
            {{ statusLabelMap[row.status] ?? row.status }}
          </span>
        </template>
      </ReportTable>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  BanknotesIcon, ArrowLeftIcon, DocumentTextIcon, CheckCircleIcon, CreditCardIcon,
} from '@heroicons/vue/24/outline'
import { reportService } from '../services/reportService'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportTable from '../components/ReportTable.vue'
import ReportDonut from '../components/ReportDonut.vue'
import ReportRankList from '../components/ReportRankList.vue'
import ExportReportButton from '../components/ExportReportButton.vue'

const { t } = useI18n()
const route = useRoute()

const statusLabelMap = computed(() => ({
  unpaid: t('reports.finePage.statusUnpaid'),
  paid: t('reports.finePage.statusPaid'),
  waived: t('reports.finePage.statusWaived'),
}))
const statusOptions = computed(() => Object.entries(statusLabelMap.value).map(([value, label]) => ({ value, label })))

const statusStyles = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30',
  unpaid: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30',
  waived: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/20',
}

const columns = computed(() => [
  { key: 'id', label: '#' },
  { key: 'borrow.member.user.name', label: t('reports.columns.member') },
  { key: 'amount', label: t('reports.columns.amount') },
  { key: 'status', label: t('reports.columns.status') },
  { key: 'created_at', label: t('reports.columns.date') },
  { key: 'paid_at', label: t('reports.columns.paidAt') },
])

const rows = ref([])
const summary = ref(null)
const debtors = ref([])
const loading = ref(false)
const range = ref(null)
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ date_from: '', date_to: '', status: '', all_time: false })

const formatCurrency = (v) => analyticsService.formatCurrency(v)

const statusItems = computed(() => !summary.value ? [] : [
  { name: t('reports.finePage.statusPaid'), value: summary.value.paid_amount, color: '#10b981' },
  { name: t('reports.finePage.statusUnpaid'), value: summary.value.unpaid_amount, color: '#ef4444' },
  { name: t('reports.finePage.statusWaived'), value: summary.value.waived_amount, color: '#94a3b8' },
])
const debtorItems = computed(() => debtors.value.map((d) => ({
  key: d.id, name: d.name, sub: d.email, value: d.amount, label: formatCurrency(d.amount),
})))

const load = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await reportService.fine({ ...filters, page })
    rows.value = data.data.data
    summary.value = data.summary
    debtors.value = data.top_debtors ?? []
    range.value = data.range ?? null
    pagination.current_page = data.data.current_page
    pagination.last_page = data.data.last_page
  } finally {
    loading.value = false
  }
}

const onApply = (f) => { Object.assign(filters, f); load(1) }
const onPageChange = (page) => load(page)
</script>
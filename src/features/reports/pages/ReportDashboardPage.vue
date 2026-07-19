<template>
  <div class="p-6 space-y-6">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <ChartBarIcon class="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Reports</h1>
          <p class="text-sm text-gray-400 mt-0.5">Circulation, revenue, and stock insights at a glance</p>
        </div>
      </div>
      <ReportFilter :show-search="false" @apply="onFilterApply" />
    </div>

    <ReportsNav />

    <div v-if="loading" class="p-16 text-center text-gray-400 font-bold text-sm uppercase tracking-widest animate-pulse">
      Loading dashboard…
    </div>

    <template v-else-if="dashboard">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportSummaryCard label="Total Borrows"    :value="dashboard.kpis.total_borrows"    color="text-gray-800"   bg="bg-gray-50" />
        <ReportSummaryCard label="Active Borrows"   :value="dashboard.kpis.active_borrows"   color="text-blue-600"   bg="bg-blue-50" />
        <ReportSummaryCard label="Overdue"          :value="dashboard.kpis.overdue_borrows"  color="text-red-500"    bg="bg-red-50" />
        <ReportSummaryCard label="New Members"      :value="dashboard.kpis.new_members"      color="text-emerald-600" bg="bg-emerald-50" />
        <ReportSummaryCard label="Fines (period)"   :value="dashboard.kpis.total_fines"   format="currency" color="text-orange-600" bg="bg-orange-50" />
        <ReportSummaryCard label="Outstanding Fines" :value="dashboard.kpis.unpaid_fines" format="currency" color="text-red-600" bg="bg-red-50" />
        <ReportSummaryCard label="Total Books"      :value="dashboard.kpis.total_books"      color="text-gray-800"   bg="bg-gray-50" />
        <ReportSummaryCard label="Available Copies" :value="dashboard.kpis.available_copies" color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart title="Borrows Over Time" :labels="borrowSeries.labels" :values="borrowSeries.values" type="line" color="#10b981" />
        <ReportChart title="Revenue Over Time" :labels="revenueSeries.labels" :values="revenueSeries.values" type="bar" color="#f97316" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 class="text-sm font-black text-gray-700 uppercase tracking-wide mb-4">Most Borrowed Books</h3>
          <ul class="divide-y divide-gray-50">
            <li v-for="book in dashboard.top_books" :key="book.id" class="py-3 flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-700">{{ book.title }}</span>
              <span class="text-xs font-black text-emerald-600">{{ book.borrow_count }} borrows</span>
            </li>
            <li v-if="!dashboard.top_books.length" class="py-6 text-center text-sm text-gray-300 font-bold">No data yet</li>
          </ul>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
          <h3 class="text-sm font-black text-gray-700 uppercase tracking-wide mb-2">Detailed Reports</h3>
          <RouterLink
            v-for="link in quickLinks" :key="link.to" :to="link.to"
            class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-sm font-bold text-gray-600 hover:text-emerald-700 transition-colors"
          >
            <component :is="link.icon" class="w-4 h-4 flex-shrink-0" />
            <span class="flex-1">{{ link.label }}</span>
            <ChevronRightIcon class="w-4 h-4" />
          </RouterLink>
        </div>
      </div>
    </template>

    <div v-else class="p-16 text-center text-gray-400 text-sm font-bold">
      No dashboard data available yet.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ChartBarIcon, ArrowsRightLeftIcon, BanknotesIcon, UsersIcon, ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useReportStore } from '../store'
import { analyticsService } from '../services/analyticsService'
import ReportFilter from '../components/ReportFilter.vue'
import ReportSummaryCard from '../components/ReportSummaryCard.vue'
import ReportChart from '../components/ReportChart.vue'
import ReportsNav from '../components/ReportsNav.vue'

const store = useReportStore()
const loading = ref(true)

const dashboard = computed(() => store.dashboard)
const borrowSeries = computed(() => analyticsService.toChartSeries(dashboard.value?.borrow_trend ?? []))
const revenueSeries = computed(() => analyticsService.toChartSeries(dashboard.value?.revenue_trend ?? []))

const quickLinks = [
  { to: '/reports/borrow', label: 'Borrow Report', icon: ArrowsRightLeftIcon },
  { to: '/reports/fine',   label: 'Fine Report', icon: BanknotesIcon },
  { to: '/reports/user',   label: 'User Report', icon: UsersIcon },
]

const load = async (filters = {}) => {
  loading.value = true
  await store.loadDashboard(filters)
  loading.value = false
}

const onFilterApply = (filters) => load(filters)

onMounted(() => load())
</script>
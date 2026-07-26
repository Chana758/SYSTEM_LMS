<template>
  <div class="p-6 space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center flex-shrink-0 text-xl shadow-2xs">
          <ChartBarIcon class="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Reports</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Circulation, revenue, and stock insights at a glance</p>
        </div>
      </div>
      <ReportFilter :show-search="false" @apply="onFilterApply" />
    </div>

    <!-- Reports Navigation -->
    <ReportsNav />

    <!-- Main Content Container with White Box & Dashed Border -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed space-y-6">
      
      <div v-if="loading" class="p-16 text-center text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">
        Loading dashboard…
      </div>

      <template v-else-if="dashboard">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportSummaryCard label="Total Borrows"    :value="dashboard.kpis.total_borrows"    color="text-slate-900"   bg="bg-slate-50" />
          <ReportSummaryCard label="Active Borrows"   :value="dashboard.kpis.active_borrows"   color="text-blue-600"   bg="bg-blue-50" />
          <ReportSummaryCard label="Overdue"          :value="dashboard.kpis.overdue_borrows"  color="text-red-500"    bg="bg-red-50" />
          <ReportSummaryCard label="New Members"      :value="dashboard.kpis.new_members"      color="text-emerald-600" bg="bg-emerald-50" />
          <ReportSummaryCard label="Fines (period)"   :value="dashboard.kpis.total_fines"   format="currency" color="text-orange-600" bg="bg-orange-50" />
          <ReportSummaryCard label="Outstanding Fines" :value="dashboard.kpis.unpaid_fines" format="currency" color="text-red-600" bg="bg-red-50" />
          <ReportSummaryCard label="Total Books"      :value="dashboard.kpis.total_books"      color="text-slate-900"   bg="bg-slate-50" />
          <ReportSummaryCard label="Available Copies" :value="dashboard.kpis.available_copies" color="text-emerald-600" bg="bg-emerald-50" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportChart title="Borrows Over Time" :labels="borrowSeries.labels" :values="borrowSeries.values" type="line" color="#10b981" />
          <ReportChart title="Revenue Over Time" :labels="revenueSeries.labels" :values="revenueSeries.values" type="bar" color="#f97316" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-slate-50/50 rounded-2xl border-2 border-slate-200 p-5">
            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Most Borrowed Books</h3>
            <ul class="divide-y divide-slate-200">
              <li v-for="book in dashboard.top_books" :key="book.id" class="py-3 flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-700">{{ book.title }}</span>
                <span class="text-xs font-black text-emerald-600">{{ book.borrow_count }} borrows</span>
              </li>
              <li v-if="!dashboard.top_books.length" class="py-6 text-center text-sm text-slate-400 font-bold">No data yet</li>
            </ul>
          </div>

          <div class="bg-slate-50/50 rounded-2xl border-2 border-slate-200 p-5 space-y-2">
            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Detailed Reports</h3>
            <RouterLink
              v-for="link in quickLinks" :key="link.to" :to="link.to"
              class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors shadow-2xs"
            >
              <component :is="link.icon" class="w-4 h-4 flex-shrink-0" />
              <span class="flex-1">{{ link.label }}</span>
              <ChevronRightIcon class="w-4 h-4" />
            </RouterLink>
          </div>
        </div>
      </template>

      <div v-else class="p-16 text-center text-slate-400 text-sm font-bold">
        No dashboard data available yet.
      </div>

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
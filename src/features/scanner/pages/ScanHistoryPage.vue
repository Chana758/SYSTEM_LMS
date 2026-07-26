<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION WITH 4 STAT CARDS ============ -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm space-y-6">
      
      <!-- Top Title & Action Buttons -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">Scan History</h1>
          <p class="text-xs font-medium text-slate-500 mt-1">Audit log of every barcode scan across the system.</p>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink
            to="/scanner"
            class="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
          >
            <span>← Back to Scanner</span>
          </RouterLink>
        </div>
      </div>

      <!-- 4 Stat Cards with Consistent Color Theming -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        
        <!-- Card 1: Total Scans (Blue) -->
        <div class="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <QrCodeIcon class="w-5 h-5"/>
            </div>
            <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-100 px-2.5 py-1 rounded-full">Total</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ summary.total_scans ?? '—' }}</p>
            <p class="text-[11px] font-bold text-blue-700 tracking-wide">Total Scans</p>
          </div>
        </div>

        <!-- Card 2: Success (Emerald) -->
        <div class="bg-gradient-to-br from-emerald-50/70 via-white to-white rounded-2xl border border-emerald-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircleIcon class="w-5 h-5"/>
            </div>
            <span class="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-full">Success</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ summary.success_count ?? '—' }}</p>
            <p class="text-[11px] font-bold text-emerald-700 tracking-wide">Successful matches</p>
          </div>
        </div>

        <!-- Card 3: Not Found (Amber / Warning) -->
        <div class="bg-gradient-to-br from-amber-50/70 via-white to-white rounded-2xl border border-amber-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-amber-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <ExclamationTriangleIcon class="w-5 h-5"/>
            </div>
            <span class="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest bg-amber-100 px-2.5 py-1 rounded-full">Alert</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ summary.not_found_count ?? '—' }}</p>
            <p class="text-[11px] font-bold text-amber-700 tracking-wide">Unmatched barcodes</p>
          </div>
        </div>

        <!-- Card 4: Today (Purple) -->
        <div class="bg-gradient-to-br from-purple-50/70 via-white to-white rounded-2xl border border-purple-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-purple-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <CalendarDaysIcon class="w-5 h-5"/>
            </div>
            <span class="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest bg-purple-100 px-2.5 py-1 rounded-full">Today</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ summary.today_count ?? '—' }}</p>
            <p class="text-[11px] font-bold text-purple-700 tracking-wide">Scans today</p>
          </div>
        </div>

      </div>

    </div>

    <!-- ============ TOOLBAR ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
          <input
            v-model="filters.search"
            @input="debouncedLoad"
            type="text"
            placeholder="Search barcode or staff name..."
            class="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:outline-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <select
          v-model="filters.scan_type"
          @change="loadHistory(1)"
          class="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:outline-emerald-600 transition-all shadow-2xs cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="borrow">Borrow</option>
          <option value="return">Return</option>
          <option value="lookup">Lookup</option>
        </select>

        <select
          v-model="filters.scan_result"
          @change="loadHistory(1)"
          class="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:outline-emerald-600 transition-all shadow-2xs cursor-pointer"
        >
          <option value="">All Results</option>
          <option value="success">Success</option>
          <option value="not_found">Not Found</option>
          <option value="error">Error</option>
        </select>

        <!-- 🆕 Export CSV button -->
        <button
          @click="exportCsv"
          :disabled="exporting"
          class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          {{ exporting ? 'Exporting…' : 'Export CSV' }}
        </button>
      </div>
    </div>

    <!-- ============ TABLE CONTAINER ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
      <ScanHistoryList :items="history" />

      <!-- ============ PAGINATION ============ -->
      <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
        <button
          v-for="page in pagination.last_page" :key="page"
          @click="goToPage(page)"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          :class="page === pagination.current_page ? 'bg-emerald-700 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  ArrowLeftIcon, QrCodeIcon, CheckCircleIcon,
  ExclamationTriangleIcon, CalendarDaysIcon, MagnifyingGlassIcon,
  ClipboardDocumentListIcon, ArrowDownTrayIcon, // 🆕
} from '@heroicons/vue/24/outline'
import ScanHistoryList from '../components/ScanHistoryList.vue'
import { scannerService } from '../services'

const history = ref([])
const summary = ref({})
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ search: '', scan_type: '', scan_result: '' })
const exporting = ref(false) // 🆕

const loadHistory = async (page = 1) => {
  try {
    const { data } = await scannerService.getHistory({ ...filters, page })
    history.value = data.data
    pagination.current_page = data.current_page
    pagination.last_page = data.last_page
  } catch (e) {
    history.value = []
  }
}

const loadSummary = async () => {
  try {
    const { data } = await scannerService.getSummary()
    summary.value = data
  } catch (e) {
    summary.value = {}
  }
}

const goToPage = (page) => loadHistory(page)

let debounceTimeout = null
const debouncedLoad = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => loadHistory(1), 400)
}

// 🆕 FIX: exports ALL rows matching current filters (not just the
// current page) by requesting a large per_page in one extra call,
// then builds a CSV client-side. No new backend endpoint required.
const exportCsv = async () => {
  exporting.value = true
  try {
    const { data } = await scannerService.getHistory({ ...filters, per_page: 1000, page: 1 })
    const rows = data.data || []

    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['Barcode', 'Book', 'Scanned By', 'Type', 'Result', 'Device', 'Date']
    const lines = [header.map(escape).join(',')]

    rows.forEach((item) => {
      lines.push([
        item.barcode_scanned,
        item.book_copy?.book?.title || '',
        item.user?.name || '',
        item.scan_type,
        item.scan_result,
        item.device || '',
        new Date(item.created_at).toLocaleString(),
      ].map(escape).join(','))
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scan-history-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadHistory()
  loadSummary()
})
</script>
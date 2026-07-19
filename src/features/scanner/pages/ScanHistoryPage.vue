<template>
  <div class="p-6">
    <!-- Header card -->
    <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <ClipboardDocumentListIcon class="w-6 h-6 text-green-700" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Scan History</h1>
          <p class="text-sm text-gray-400 mt-0.5">Audit log of every barcode scan across the system.</p>
        </div>
      </div>

      <RouterLink
        to="/scanner"
        class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex-shrink-0"
      >
        <ArrowLeftIcon class="w-4 h-4" />
        Back to Scanner
      </RouterLink>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-400 font-medium">Total Scans</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ summary.total_scans ?? '—' }}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">
          <QrCodeIcon class="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-400 font-medium">Success</p>
          <p class="text-2xl font-bold text-green-600 mt-1">{{ summary.success_count ?? '—' }}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
          <CheckCircleIcon class="w-5 h-5 text-green-600" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-400 font-medium">Not Found</p>
          <p class="text-2xl font-bold text-gray-500 mt-1">{{ summary.not_found_count ?? '—' }}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">
          <ExclamationTriangleIcon class="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-400 font-medium">Today</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ summary.today_count ?? '—' }}</p>
        </div>
        <div class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
          <CalendarDaysIcon class="w-5 h-5 text-amber-500" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <div class="relative flex-1 min-w-[200px]">
        <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="filters.search"
          @input="debouncedLoad"
          type="text"
          placeholder="Search barcode or staff name..."
          class="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
        />
      </div>
      <select v-model="filters.scan_type" @change="loadHistory" class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30">
        <option value="">All Types</option>
        <option value="borrow">Borrow</option>
        <option value="return">Return</option>
        <option value="lookup">Lookup</option>
      </select>
      <select v-model="filters.scan_result" @change="loadHistory" class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30">
        <option value="">All Results</option>
        <option value="success">Success</option>
        <option value="not_found">Not Found</option>
        <option value="error">Error</option>
      </select>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <ScanHistoryList :items="history" />

      <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-4">
        <button
          v-for="page in pagination.last_page" :key="page"
          @click="goToPage(page)"
          class="w-8 h-8 rounded-lg text-sm font-medium transition"
          :class="page === pagination.current_page ? 'bg-green-700 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
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
  ClipboardDocumentListIcon,
} from '@heroicons/vue/24/outline'
import ScanHistoryList from '../components/ScanHistoryList.vue'
import { scannerService } from '../services'

const history = ref([])
const summary = ref({})
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ search: '', scan_type: '', scan_result: '' })

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

onMounted(() => {
  loadHistory()
  loadSummary()
})
</script>
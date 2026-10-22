<template>
  <div class="space-y-6 pb-12">
    <!--  HEADER + STATS  -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-black/30 space-y-6 transition-colors">

      <div class="flex items-start md:items-center justify-between gap-3 md:gap-4">
        <div class="min-w-0 flex-1">
          <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('scanner.historyPage.title') }}</h1>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ t('scanner.historyPage.subtitle') }}</p>
        </div>
        <!-- Phones: round icon-only back button on the right. md and up: the original pill with text. -->
        <RouterLink
          to="/scanner"
          :title="t('scanner.historyPage.backToScanner')"
          :aria-label="t('scanner.historyPage.backToScanner')"
          class="shrink-0 inline-flex items-center justify-center gap-2 w-10 h-10 md:w-auto md:h-auto md:pl-3 md:pr-4 md:py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs active:scale-95"
        >
          <ArrowLeftIcon class="w-5 h-5 md:w-4 md:h-4 text-slate-500 dark:text-slate-400" />
          <span class="hidden md:inline">{{ t('scanner.historyPage.backToScanner') }}</span>
        </RouterLink>
      </div>

      <!-- 2 columns on phones, 4 on desktop -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
        <div
          v-for="card in statCards" :key="card.key"
          class="rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-md"
          :class="card.box"
        >
          <div class="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white flex items-center justify-center shadow-sm dark:bg-white/25 dark:ring-1 dark:ring-white/30"
              :class="card.icon"
            >
              <component :is="card.iconComp" class="w-5 h-5" />
            </div>
            <span
              class="hidden sm:inline-flex text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full dark:text-white dark:bg-white/15 dark:border dark:border-white/30"
              :class="card.badge"
            >
              {{ t(card.badgeKey) }}
            </span>
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">{{ summary[card.field] ?? '—' }}</p>
            <p class="text-[11px] font-bold tracking-wide leading-snug" :class="card.label">{{ t(card.labelKey) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-white/10 p-4 shadow-sm dark:shadow-black/30 transition-colors">
      <div class="grid grid-cols-2 md:flex md:flex-wrap md:items-center gap-3">
        <div class="relative col-span-2 md:flex-1 md:min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="filters.search"
            @input="debouncedLoad"
            type="text"
            :placeholder="t('scanner.historyPage.searchPlaceholder')"
            class="w-full min-w-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:outline-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <select
          v-model="filters.scan_type"
          @change="loadHistory(1)"
          class="w-full min-w-0 md:w-auto bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-100 outline-none focus:outline-emerald-600 transition-all shadow-2xs cursor-pointer dark:[color-scheme:dark]"
        >
          <option value="">{{ t('scanner.historyPage.allTypes') }}</option>
          <option value="borrow">{{ t('scanner.typeBorrow') }}</option>
          <option value="return">{{ t('scanner.typeReturn') }}</option>
          <option value="lookup">{{ t('scanner.typeLookup') }}</option>
        </select>

        <select
          v-model="filters.scan_result"
          @change="loadHistory(1)"
          class="w-full min-w-0 md:w-auto bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-100 outline-none focus:outline-emerald-600 transition-all shadow-2xs cursor-pointer dark:[color-scheme:dark]"
        >
          <option value="">{{ t('scanner.historyPage.allResults') }}</option>
          <option value="success">{{ t('scanner.historyPage.resultSuccess') }}</option>
          <option value="not_found">{{ t('scanner.historyPage.resultNotFound') }}</option>
          <option value="error">{{ t('scanner.historyPage.resultError') }}</option>
        </select>

        <button
          @click="exportCsv"
          :disabled="exporting"
          class="col-span-2 md:col-span-1 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          {{ exporting ? t('scanner.historyPage.exporting') : t('scanner.historyPage.exportCsv') }}
        </button>
      </div>
    </div>

    <!-- LIST -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm dark:shadow-black/30 transition-colors">
      <ScanHistoryList :items="history" />

      <!-- Pagination: windowed so it never overflows with many pages -->
      <div v-if="pagination.last_page > 1" class="flex flex-wrap justify-center items-center gap-2 mt-6">
        <button
          @click="goToPage(pagination.current_page - 1)"
          :disabled="pagination.current_page <= 1"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>

        <template v-for="(p, i) in visiblePages" :key="`${p}-${i}`">
          <span v-if="p === '...'" class="w-6 text-center text-xs font-bold text-slate-400 dark:text-slate-500">…</span>
          <button
            v-else
            @click="goToPage(p)"
            class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            :class="p === pagination.current_page
              ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'"
          >
            {{ p }}
          </button>
        </template>

        <button
          @click="goToPage(pagination.current_page + 1)"
          :disabled="pagination.current_page >= pagination.last_page"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeftIcon, QrCodeIcon, CheckCircleIcon,
  ExclamationTriangleIcon, CalendarDaysIcon, MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline'
import ScanHistoryList from '../components/ScanHistoryList.vue'
import { scannerService } from '../services'

const { t } = useI18n()

const history = ref([])
const summary = ref({})
const pagination = reactive({ current_page: 1, last_page: 1 })
const filters = reactive({ search: '', scan_type: '', scan_result: '' })
const exporting = ref(false)

// Full class names so Tailwind can generate them.
const statCards = [
  {
    key: 'total', field: 'total_scans', iconComp: QrCodeIcon,
    badgeKey: 'scanner.historyPage.total', labelKey: 'scanner.historyPage.totalScans',
    box: 'bg-gradient-to-br from-blue-50/70 via-white to-white border-blue-200 hover:border-blue-300 dark:from-blue-500 dark:via-blue-600 dark:to-blue-800 dark:border-blue-300/30',
    icon: 'bg-blue-600',
    badge: 'text-blue-600 bg-blue-100',
    label: 'text-blue-700 dark:text-blue-100',
  },
  {
    key: 'success', field: 'success_count', iconComp: CheckCircleIcon,
    badgeKey: 'scanner.historyPage.success', labelKey: 'scanner.historyPage.successfulMatches',
    box: 'bg-gradient-to-br from-emerald-50/70 via-white to-white border-emerald-200 hover:border-emerald-300 dark:from-emerald-500 dark:via-emerald-600 dark:to-emerald-800 dark:border-emerald-300/30',
    icon: 'bg-emerald-600',
    badge: 'text-emerald-600 bg-emerald-100',
    label: 'text-emerald-700 dark:text-emerald-100',
  },
  {
    key: 'alert', field: 'not_found_count', iconComp: ExclamationTriangleIcon,
    badgeKey: 'scanner.historyPage.alert', labelKey: 'scanner.historyPage.unmatchedBarcodes',
    box: 'bg-gradient-to-br from-amber-50/70 via-white to-white border-amber-200 hover:border-amber-300 dark:from-amber-500 dark:via-amber-600 dark:to-amber-800 dark:border-amber-300/30',
    icon: 'bg-amber-600',
    badge: 'text-amber-600 bg-amber-100',
    label: 'text-amber-700 dark:text-amber-100',
  },
  {
    key: 'today', field: 'today_count', iconComp: CalendarDaysIcon,
    badgeKey: 'scanner.historyPage.today', labelKey: 'scanner.historyPage.scansToday',
    box: 'bg-gradient-to-br from-purple-50/70 via-white to-white border-purple-200 hover:border-purple-300 dark:from-violet-500 dark:via-violet-600 dark:to-violet-800 dark:border-violet-300/30',
    icon: 'bg-purple-600',
    badge: 'text-purple-600 bg-purple-100',
    label: 'text-purple-700 dark:text-violet-100',
  },
]

// Shows e.g. 1 … 4 5 [6] 7 8 … 20
const visiblePages = computed(() => {
  const total = pagination.last_page
  const current = pagination.current_page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) pages.push('...')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push('...')
  pages.push(total)
  return pages
})

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

const goToPage = (page) => {
  if (page < 1 || page > pagination.last_page || page === pagination.current_page) return
  loadHistory(page)
}

let debounceTimeout = null
const debouncedLoad = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => loadHistory(1), 400)
}
onBeforeUnmount(() => clearTimeout(debounceTimeout))

// Exports ALL rows matching current filters (not just the current page)
// by requesting a large per_page in one extra call, then builds a CSV
// client-side. No new backend endpoint required.
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

    // BOM so Excel shows Khmer text correctly.
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
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
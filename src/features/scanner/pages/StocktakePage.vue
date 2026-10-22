<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER + STATS ============ -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-black/30 space-y-6 transition-colors">

      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
          <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-400/25 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ClipboardDocumentCheckIcon class="w-6 h-6 text-indigo-700 dark:text-indigo-300" />
          </div>
          <div class="min-w-0">
            <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('scanner.stocktakePage.title') }}</h1>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('scanner.stocktakePage.subtitle') }}</p>
          </div>
        </div>

        <!-- Always on the right: icon-only circle on phones, icon + text from sm up -->
        <RouterLink
          to="/scanner"
          :title="t('scanner.stocktakePage.backToScanner')"
          :aria-label="t('scanner.stocktakePage.backToScanner')"
          class="shrink-0 inline-flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-200 rounded-full text-xs font-bold transition-all shadow-2xs"
        >
          <ArrowLeftIcon class="w-5 h-5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
          <span class="hidden sm:inline">{{ t('scanner.stocktakePage.backToScanner') }}</span>
        </RouterLink>
      </div>

      <!-- 2 columns on phones, 4 on desktop -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
        <div
          v-for="card in statCards" :key="card.key"
          class="rounded-2xl border shadow-md p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-md"
          :class="card.box"
        >
          <div class="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-white flex items-center justify-center shadow-sm dark:bg-white/25 dark:ring-1 dark:ring-white/30"
              :class="card.icon"
            >
              <component :is="card.iconComp" class="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span
              class="hidden sm:inline-flex text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full dark:text-white dark:bg-white/15 dark:border dark:border-white/30"
              :class="card.badge"
            >
              {{ t(card.badgeKey) }}
            </span>
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">{{ card.value }}</p>
            <p class="text-[11px] font-bold tracking-wide leading-snug" :class="card.label">{{ t(card.labelKey) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ SCAN INPUT ============ -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm dark:shadow-black/30 space-y-4 transition-colors">
      <div class="flex w-full sm:inline-flex sm:w-auto gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-inner">
        <button
          v-for="m in inputModes" :key="m.value"
          @click="setMode(m.value)"
          class="flex-1 sm:flex-none px-2 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          :class="mode === m.value ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          {{ t(m.labelKey) }}
        </button>
      </div>

      <BarcodeScanner v-if="mode === 'manual'" :is-loading="isScanning" accent="purple" @scan="handleScan" />
      <!-- Continuous: stocktake scans many books in a row -->
      <CameraScanner v-else-if="mode === 'camera'" continuous @detected="handleScan" />
      <!-- Mounted on first open, then kept alive with v-show so the QR session isn't recreated -->
      <RemoteScanPanel v-if="remoteOpened" v-show="mode === 'remote'" @scan="handleScan" />

      <transition name="fade">
        <p v-if="notice.text" :class="noticeClass" class="text-xs font-bold rounded-xl px-4 py-3 border">{{ notice.text }}</p>
      </transition>
    </div>

    <!-- ============ SESSION LOG ============ -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm dark:shadow-black/30 space-y-4 transition-colors">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{{ t('scanner.stocktakePage.sessionLog') }}</h2>

        <!-- Icon-only on phones, icon + text from sm up -->
        <div class="flex items-center gap-2">
          <button
            @click="clearSession"
            :disabled="!sessionItems.length"
            :title="t('scanner.stocktakePage.clearSession')"
            :aria-label="t('scanner.stocktakePage.clearSession')"
            class="inline-flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-400/25 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <TrashIcon class="w-5 h-5 sm:w-4 sm:h-4" />
            <span class="hidden sm:inline">{{ t('scanner.stocktakePage.clearSession') }}</span>
          </button>

          <button
            @click="exportCsv"
            :disabled="!sessionItems.length"
            :title="t('scanner.stocktakePage.exportSession')"
            :aria-label="t('scanner.stocktakePage.exportSession')"
            class="inline-flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-4 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowDownTrayIcon class="w-5 h-5 sm:w-4 sm:h-4" />
            <span class="hidden sm:inline">{{ t('scanner.stocktakePage.exportSession') }}</span>
          </button>
        </div>
      </div>

      <!-- overflow-x-auto so the table scrolls sideways on phones instead of being clipped -->
      <div class="rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto bg-white dark:bg-slate-800/50">
        <table class="w-full min-w-[560px] text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
            <tr>
              <th class="text-left px-5 py-3.5">{{ t('scanner.stocktakePage.colBarcode') }}</th>
              <th class="text-left px-5 py-3.5">{{ t('scanner.stocktakePage.colBook') }}</th>
              <th class="text-left px-5 py-3.5">{{ t('scanner.stocktakePage.colStatus') }}</th>
              <th class="text-left px-5 py-3.5">{{ t('scanner.stocktakePage.colScannedAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/10">
            <tr v-if="!sessionItems.length">
              <td colspan="4" class="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-medium">{{ t('scanner.stocktakePage.noScansYet') }}</td>
            </tr>
            <tr v-for="item in sessionItems" :key="item.barcode" class="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
              <td class="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{{ item.barcode }}</td>
              <td class="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-100">{{ item.title || '—' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-xs font-medium text-slate-400 dark:text-slate-400 whitespace-nowrap">{{ item.scannedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeftIcon, ClipboardDocumentCheckIcon, ArrowDownTrayIcon, TrashIcon,
  QrCodeIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon,
} from '@heroicons/vue/24/outline'
import BarcodeScanner from '../components/BarcodeScanner.vue'
import CameraScanner from '../components/CameraScanner.vue'
import RemoteScanPanel from '../components/RemoteScanQr.vue'
import { scannerService } from '../services'
import { soundService } from '../services/soundService'

const { t } = useI18n()

const STORAGE_KEY = 'stocktake_session_items'

const loadSavedSession = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (e) {
    console.error('Failed to parse stocktake session from localStorage', e)
    return []
  }
}

const sessionItems = ref(loadSavedSession())
const isScanning = ref(false)

// ---- input mode (manual / camera / remote phone) ----
const inputModes = [
  { value: 'manual', labelKey: 'scanner.modeManualShort' },
  { value: 'camera', labelKey: 'scanner.modeCamera' },
  { value: 'remote', labelKey: 'scanner.modeRemote' },
]
const mode = ref('manual')
const remoteOpened = ref(false)
const setMode = (value) => {
  mode.value = value
  if (value === 'remote') remoteOpened.value = true
}

// ---- notice banner (duplicates / network errors) ----
const notice = ref({ text: '', type: 'warn' })
let noticeTimer = null
const showNotice = (text, type = 'warn') => {
  notice.value = { text, type }
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => (notice.value = { text: '', type: 'warn' }), 2500)
}
const noticeClass = computed(() =>
  notice.value.type === 'error'
    ? 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-400/25'
    : 'text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-400/25'
)
onBeforeUnmount(() => clearTimeout(noticeTimer))

watch(
  sessionItems,
  (newItems) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
    } catch (e) {
      console.error('Failed to save stocktake session', e)
    }
  },
  { deep: true }
)

const counts = computed(() => ({
  available: sessionItems.value.filter((i) => i.status === 'available').length,
  borrowed: sessionItems.value.filter((i) => i.status === 'borrowed').length,
  not_found: sessionItems.value.filter((i) => i.status === 'not_found').length,
}))

// Full class names so Tailwind can generate them.
const statCards = computed(() => [
  {
    key: 'scanned', value: sessionItems.value.length, iconComp: QrCodeIcon,
    badgeKey: 'scanner.stocktakePage.scanned', labelKey: 'scanner.stocktakePage.totalScanned',
    box: 'bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-blue-500 dark:via-blue-600 dark:to-blue-800 border-slate-400 dark:border-blue-300/30 hover:border-slate-500',
    icon: 'bg-blue-600',
    badge: 'text-blue-700 bg-blue-50',
    label: 'text-blue-700 dark:text-blue-100',
  },
  {
    key: 'available', value: counts.value.available, iconComp: CheckCircleIcon,
    badgeKey: 'scanner.stocktakePage.onShelf', labelKey: 'scanner.stocktakePage.availableCopies',
    box: 'bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-emerald-500 dark:via-emerald-600 dark:to-emerald-800 border-slate-400 dark:border-emerald-300/30 hover:border-slate-500',
    icon: 'bg-emerald-600',
    badge: 'text-emerald-700 bg-emerald-50',
    label: 'text-emerald-700 dark:text-emerald-100',
  },
  {
    key: 'borrowed', value: counts.value.borrowed, iconComp: ExclamationTriangleIcon,
    badgeKey: 'scanner.stocktakePage.checkedOut', labelKey: 'scanner.stocktakePage.activeLoans',
    box: 'bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-amber-500 dark:via-amber-600 dark:to-amber-800 border-slate-400 dark:border-amber-300/30 hover:border-slate-500',
    icon: 'bg-amber-600',
    badge: 'text-amber-700 bg-amber-50',
    label: 'text-amber-700 dark:text-amber-100',
  },
  {
    key: 'not_found', value: counts.value.not_found, iconComp: XCircleIcon,
    badgeKey: 'scanner.stocktakePage.unrecognized', labelKey: 'scanner.stocktakePage.unknownBarcodes',
    box: 'bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-rose-500 dark:via-rose-600 dark:to-rose-800 border-slate-400 dark:border-rose-300/30 hover:border-slate-500',
    icon: 'bg-rose-600',
    badge: 'text-rose-700 bg-rose-50',
    label: 'text-rose-700 dark:text-rose-100',
  },
])

const statusClass = (status) => ({
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  borrowed: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  damaged: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  lost: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  not_found: 'bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
}[status] || 'bg-slate-100 text-slate-500 dark:bg-slate-500/15 dark:text-slate-300')

const statusLabelMap = computed(() => ({
  available: t('scanner.stocktakePage.statusOnShelf'),
  borrowed: t('scanner.stocktakePage.statusCheckedOut'),
  damaged: t('scanner.stocktakePage.statusDamaged'),
  lost: t('scanner.stocktakePage.statusLost'),
  not_found: t('scanner.stocktakePage.statusNotRecognized'),
}))
const statusLabel = (status) => statusLabelMap.value[status] || status

const addItem = (item) => {
  sessionItems.value.unshift({ ...item, scannedAt: new Date().toLocaleTimeString() })
}

const handleScan = async (rawBarcode) => {
  const barcode = String(rawBarcode ?? '').trim()
  if (!barcode) return

  // A book is counted once per stocktake session.
  if (sessionItems.value.some((i) => i.barcode === barcode)) {
    soundService.notFound()
    soundService.vibrate([30, 40, 30])
    showNotice(t('scanner.stocktakePage.duplicate', { barcode }))
    return
  }

  isScanning.value = true
  try {
    const { data } = await scannerService.scan({
      barcode,
      scan_type: 'lookup',
      device: navigator.userAgent,
    })
    const status = data.book_copy?.status ?? (data.result === 'not_found' ? 'not_found' : 'available')
    addItem({ barcode, title: data.book_copy?.book?.title, status })
    status === 'not_found' ? soundService.notFound() : soundService.success()
    soundService.vibrate([30])
  } catch (e) {
    const payload = e.response?.data

    if (payload?.result === 'not_found') {
      // API answered "not found" using an HTTP error status.
      addItem({ barcode, title: null, status: 'not_found' })
      soundService.notFound()
      soundService.vibrate([30])
    } else {
      // Network/server problem: do NOT record the book as "not recognized".
      // Nothing is saved, so the user can simply scan it again.
      soundService.error()
      soundService.vibrate([60, 40, 60])
      showNotice(payload?.message || t('scanner.stocktakePage.networkError'), 'error')
    }
  } finally {
    isScanning.value = false
  }
}

const clearSession = () => {
  if (!sessionItems.value.length) return
  if (confirm(t('scanner.stocktakePage.confirmClear'))) {
    sessionItems.value = []
    localStorage.removeItem(STORAGE_KEY)
  }
}

const exportCsv = () => {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [['Barcode', 'Book', 'Status', 'Scanned At'].map(escape).join(',')]
  sessionItems.value.forEach((i) => {
    lines.push([i.barcode, i.title || '', statusLabel(i.status), i.scannedAt].map(escape).join(','))
  })
  // BOM so Excel shows Khmer text correctly.
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stocktake-session-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
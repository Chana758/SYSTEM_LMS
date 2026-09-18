<template>
  <div class="space-y-6 pb-12">
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm space-y-6">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ClipboardDocumentCheckIcon class="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">{{ t('scanner.stocktakePage.title') }}</h1>
            <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ t('scanner.stocktakePage.subtitle') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink
            to="/scanner"
            class="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
          >
            <span>← {{ t('scanner.stocktakePage.backToScanner') }}</span>
          </RouterLink>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">

        <div class="bg-white rounded-2xl border border-slate-400 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-500">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <QrCodeIcon class="w-6 h-6"/>
            </div>
            <span class="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">{{ t('scanner.stocktakePage.scanned') }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ sessionItems.length }}</p>
            <p class="text-[11px] font-bold text-blue-700 tracking-wide">{{ t('scanner.stocktakePage.totalScanned') }}</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-400 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-500">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircleIcon class="w-6 h-6"/>
            </div>
            <span class="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full">{{ t('scanner.stocktakePage.onShelf') }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ counts.available }}</p>
            <p class="text-[11px] font-bold text-emerald-700 tracking-wide">{{ t('scanner.stocktakePage.availableCopies') }}</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-400 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-500">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <ExclamationTriangleIcon class="w-6 h-6"/>
            </div>
            <span class="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full">{{ t('scanner.stocktakePage.checkedOut') }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ counts.borrowed }}</p>
            <p class="text-[11px] font-bold text-amber-700 tracking-wide">{{ t('scanner.stocktakePage.activeLoans') }}</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-400 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-500">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <XCircleIcon class="w-6 h-6"/>
            </div>
            <span class="text-[10px] font-extrabold text-rose-700 uppercase tracking-widest bg-rose-50 px-2.5 py-1 rounded-full">{{ t('scanner.stocktakePage.unrecognized') }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ counts.not_found }}</p>
            <p class="text-[11px] font-bold text-rose-700 tracking-wide">{{ t('scanner.stocktakePage.unknownBarcodes') }}</p>
          </div>
        </div>

      </div>

    </div>

    <div class="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
      <BarcodeScanner :is-loading="isScanning" accent="purple" @scan="handleScan" />
    </div>

    <div class="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 class="text-xs font-black text-slate-800 uppercase tracking-wider">{{ t('scanner.stocktakePage.sessionLog') }}</h2>
        <div class="flex items-center gap-2.5">
          <button
            @click="clearSession"
            :disabled="!sessionItems.length"
            class="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <TrashIcon class="w-4 h-4" />
            {{ t('scanner.stocktakePage.clearSession') }}
          </button>

          <button
            @click="exportCsv"
            :disabled="!sessionItems.length"
            class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            {{ t('scanner.stocktakePage.exportSession') }}
          </button>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 overflow-hidden bg-white">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="text-left px-5 py-3.5">{{ t('scanner.stocktakePage.colBarcode') }}</th>
              <th class="text-left px-5 py-3.5">{{ t('scanner.stocktakePage.colBook') }}</th>
              <th class="text-left px-5 py-3.5">{{ t('scanner.stocktakePage.colStatus') }}</th>
              <th class="text-left px-5 py-3.5">{{ t('scanner.stocktakePage.colScannedAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="!sessionItems.length">
              <td colspan="4" class="text-center py-12 text-slate-400 text-xs font-medium">{{ t('scanner.stocktakePage.noScansYet') }}</td>
            </tr>
            <tr v-for="(item, idx) in sessionItems" :key="idx" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-5 py-3.5 font-mono text-xs text-slate-600 font-medium">{{ item.barcode }}</td>
              <td class="px-5 py-3.5 font-semibold text-slate-800">{{ item.title || '—' }}</td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-xs font-medium text-slate-400">{{ item.scannedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ClipboardDocumentCheckIcon, ArrowDownTrayIcon, TrashIcon,
  QrCodeIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon
} from '@heroicons/vue/24/outline'
import BarcodeScanner from '../components/BarcodeScanner.vue'
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

watch(
  sessionItems,
  (newItems) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
  },
  { deep: true }
)

const counts = computed(() => ({
  available: sessionItems.value.filter((i) => i.status === 'available').length,
  borrowed: sessionItems.value.filter((i) => i.status === 'borrowed').length,
  not_found: sessionItems.value.filter((i) => i.status === 'not_found').length,
}))

const statusClass = (status) => ({
  available: 'bg-emerald-100 text-emerald-700',
  borrowed: 'bg-amber-100 text-amber-700',
  damaged: 'bg-orange-100 text-orange-700',
  lost: 'bg-rose-100 text-rose-700',
  not_found: 'bg-slate-200 text-slate-600',
}[status] || 'bg-slate-100 text-slate-500')

const statusLabelMap = computed(() => ({
  available: t('scanner.stocktakePage.statusOnShelf'),
  borrowed: t('scanner.stocktakePage.statusCheckedOut'),
  damaged: t('scanner.stocktakePage.statusDamaged'),
  lost: t('scanner.stocktakePage.statusLost'),
  not_found: t('scanner.stocktakePage.statusNotRecognized'),
}))
const statusLabel = (status) => statusLabelMap.value[status] || status

const handleScan = async (barcode) => {
  isScanning.value = true
  try {
    const { data } = await scannerService.scan({
      barcode,
      scan_type: 'lookup',
      device: navigator.userAgent,
    })
    const status = data.book_copy?.status ?? (data.result === 'not_found' ? 'not_found' : 'available')
    sessionItems.value.unshift({
      barcode,
      title: data.book_copy?.book?.title,
      status,
      scannedAt: new Date().toLocaleTimeString(),
    })
    status === 'not_found' ? soundService.notFound() : soundService.success()
    soundService.vibrate([30])
  } catch (e) {
    sessionItems.value.unshift({
      barcode,
      title: null,
      status: 'not_found',
      scannedAt: new Date().toLocaleTimeString(),
    })
    soundService.error()
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
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stocktake-session-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
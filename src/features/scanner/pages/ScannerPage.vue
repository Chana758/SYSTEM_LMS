<template>
  <div class="space-y-6 pb-12">
    <!-- MAIN CONTAINER WRAPPER -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-white/10 shadow-md dark:shadow-black/30 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 transition-colors">

      <!-- HEADER CARD -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-400/25 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <QrCodeIcon class="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div class="min-w-0">
            <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('scanner.pageTitle') }}</h1>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('scanner.pageSubtitle') }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <RouterLink
            to="/scanner/stocktake"
            class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
          >
            <ClipboardDocumentCheckIcon class="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{{ t('scanner.stocktake') }}</span>
          </RouterLink>

          <RouterLink
            to="/scanner/history"
            class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
          >
            <ClockIcon class="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{{ t('scanner.viewHistory') }}</span>
            <ArrowRightIcon class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </RouterLink>
        </div>
      </div>

      <!-- SCAN TYPE TABS -->
      <div class="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
        <button
          v-for="type in scanTypes" :key="type.value"
          @click="scanType = type.value"
          class="flex items-center justify-center gap-2 px-3 sm:px-5 py-3 rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs"
          :class="scanType === type.value
            ? `${type.activeBg} text-white shadow-md ring-2 ring-offset-2 ring-emerald-600/20 dark:ring-offset-slate-900`
            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'"
        >
          <component :is="type.icon" class="w-4 h-4" />
          {{ t(type.labelKey) }}
        </button>
      </div>

      <!-- MAIN CONTENT GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-2">
        <div class="space-y-4">
          <!-- Input mode selector: manual / camera / remote phone -->
          <div class="flex w-full sm:inline-flex sm:w-auto gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-inner">
            <button
              v-for="m in inputModes" :key="m.value"
              @click="setMode(m.value)"
              class="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              :class="mode === m.value ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
            >
              {{ t(m.labelKey) }}
            </button>
          </div>

          <BarcodeScanner v-if="mode === 'manual'" :is-loading="isScanning" :accent="activeType.accent" @scan="handleScan" />
          <CameraScanner v-else-if="mode === 'camera'" @detected="handleScan" />

          <!-- v-show (not v-if) so switching tabs doesn't create a new QR session each time.
               It is only mounted the first time the remote tab is opened. -->
          <RemoteScanPanel v-if="remoteOpened" v-show="mode === 'remote'" @scan="handleScan" />

          <transition name="fade">
            <p v-if="scanError" class="text-xs font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-400/25 rounded-xl px-4 py-3 shadow-2xs">{{ scanError }}</p>
          </transition>
        </div>

        <!-- Result Card Container -->
        <div>
          <transition name="fade" mode="out-in">
            <ScanResultCard
              v-if="lastResult"
              :key="`scan-${scanCounter}`"
              :result="lastResult"
              :scan-type="resultScanType"
              @completed="handleActionCompleted"
            />
            <div v-else class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 p-8 sm:p-12 text-center shadow-inner">
              <div class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <QrCodeIcon class="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">{{ t('scanner.scanToSee') }}</p>
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{{ t('scanner.resultsAppear') }}</p>
            </div>
          </transition>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  ArrowRightIcon, QrCodeIcon, ArrowsRightLeftIcon,
  ArrowUturnLeftIcon, MagnifyingGlassIcon, ClockIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/vue/24/outline'
import BarcodeScanner from '../components/BarcodeScanner.vue'
import CameraScanner from '../components/CameraScanner.vue'
import RemoteScanPanel from '../components/RemoteScanQr.vue'
import ScanResultCard from '../components/ScanResultCard.vue'
import { scannerService } from '../services'

const { t } = useI18n()

const scanTypes = [
  { value: 'borrow', labelKey: 'scanner.typeBorrow', icon: ArrowsRightLeftIcon, activeBg: 'bg-emerald-700 dark:bg-emerald-600', accent: 'green' },
  { value: 'return', labelKey: 'scanner.typeReturn', icon: ArrowUturnLeftIcon, activeBg: 'bg-blue-600', accent: 'blue' },
  { value: 'lookup', labelKey: 'scanner.typeLookup', icon: MagnifyingGlassIcon, activeBg: 'bg-purple-600 dark:bg-violet-600', accent: 'purple' },
]

// New i18n keys needed: scanner.modeCamera, scanner.modeRemote
const inputModes = [
  { value: 'manual', labelKey: 'scanner.modeManualShort' },
  { value: 'camera', labelKey: 'scanner.modeCamera' },
  { value: 'remote', labelKey: 'scanner.modeRemote' },
]

const scanType = ref('borrow')
const activeType = computed(() => scanTypes.find((s) => s.value === scanType.value))

const mode = ref('manual')
const remoteOpened = ref(false)
const isScanning = ref(false)
const scanError = ref('')
const lastResult = ref(null)
// The scan type that produced `lastResult`. The card uses this (not the live tab)
// so a result can never be rendered with the wrong flow.
const resultScanType = ref('borrow')
// Bumped on every scan so the result card re-mounts and its form state resets,
// even when the same book is scanned twice in a row.
const scanCounter = ref(0)

// Sequence number: only the newest request may write its result.
let scanSeq = 0
let clearTimer = null

const cancelClearTimer = () => {
  if (clearTimer) {
    clearTimeout(clearTimer)
    clearTimer = null
  }
}

const setMode = (value) => {
  mode.value = value
  if (value === 'remote') remoteOpened.value = true
}

const isValidScanResult = (payload) =>
  !!payload && typeof payload === 'object' && ['success', 'not_found', 'error'].includes(payload.result)

const handleScan = async (barcode) => {
  cancelClearTimer()
  const seq = ++scanSeq
  const typeAtScan = scanType.value
  scanError.value = ''
  isScanning.value = true
  try {
    const { data } = await scannerService.scan({
      barcode,
      scan_type: typeAtScan,
      device: navigator.userAgent,
    })
    if (seq !== scanSeq) return // stale response, discard
    lastResult.value = data
    resultScanType.value = typeAtScan
    scanCounter.value += 1
  } catch (e) {
    if (seq !== scanSeq) return
    const payload = e.response?.data
    if (isValidScanResult(payload)) {
      lastResult.value = payload
      resultScanType.value = typeAtScan
      scanCounter.value += 1
    } else {
      lastResult.value = null
      scanError.value = payload?.message || t('scanner.scanFailed')
    }
  } finally {
    if (seq === scanSeq) isScanning.value = false
  }
}

// Switching Borrow / Return / Lookup invalidates the previous result:
// cancel any in-flight request, clear the card and make the user scan again.
watch(scanType, () => {
  scanSeq++
  cancelClearTimer()
  lastResult.value = null
  scanError.value = ''
  isScanning.value = false
})

// Keep the success message visible for a moment before clearing the card.
const handleActionCompleted = () => {
  cancelClearTimer()
  const counterAtCompletion = scanCounter.value
  clearTimer = setTimeout(() => {
    // Only clear if no newer scan replaced the card in the meantime.
    if (scanCounter.value === counterAtCompletion) lastResult.value = null
    clearTimer = null
  }, 2500)
}

onBeforeUnmount(cancelClearTimer)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
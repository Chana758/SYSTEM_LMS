<template>
  <div class="space-y-6 pb-12">
    <!-- ============ MAIN CONTAINER WRAPPER ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-8">

      <!-- HEADER CARD -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <QrCodeIcon class="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">{{ t('scanner.pageTitle') }}</h1>
            <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ t('scanner.pageSubtitle') }}</p>
          </div>
        </div>

        <!-- Stocktake link added alongside Scan History -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <RouterLink
            to="/scanner/stocktake"
            class="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
          >
            <ClipboardDocumentCheckIcon class="w-4 h-4 text-slate-500" />
            <span>{{ t('scanner.stocktake') }}</span>
          </RouterLink>

          <RouterLink
            to="/scanner/history"
            class="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
          >
            <ClockIcon class="w-4 h-4 text-slate-500" />
            <span>{{ t('scanner.viewHistory') }}</span>
            <ArrowRightIcon class="w-3.5 h-3.5 text-slate-400" />
          </RouterLink>
        </div>
      </div>

      <!-- SCAN TYPE TABS -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in scanTypes" :key="type.value"
          @click="scanType = type.value"
          class="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs"
          :class="scanType === type.value
            ? `${type.activeBg} text-white shadow-md ring-2 ring-offset-2 ring-emerald-600/20`
            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        >
          <component :is="type.icon" class="w-4 h-4" />
          {{ t(type.labelKey) }}
        </button>
      </div>

      <!-- MAIN CONTENT GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-2">
        <div class="space-y-4">
          <!-- Input Mode Selector: Manual typing vs USB Scan (camera) -->
          <div class="inline-flex gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-inner">
            <button
              @click="mode = 'manual'"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              :class="mode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            >
              {{ t('scanner.modeManualShort') }}
            </button>
            <button
              @click="mode = 'camera'"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              :class="mode === 'camera' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            >
              {{ t('scanner.modeUsbScan') }}
            </button>
          </div>

          <BarcodeScanner v-if="mode === 'manual'" :is-loading="isScanning" :accent="activeType.accent" @scan="handleScan" />
          <CameraScanner v-else @detected="handleScan" />

          <transition name="fade">
            <p v-if="scanError" class="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 shadow-2xs">{{ scanError }}</p>
          </transition>
        </div>

        <!-- Result Card Container -->
        <div>
          <transition name="fade" mode="out-in">
            <ScanResultCard
              v-if="lastResult"
              :key="lastResult?.book_copy?.id || 'result'"
              :result="lastResult"
              :scan-type="scanType"
              @completed="handleActionCompleted"
            />
            <div v-else class="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center shadow-inner">
              <div class="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <QrCodeIcon class="w-8 h-8 text-slate-400" />
              </div>
              <p class="text-xs font-black uppercase tracking-wider text-slate-900">{{ t('scanner.scanToSee') }}</p>
              <p class="text-xs font-semibold text-slate-500 mt-1">{{ t('scanner.resultsAppear') }}</p>
            </div>
          </transition>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowRightIcon, QrCodeIcon, ArrowsRightLeftIcon,
  ArrowUturnLeftIcon, MagnifyingGlassIcon, ClockIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/vue/24/outline'
import BarcodeScanner from '../components/BarcodeScanner.vue'
import CameraScanner from '../components/CameraScanner.vue'
import ScanResultCard from '../components/ScanResultCard.vue'
import { scannerService } from '../services'

const { t } = useI18n()

const scanTypes = [
  { value: 'borrow', labelKey: 'scanner.typeBorrow', icon: ArrowsRightLeftIcon, activeBg: 'bg-emerald-700', accent: 'green' },
  { value: 'return', labelKey: 'scanner.typeReturn', icon: ArrowUturnLeftIcon, activeBg: 'bg-blue-600', accent: 'blue' },
  { value: 'lookup', labelKey: 'scanner.typeLookup', icon: MagnifyingGlassIcon, activeBg: 'bg-purple-600', accent: 'purple' },
]

const scanType = ref('borrow')
const activeType = computed(() => scanTypes.find((s) => s.value === scanType.value))

const mode = ref('manual')
const isScanning = ref(false)
const scanError = ref('')
const lastResult = ref(null)

const isValidScanResult = (payload) =>
  !!payload && typeof payload === 'object' && ['success', 'not_found', 'error'].includes(payload.result)

const handleScan = async (barcode) => {
  scanError.value = ''
  isScanning.value = true
  try {
    const { data } = await scannerService.scan({
      barcode,
      scan_type: scanType.value,
      device: navigator.userAgent,
    })
    lastResult.value = data
  } catch (e) {
    const payload = e.response?.data
    if (isValidScanResult(payload)) {
      lastResult.value = payload
    } else {
      lastResult.value = null
      scanError.value = payload?.message || t('scanner.scanFailed')
    }
  } finally {
    isScanning.value = false
  }
}

const handleActionCompleted = () => {
  lastResult.value = null
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
<template>
  <div class="p-6">
    <!-- Header card -->
    <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <QrCodeIcon class="w-6 h-6 text-green-700" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Scanner</h1>
          <p class="text-sm text-gray-400 mt-0.5">Scan a barcode to check out, return, or look up a book instantly.</p>
        </div>
      </div>

      <RouterLink
        to="/scanner/history"
        class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex-shrink-0"
      >
        <ClockIcon class="w-4 h-4" />
        View Scan History
        <ArrowRightIcon class="w-3.5 h-3.5" />
      </RouterLink>
    </div>

    <!-- Scan type tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="type in scanTypes" :key="type.value"
        @click="scanType = type.value"
        class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200"
        :class="scanType === type.value
          ? `${type.activeBg} text-white shadow-md`
          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'"
      >
        <component :is="type.icon" class="w-4 h-4" />
        {{ type.label }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="space-y-4">
        <div class="inline-flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            @click="mode = 'manual'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="mode === 'manual' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'"
          >
            Manual / USB Scanner
          </button>
          <button
            @click="mode = 'camera'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="mode === 'camera' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'"
          >
            Camera
          </button>
        </div>

        <BarcodeScanner v-if="mode === 'manual'" :is-loading="isScanning" :accent="activeType.accent" @scan="handleScan" />
        <CameraScanner v-else @detected="handleScan" />

        <transition name="fade">
          <p v-if="scanError" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{{ scanError }}</p>
        </transition>
      </div>

      <div>
        <transition name="fade" mode="out-in">
          <ScanResultCard
            v-if="lastResult"
            :key="lastResult?.book_copy?.id || 'result'"
            :result="lastResult"
            :scan-type="scanType"
            @completed="handleActionCompleted"
          />
          <div v-else class="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <QrCodeIcon class="w-8 h-8 text-gray-300" />
            </div>
            <p class="text-sm font-medium text-gray-500">Scan a barcode to see the result here</p>
            <p class="text-xs text-gray-400 mt-1">Results appear instantly as staff scan books</p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ArrowRightIcon, QrCodeIcon, ArrowsRightLeftIcon,
  ArrowUturnLeftIcon, MagnifyingGlassIcon, ClockIcon,
} from '@heroicons/vue/24/outline'
import BarcodeScanner from '../components/BarcodeScanner.vue'
import CameraScanner from '../components/CameraScanner.vue'
import ScanResultCard from '../components/ScanResultCard.vue'
import { scannerService } from '../services'

const scanTypes = [
  { value: 'borrow', label: 'Borrow', icon: ArrowsRightLeftIcon, activeBg: 'bg-green-700', accent: 'green' },
  { value: 'return', label: 'Return', icon: ArrowUturnLeftIcon, activeBg: 'bg-blue-600', accent: 'blue' },
  { value: 'lookup', label: 'Lookup', icon: MagnifyingGlassIcon, activeBg: 'bg-purple-600', accent: 'purple' },
]

const scanType = ref('borrow')
const activeType = computed(() => scanTypes.find((t) => t.value === scanType.value))

const mode = ref('manual')
const isScanning = ref(false)
const scanError = ref('')
const lastResult = ref(null)

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
    if (e.response?.data) {
      lastResult.value = e.response.data
    } else {
      scanError.value = 'Failed to process scan. Check your connection and try again.'
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
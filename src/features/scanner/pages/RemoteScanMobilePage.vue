<template>
  <!-- Force dark theme: this phone page always sits on a dark background -->
  <div class="dark min-h-screen bg-slate-900 p-4 flex flex-col justify-center">
    <div v-if="status === 'checking'" class="text-white text-center text-sm animate-pulse">
      {{ t('scanner.remoteScan.checkingSession') }}
    </div>

    <div v-else-if="status === 'invalid'" class="text-center text-sm text-rose-300 bg-rose-950/50 border border-rose-400/25 rounded-xl p-6">
      {{ t('scanner.remoteScan.invalidSession') }}
    </div>

    <div v-else class="space-y-4">
      <!-- Continuous mode: camera stays on after each scan -->
      <CameraScanner continuous auto-start @detected="onDetected" />

      <transition name="fade" mode="out-in">
        <p v-if="justSent" key="ok" class="text-center text-emerald-300 text-sm font-semibold">
          ✓ {{ t('scanner.remoteScan.sentScanNext') }}
          <span v-if="lastBarcode" class="block font-mono text-xs text-emerald-200/80 mt-1">{{ lastBarcode }}</span>
        </p>
        <p v-else-if="sendError" key="err" class="text-center text-rose-300 text-sm font-semibold bg-rose-950/50 border border-rose-400/25 rounded-xl px-4 py-3">
          {{ sendError }}
        </p>
        <p v-else-if="sentCount" key="count" class="text-center text-slate-400 text-xs">
          {{ t('scanner.remoteScan.sentCount', { count: sentCount }) }}
        </p>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CameraScanner from '@/features/scanner/components/CameraScanner.vue'
import { soundService } from '@/features/scanner/services/soundService'
import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

const { t } = useI18n()
const route = useRoute()
const sessionId = route.params.sessionId

const status = ref('checking') // checking | ready | invalid
const justSent = ref(false)
const sendError = ref('')
const sentCount = ref(0)
const lastBarcode = ref('')

let sending = false
let sentTimer = null
let errorTimer = null

onMounted(async () => {
  try {
    const { data } = await apiClient.get(ENDPOINTS.REMOTE_SCAN.STATUS(sessionId))
    status.value = data.valid ? 'ready' : 'invalid'
  } catch {
    status.value = 'invalid'
  }
})

onBeforeUnmount(() => {
  clearTimeout(sentTimer)
  clearTimeout(errorTimer)
})

function showError(message) {
  sendError.value = message
  justSent.value = false
  clearTimeout(errorTimer)
  errorTimer = setTimeout(() => (sendError.value = ''), 3000)
  soundService.error()
  soundService.vibrate([60, 40, 60])
}

async function onDetected(barcode) {
  // One request at a time, so a fast camera can't flood the API.
  if (sending) return
  sending = true
  sendError.value = ''

  try {
    await apiClient.post(ENDPOINTS.REMOTE_SCAN.SUBMIT(sessionId), { barcode })

    lastBarcode.value = barcode
    sentCount.value += 1
    justSent.value = true
    soundService.success()
    soundService.vibrate([30])

    clearTimeout(sentTimer)
    sentTimer = setTimeout(() => (justSent.value = false), 1500)
  } catch (e) {
    const code = e.response?.status

    if (code === 404 || code === 410) {
      status.value = 'invalid'
    } else if (code === 429) {
      showError(t('scanner.remoteScan.tooFast'))
    } else if (!e.response) {
      showError(t('scanner.remoteScan.networkError'))
    } else {
      showError(e.response?.data?.message || t('scanner.remoteScan.sendFailed'))
    }
  } finally {
    sending = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
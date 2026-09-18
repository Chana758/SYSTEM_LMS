<template>
  <div class="min-h-screen bg-slate-900 p-4 flex flex-col justify-center">
    <div v-if="status === 'checking'" class="text-white text-center text-sm">{{ t('scanner.remoteScan.checkingSession') }}</div>
    <div v-else-if="status === 'invalid'" class="text-center text-sm text-rose-300 bg-rose-950/50 rounded-xl p-6">
      {{ t('scanner.remoteScan.invalidSession') }}
    </div>
    <div v-else>
      <CameraScanner @detected="onDetected" />
      <p v-if="justSent" class="text-center text-emerald-300 text-sm mt-4 font-semibold">✓ {{ t('scanner.remoteScan.sentScanNext') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CameraScanner from '@/features/scanner/components/CameraScanner.vue'
import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

const { t } = useI18n()
const route = useRoute()
const sessionId = route.params.sessionId
const status = ref('checking')
const justSent = ref(false)

onMounted(async () => {
  try {
    const { data } = await apiClient.get(ENDPOINTS.REMOTE_SCAN.STATUS(sessionId))
    status.value = data.valid ? 'ready' : 'invalid'
  } catch {
    status.value = 'invalid'
  }
})

async function onDetected(barcode) {
  try {
    await apiClient.post(ENDPOINTS.REMOTE_SCAN.SUBMIT(sessionId), { barcode })
    justSent.value = true
    setTimeout(() => (justSent.value = false), 1200)
  } catch (e) {
    if (e.response?.status === 404) status.value = 'invalid'
  }
}
</script>
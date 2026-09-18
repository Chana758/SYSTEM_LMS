<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
    <div v-if="loadingSession" class="py-10 text-sm text-slate-400">{{ t('scanner.remoteScan.generating') }}</div>

    <template v-else-if="sessionId">
      <div class="inline-block p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
        <img :src="qrImageUrl" :alt="t('scanner.remoteScan.qrAlt')" class="w-44 h-44 mx-auto" />
      </div>

      <p class="text-xs font-semibold text-slate-600 mt-3">
        {{ t('scanner.remoteScan.instructions') }}
      </p>

      <div class="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-bold uppercase tracking-wider" :class="expired ? 'text-rose-500' : 'text-emerald-600'">
        <span class="w-1.5 h-1.5 rounded-full" :class="expired ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'"></span>
        {{ expired ? t('scanner.remoteScan.sessionExpired') : t('scanner.remoteScan.readyWaiting') }}
      </div>

      <p v-if="lastReceived" class="text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mt-3">
        ✓ {{ t('scanner.remoteScan.received', { barcode: lastReceived }) }}
      </p>

      <button
        v-if="expired"
        @click="startSession"
        class="mt-3 text-xs font-bold text-emerald-700 hover:underline"
      >
        {{ t('scanner.remoteScan.generateNew') }}
      </button>
    </template>

    <p v-if="error" class="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'
import { createEcho } from '@/echo'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['scan'])

const sessionId = ref(null)
const qrImageUrl = ref('')
const loadingSession = ref(false)
const expired = ref(false)
const error = ref('')
const lastReceived = ref('')

let echo = null
let expiryTimer = null

function buildQrImageUrl(mobileUrl) {
  const encoded = encodeURIComponent(mobileUrl)
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encoded}`
}

async function startSession() {
  error.value = ''
  expired.value = false
  lastReceived.value = ''
  loadingSession.value = true
  teardownEcho()
  clearTimeout(expiryTimer)

  try {
    const { data } = await apiClient.post(ENDPOINTS.REMOTE_SCAN.CREATE_SESSION)
    sessionId.value = data.session_id

    const mobileUrl = `${window.location.origin}/remote-scan/${data.session_id}`
    qrImageUrl.value = buildQrImageUrl(mobileUrl)

    listenForScans(data.session_id)

    // Backend TTL is 15 minutes for scan sessions (longer than login's
    // 5 — a stocktake/borrow session runs for a while, not a single
    // one-shot login).
    expiryTimer = setTimeout(() => {
      expired.value = true
      teardownEcho()
    }, (data.expires_in_minutes ?? 15) * 60 * 1000)
  } catch (e) {
    error.value = e.response?.data?.message || t('scanner.remoteScan.generateError')
  } finally {
    loadingSession.value = false
  }
}

function listenForScans(id) {
  echo = createEcho()
  // NOTE: unlike RemoteLoginQr.vue, this channel is NOT torn down after
  // one event — a scanning session is expected to receive many
  // barcodes in a row from the same paired phone until it expires or
  // the user navigates away.
  echo.channel(`remote-scan.${id}`).listen('.RemoteBarcodeScanned', (payload) => {
    lastReceived.value = payload.barcode
    emit('scan', payload.barcode)
  })
}

function teardownEcho() {
  if (echo) {
    echo.leave(`remote-scan.${sessionId.value}`)
    echo.disconnect()
    echo = null
  }
}

onMounted(startSession)
onBeforeUnmount(() => {
  teardownEcho()
  clearTimeout(expiryTimer)
})
</script>
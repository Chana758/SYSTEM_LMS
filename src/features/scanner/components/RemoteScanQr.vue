<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6 text-center transition-colors">
    <div v-if="loadingSession" class="py-10 text-sm text-slate-400 dark:text-slate-400">{{ t('scanner.remoteScan.generating') }}</div>

    <template v-else-if="sessionId">
      <!-- QR codes need a white background to stay scannable -->
      <div class="inline-block p-3 bg-white rounded-2xl border-2 border-slate-200 dark:border-white/20 shadow-sm" :class="expired ? 'opacity-40' : ''">
        <img v-if="qrImageUrl" :src="qrImageUrl" :alt="t('scanner.remoteScan.qrAlt')" class="w-44 h-44 mx-auto" />
      </div>

      <p class="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-3">
        {{ t('scanner.remoteScan.instructions') }}
      </p>

      <p class="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1 break-all">{{ PUBLIC_URL }}</p>

      <p
        v-if="phoneNeedsHttps"
        class="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/25 rounded-lg px-3 py-2 mt-3 text-left"
      >
        {{ t('scanner.remoteScan.httpsHint') }}
      </p>

      <div class="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-bold uppercase tracking-wider" :class="expired ? 'text-rose-500 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'">
        <span class="w-1.5 h-1.5 rounded-full" :class="expired ? 'bg-rose-500 dark:bg-rose-400' : 'bg-emerald-500 dark:bg-emerald-400 animate-pulse'"></span>
        {{ expired ? t('scanner.remoteScan.sessionExpired') : t('scanner.remoteScan.readyWaiting') }}
      </div>

      <p v-if="lastReceived" class="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-transparent dark:border-emerald-400/25 rounded-lg px-3 py-2 mt-3">
        ✓ {{ t('scanner.remoteScan.received', { barcode: lastReceived }) }}
      </p>

      <button
        v-if="expired"
        @click="startSession"
        class="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
      >
        {{ t('scanner.remoteScan.generateNew') }}
      </button>
    </template>

    <template v-else-if="error">
      <button
        @click="startSession"
        class="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
      >
        {{ t('scanner.remoteScan.generateNew') }}
      </button>
    </template>

    <p v-if="error" class="text-xs text-red-600 dark:text-rose-300 bg-red-50 dark:bg-rose-500/10 border border-transparent dark:border-rose-400/25 rounded-lg px-3 py-2 mt-3">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import QRCode from 'qrcode' // npm i qrcode
import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'
import { createEcho } from '@/echo'
import { useI18n } from 'vue-i18n'
import { soundService } from '../services/soundService'

const { t } = useI18n()

const emit = defineEmits(['scan'])

const sessionId = ref(null)
const qrImageUrl = ref('')
const loadingSession = ref(false)
const expired = ref(false)
const error = ref('')
const lastReceived = ref('')

let echo = null
let channelName = null
let expiryTimer = null

/* global __DEV_LAN_IP__ */
// The phone opens this link, and a phone can't reach "localhost".
// Order: VITE_PUBLIC_URL (.env) → this laptop's Wi-Fi IP (dev server) → the current address.
const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
const devLanIp = typeof __DEV_LAN_IP__ !== 'undefined' ? __DEV_LAN_IP__ : ''
const PUBLIC_URL = (
  import.meta.env.VITE_PUBLIC_URL ||
  (isLocalhost && devLanIp
    ? `${window.location.protocol}//${devLanIp}${window.location.port ? `:${window.location.port}` : ''}`
    : window.location.origin)
).replace(/\/$/, '')

// Phones only allow the camera on HTTPS pages.
const phoneNeedsHttps = !PUBLIC_URL.startsWith('https://')

async function buildQrImageUrl(mobileUrl) {
  return QRCode.toDataURL(mobileUrl, { width: 260, margin: 1, errorCorrectionLevel: 'M' })
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

    const mobileUrl = `${PUBLIC_URL}/remote-scan/${data.session_id}`
    qrImageUrl.value = await buildQrImageUrl(mobileUrl)

    listenForScans(data.session_id)

    expiryTimer = setTimeout(() => {
      expired.value = true
      teardownEcho()
    }, (data.expires_in_minutes ?? 15) * 60 * 1000)
  } catch (e) {
    sessionId.value = null
    error.value = e.response?.data?.message || t('scanner.remoteScan.generateError')
  } finally {
    loadingSession.value = false
  }
}

function listenForScans(id) {
  channelName = `remote-scan.${id}`
  echo = createEcho()
  echo.channel(channelName).listen('.RemoteBarcodeScanned', (payload) => {
    lastReceived.value = payload.barcode
    soundService.vibrate([20])
    emit('scan', payload.barcode)
  })
}

function teardownEcho() {
  if (echo) {
    if (channelName) echo.leave(channelName)
    echo.disconnect()
  }
  echo = null
  channelName = null
}

onMounted(startSession)
onBeforeUnmount(() => {
  teardownEcho()
  clearTimeout(expiryTimer)
})
</script>
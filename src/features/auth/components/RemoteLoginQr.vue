<template>
  <div class="text-center py-2">
    <div v-if="loadingSession" class="py-10 text-sm text-slate-400">Generating QR code…</div>

    <template v-else-if="sessionId">
      <div class="inline-block p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
        <img :src="qrImageUrl" :alt="'Scan with your phone'" class="w-44 h-44" />
      </div>

      <!-- PIN is shown only on this screen, never encoded in the QR.
           The phone user must type it after scanning to authorize the login. -->
      <div class="mt-4">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          {{ $t('auth.enterThisPin') }}
        </p>
        <div class="inline-flex gap-1.5">
          <span
            v-for="(digit, i) in pinDigits"
            :key="i"
            class="w-8 h-10 flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-lg font-black text-slate-800 tracking-wider"
          >
            {{ digit }}
          </span>
        </div>
      </div>

      <p class="text-xs font-semibold text-slate-600 mt-4">
        {{ $t('auth.usePhoneInstructions') }}
      </p>

      <div
        class="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-bold uppercase tracking-wider"
        :class="invalid ? 'text-rose-500' : 'text-emerald-600'"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="invalid ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'"></span>
        {{ invalid ? (authError || $t('auth.qrExpired')) : $t('auth.waitingForScan') }}
      </div>

      <button
        v-if="invalid"
        @click="startSession"
        class="mt-3 text-xs font-bold text-[#17664b] hover:underline"
      >
        {{ $t('auth.refreshQr') }}
      </button>
    </template>

    <p v-if="error" class="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'
import { createEcho } from '@/echo'

const props = defineProps({
  authError: { type: String, default: '' },
})

const emit = defineEmits(['scan'])

const sessionId = ref(null)
const pin = ref('')
const qrImageUrl = ref('')
const loadingSession = ref(false)
const expired = ref(false)
const error = ref('')

// One box per digit for the PIN tiles
const pinDigits = computed(() => pin.value.split(''))

let echo = null
let expiryTimer = null

function buildQrImageUrl(mobileUrl) {
  const encoded = encodeURIComponent(mobileUrl)
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encoded}`
}

// Create a login session, show its QR + PIN, and wait for the phone to scan
async function startSession() {
  error.value = ''
  expired.value = false
  loadingSession.value = true
  teardownEcho()
  clearTimeout(expiryTimer)

  try {
    const { data } = await apiClient.post(ENDPOINTS.REMOTE_LOGIN.CREATE_SESSION)
    sessionId.value = data.session_id
    pin.value = data.pin

    const mobileUrl = `${window.location.origin}/remote-login/${data.session_id}`
    qrImageUrl.value = buildQrImageUrl(mobileUrl)

    listenForScan(data.session_id)

    expiryTimer = setTimeout(() => {
      expired.value = true
      teardownEcho()
    }, (data.expires_in_minutes ?? 5) * 60 * 1000)
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not generate a QR code. Please try again.'
  } finally {
    loadingSession.value = false
  }
}

// Listen for the phone's scan event and pass the QR token to the parent
function listenForScan(id) {
  echo = createEcho()
  echo.channel(`remote-login.${id}`).listen('.RemoteQrScanned', (payload) => {
    emit('scan', payload.qrToken)
  })
}

// Mark the QR as expired when the parent reports an auth error
watch(
  () => props.authError,
  (val) => {
    if (val) {
      expired.value = true
      teardownEcho()
    }
  }
)

const invalid = expired

function teardownEcho() {
  if (echo) {
    echo.leave(`remote-login.${sessionId.value}`)
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
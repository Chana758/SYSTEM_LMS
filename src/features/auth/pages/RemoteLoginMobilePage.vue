<template>
  <div class="min-h-screen bg-slate-900 p-4 flex flex-col justify-center">
    <div v-if="status === 'checking'" class="text-white text-center text-sm">
      Checking session...
    </div>

    <div v-else-if="status === 'invalid'" class="text-center text-sm text-rose-300 bg-rose-950/50 rounded-xl p-6">
      This scan session is invalid or expired. Refresh the QR code on the computer screen and re-scan.
    </div>

    <div v-else-if="sent" class="text-center">
      <div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p class="text-white font-semibold text-base">Sent</p>
      <p class="text-slate-400 text-sm mt-1">Check your computer screen to continue.</p>
      <p class="text-slate-500 text-xs mt-4">You can close this tab now.</p>
    </div>

    <!-- PIN entry: shown after a QR is detected, before anything is sent.
         The camera is already unmounted here, and the PIN is what authorizes the login. -->
    <div v-else-if="pendingToken" class="text-center">
      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <p class="text-white font-semibold text-sm">Enter the PIN shown on the computer screen</p>

      <input
        v-model="pinInput"
        type="tel"
        inputmode="numeric"
        maxlength="6"
        placeholder="••••••"
        class="mt-4 w-48 mx-auto block text-center text-2xl tracking-[0.5em] font-black bg-white/10 border border-white/20 rounded-xl py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
        @input="pinInput = pinInput.replace(/\D/g, '').slice(0, 6)"
      />

      <p v-if="pinError" class="text-rose-300 text-xs bg-rose-950/50 rounded-lg px-3 py-2 mt-3">{{ pinError }}</p>

      <button
        :disabled="pinInput.length !== 6 || submitting"
        @click="confirmPin"
        class="mt-4 w-48 mx-auto block bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-xl transition"
      >
        {{ submitting ? 'Confirming…' : 'Confirm' }}
      </button>

      <button
        @click="cancelPending"
        class="mt-3 text-slate-400 text-xs hover:text-slate-200 underline"
      >
        Cancel and scan again
      </button>
    </div>

    <div v-else>
      <CameraScanner @detected="onDetected" />
      <p class="text-center text-slate-500 text-[11px] mt-3">
        This camera closes automatically if the session expires.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import CameraScanner from '@/features/scanner/components/CameraScanner.vue'
import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

const POLL_INTERVAL_MS = 15_000

const route = useRoute()
const sessionId = route.params.sessionId

const status = ref('checking') // 'checking' | 'ready' | 'invalid'
const sent = ref(false)

// The scanned token is held locally (not sent) while the PIN screen is shown
const pendingToken = ref('')
const pinInput = ref('')
const pinError = ref('')
const submitting = ref(false)

let pollTimer = null

// Check that the session is still valid
async function checkStatus() {
  try {
    const { data } = await apiClient.get(ENDPOINTS.REMOTE_LOGIN.STATUS(sessionId))
    if (!data.valid) {
      status.value = 'invalid'
      stopPolling()
    } else {
      status.value = 'ready'
    }
  } catch {
    status.value = 'invalid'
    stopPolling()
  }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(checkStatus, POLL_INTERVAL_MS)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// QR detected: hold the token and switch to PIN entry (nothing sent yet)
function onDetected(qrToken) {
  if (pendingToken.value || sent.value) return
  pendingToken.value = qrToken
  pinError.value = ''
  pinInput.value = ''
}

// Discard the scanned token and go back to the camera
function cancelPending() {
  pendingToken.value = ''
  pinInput.value = ''
  pinError.value = ''
}

// Submit the token + PIN; handle invalid session, wrong PIN and lockout
async function confirmPin() {
  if (pinInput.value.length !== 6 || submitting.value) return
  pinError.value = ''
  submitting.value = true
  try {
    await apiClient.post(ENDPOINTS.REMOTE_LOGIN.SUBMIT(sessionId), {
      qr_token: pendingToken.value,
      pin: pinInput.value,
    })
    sent.value = true
    pendingToken.value = ''
    stopPolling()
  } catch (e) {
    const status_code = e.response?.status
    if (status_code === 404) {
      status.value = 'invalid'
      stopPolling()
    } else if (status_code === 422) {
      // Wrong PIN; `locked` means too many attempts and the session is dead
      pinError.value = e.response?.data?.message || 'Incorrect PIN.'
      if (e.response?.data?.locked) {
        status.value = 'invalid'
        stopPolling()
      } else {
        pinInput.value = ''
      }
    } else {
      pinError.value = 'Something went wrong. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await checkStatus()
  if (status.value === 'ready') startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>
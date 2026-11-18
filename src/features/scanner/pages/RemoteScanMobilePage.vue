<template>
  <!-- Phone page opened from the laptop's QR code. Follows the app theme (light / dark / system)
       and has its own toggle, because the phone is usually not logged in. -->
  <div class="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
    <div class="mx-auto w-full max-w-md px-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] space-y-4">

      <!-- Header -->
      <header class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <QrCodeIcon class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h1 class="text-base font-black tracking-tight truncate">{{ t('scanner.remoteScan.phoneTitle') }}</h1>
            <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">{{ t('scanner.remoteScan.phoneSubtitle') }}</p>
          </div>
        </div>

        <button
          type="button"
          @click="themeStore.toggleTheme()"
          :aria-label="themeStore.isDark ? t('scanner.remoteScan.lightMode') : t('scanner.remoteScan.darkMode')"
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors cursor-pointer
                 bg-white border-slate-200 text-slate-600 hover:bg-slate-100
                 dark:bg-slate-800 dark:border-white/10 dark:text-amber-300 dark:hover:bg-slate-700"
        >
          <SunIcon v-if="themeStore.isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>
      </header>

      <!-- Checking -->
      <div
        v-if="status === 'checking'"
        class="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-300 animate-pulse"
      >
        {{ t('scanner.remoteScan.checkingSession') }}
      </div>

      <!-- Invalid / expired -->
      <div
        v-else-if="status === 'invalid'"
        class="rounded-2xl border border-rose-200 dark:border-rose-400/25 bg-rose-50 dark:bg-rose-500/10 p-6 text-center space-y-2"
      >
        <ExclamationTriangleIcon class="w-8 h-8 mx-auto text-rose-500 dark:text-rose-300" />
        <p class="text-sm font-semibold text-rose-700 dark:text-rose-200">{{ t('scanner.remoteScan.invalidSession') }}</p>
      </div>

      <template v-else>
        <!-- Camera needs HTTPS on phones -->
        <div
          v-if="!secure"
          class="rounded-2xl border border-amber-200 dark:border-amber-400/25 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm font-semibold text-amber-800 dark:text-amber-200"
        >
          {{ t('scanner.remoteScan.phoneHttpsHint') }}
        </div>

        <!-- Connected pill -->
        <div class="flex items-center justify-center">
          <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider
                       bg-emerald-50 text-emerald-700 border border-emerald-200
                       dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/25">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            {{ t('scanner.remoteScan.connected') }}
          </span>
        </div>

        <!-- Continuous mode: camera stays on after each scan -->
        <CameraScanner continuous auto-start @detected="onDetected" />

        <!-- Feedback -->
        <transition name="fade" mode="out-in">
          <div
            v-if="justSent"
            key="ok"
            class="rounded-2xl border border-emerald-200 dark:border-emerald-400/25 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-center"
          >
            <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300">✓ {{ t('scanner.remoteScan.sentScanNext') }}</p>
            <p v-if="lastBarcode" class="font-mono text-xs text-emerald-700/80 dark:text-emerald-200/80 mt-1 break-all">{{ lastBarcode }}</p>
          </div>
          <p
            v-else-if="sendError"
            key="err"
            class="rounded-2xl border border-rose-200 dark:border-rose-400/25 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-center text-sm font-semibold text-rose-700 dark:text-rose-200"
          >
            {{ sendError }}
          </p>
          <p v-else key="hint" class="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            {{ sentCount ? t('scanner.remoteScan.sentCount', { count: sentCount }) : t('scanner.remoteScan.pointCamera') }}
          </p>
        </transition>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { QrCodeIcon, SunIcon, MoonIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import CameraScanner from '@/features/scanner/components/CameraScanner.vue'
import { soundService } from '@/features/scanner/services/soundService'
import { useThemeStore } from '@/stores/themeStore'
import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

const { t } = useI18n()
const route = useRoute()
const themeStore = useThemeStore()
const sessionId = route.params.sessionId

const secure = typeof window === 'undefined' ? true : window.isSecureContext

const status = ref('checking') // checking | ready | invalid
const justSent = ref(false)
const sendError = ref('')
const sentCount = ref(0)
const lastBarcode = ref('')

let sending = false
let sentTimer = null
let errorTimer = null
let pollTimer = null

async function checkStatus() {
  try {
    const { data } = await apiClient.get(ENDPOINTS.REMOTE_SCAN.STATUS(sessionId))
    status.value = data.valid ? 'ready' : 'invalid'
  } catch {
    status.value = 'invalid'
  }
  if (status.value === 'invalid') clearInterval(pollTimer)
}

onMounted(async () => {
  await checkStatus()
  // Re-check every 30 s so the camera closes by itself when the 15-minute session ends.
  if (status.value === 'ready') pollTimer = setInterval(checkStatus, 30_000)
})

onBeforeUnmount(() => {
  clearTimeout(sentTimer)
  clearTimeout(errorTimer)
  clearInterval(pollTimer)
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

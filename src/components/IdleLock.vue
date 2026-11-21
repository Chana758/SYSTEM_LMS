<template>
  <!-- B2.7: lock the front-desk screen after N idle minutes (staff only) -->
  <div v-if="locked" class="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
    <form @submit.prevent="unlock" class="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
      <div class="flex items-center gap-3">
        <LockClosedIcon class="w-8 h-8 text-[#17664b] dark:text-emerald-400" />
        <div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ t('auth.idleLock.title') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ authStore.user?.name }}</p>
        </div>
      </div>
      <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('auth.idleLock.subtitle') }}</p>
      <input
        ref="input"
        v-model="password"
        type="password"
        autocomplete="current-password"
        class="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 dark:text-white px-4 text-base sm:text-sm font-semibold focus:outline-none focus:border-[#17664b]"
      />
      <p v-if="error" class="text-xs font-semibold text-red-600">{{ error }}</p>
      <button type="submit" :disabled="busy" class="w-full h-11 rounded-xl bg-[#17664b] hover:bg-[#0f5139] text-white text-sm font-bold disabled:opacity-60 cursor-pointer">
        {{ t('auth.idleLock.unlock') }}
      </button>
      <button type="button" @click="logout" class="w-full text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer">
        {{ t('auth.idleLock.logout') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { LockClosedIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'
import { authService } from '@/features/auth/services/authService'

const LOCK_KEY = 'screen_locked'
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

const { t } = useI18n()
const authStore = useAuthStore()

// The lock survives a page refresh, so reloading can't skip it
const locked = ref(localStorage.getItem(LOCK_KEY) === '1')
const minutes = ref(0)
const password = ref('')
const error = ref('')
const busy = ref(false)
const input = ref(null)
let timer = null

const active = computed(() => authStore.isAuthenticated && authStore.isStaff && minutes.value > 0)

function setLocked(value) {
  locked.value = value
  if (value) localStorage.setItem(LOCK_KEY, '1')
  else localStorage.removeItem(LOCK_KEY)
}

function resetTimer() {
  clearTimeout(timer)
  if (!active.value || locked.value) return
  timer = setTimeout(() => setLocked(true), minutes.value * 60 * 1000)
}

async function unlock() {
  error.value = ''
  busy.value = true
  try {
    await authService.verifyPassword(password.value)
    password.value = ''
    setLocked(false)
    resetTimer()
  } catch (e) {
    error.value = e.response?.data?.errors?.password?.[0] || e.response?.data?.message || 'Error'
  } finally {
    busy.value = false
  }
}

function logout() {
  setLocked(false)
  authStore.logout()
}

watch(locked, async (value) => {
  if (value) {
    await nextTick()
    input.value?.focus()
  }
})

// Logged out (or not staff): never show the lock
watch(active, (value) => {
  if (!value) setLocked(false)
  resetTimer()
})

onMounted(async () => {
  EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
  try {
    const { data } = await authService.config()
    minutes.value = Number(data.idle_lock_minutes) || 0
  } catch {
    minutes.value = 15
  }
  if (!active.value) setLocked(false)
  resetTimer()
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  EVENTS.forEach((e) => window.removeEventListener(e, resetTimer))
})
</script>

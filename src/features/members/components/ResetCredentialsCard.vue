<template>
  <!-- B2.5 (Sam): temporary password for members without email / forgotten PIN -->
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-2xs space-y-3">
    <div>
      <h3 class="text-sm font-black text-slate-900 dark:text-white">{{ t('auth.reset.title') }}</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ t('auth.reset.subtitle') }}</p>
    </div>

    <button type="button" :disabled="busy || !userId" @click="reset"
      class="w-full px-4 py-2.5 rounded-xl border border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-xs font-bold disabled:opacity-50 cursor-pointer">
      {{ t('auth.reset.button') }}
    </button>

    <div v-if="temporary" class="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-400/30 p-3 space-y-2">
      <p class="text-[11px] font-bold text-amber-900 dark:text-amber-200">{{ t('auth.reset.resultTitle') }}</p>
      <div class="flex items-center gap-2">
        <code class="flex-1 text-lg font-black tracking-wider text-slate-900 dark:text-white select-all">{{ temporary }}</code>
        <button type="button" @click="copy" class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 text-xs font-bold cursor-pointer">
          {{ copied ? t('auth.reset.copied') : t('auth.reset.copy') }}
        </button>
      </div>
      <p v-if="login" class="text-[11px] text-slate-600 dark:text-slate-300">{{ t('auth.reset.loginWith') }}: <b>{{ login }}</b></p>
      <p class="text-[11px] text-amber-800 dark:text-amber-300">{{ t('auth.reset.resultHint') }}</p>
    </div>

    <p v-if="error" class="text-xs font-semibold text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authService } from '@/features/auth/services/authService'

const props = defineProps({
  userId: { type: [Number, String], default: null },
})

const { t } = useI18n()
const busy = ref(false)
const temporary = ref('')
const login = ref('')
const copied = ref(false)
const error = ref('')

async function reset() {
  if (!window.confirm(t('auth.reset.confirm'))) return
  busy.value = true
  error.value = ''
  try {
    const { data } = await authService.resetCredentials(props.userId)
    temporary.value = data.temporary_password
    login.value = data.login || ''
    copied.value = false
  } catch (e) {
    error.value = e.response?.data?.message || 'Error'
  } finally {
    busy.value = false
  }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(temporary.value)
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>

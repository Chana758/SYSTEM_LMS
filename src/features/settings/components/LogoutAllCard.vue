<template>
  <!-- B2.8: delete every login token (lost phone, shared computer) -->
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('auth.logoutAll.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-4">{{ t('auth.logoutAll.subtitle') }}</p>
    <button
      type="button"
      :disabled="busy"
      @click="run"
      class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
    >
      {{ t('auth.logoutAll.button') }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth/store/authStore'

const { t } = useI18n()
const authStore = useAuthStore()
const busy = ref(false)

async function run() {
  if (!window.confirm(t('auth.logoutAll.confirm'))) return
  busy.value = true
  await authStore.logoutAll()
  busy.value = false
}
</script>

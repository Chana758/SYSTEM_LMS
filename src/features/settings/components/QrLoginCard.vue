<template>
  <div class="bg-white dark:bg-slate-900/40 rounded-xl border border-gray-200 dark:border-white/10 p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-2">{{ t('settings.qrCard.title') }}</h2>
    <p class="text-sm text-gray-500 dark:text-slate-400 mb-5">{{ t('settings.qrCard.subtitle') }}</p>

    <div v-if="loading" class="py-6 text-center text-sm text-gray-400 dark:text-slate-500">
      {{ t('settings.checkingCardStatus') }}
    </div>

    <!-- No card issued yet -->
    <div v-else-if="!hasCard" class="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-white/10 rounded-xl p-5">
      <p class="text-sm text-gray-600 dark:text-slate-300">{{ t('settings.qrCard.notIssuedTitle') }}</p>
      <p class="text-xs text-gray-400 dark:text-slate-500 mt-3">{{ t('settings.visitFrontDesk') }}</p>
    </div>

    <!-- Card active -->
    <div v-else class="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/30 rounded-xl p-5">
      <div class="flex items-center gap-2 mb-1">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <p class="text-sm font-bold text-emerald-800 dark:text-emerald-300">{{ t('settings.cardActive') }}</p>
      </div>
      <p class="text-sm text-emerald-700 dark:text-emerald-200">{{ t('settings.qrCardActive') }}</p>
      <p v-if="expiresAt" class="text-xs text-emerald-600 dark:text-emerald-300/80 mt-1">
        {{ t('settings.cardApprovals.validUntil', { date: formattedExpiry }) }}
      </p>

      <button
        type="button"
        @click="handleRevoke"
        :disabled="revoking"
        class="mt-4 text-sm border border-red-300 dark:border-rose-400/40 text-red-600 dark:text-rose-300 hover:bg-red-50 dark:hover:bg-rose-500/10 px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
      >
        {{ revoking ? t('settings.qrCard.working') : t('settings.reportLostRevokeCard') }}
      </button>
      <p class="text-xs text-gray-400 dark:text-slate-500 mt-2">{{ t('settings.revokingExplanation') }}</p>
    </div>

    <p v-if="message" class="text-sm mt-4" :class="isError ? 'text-red-600 dark:text-rose-300' : 'text-green-600 dark:text-emerald-300'">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()

const hasCard = ref(false)
const expiresAt = ref(null)
const loading = ref(true)
const revoking = ref(false)
const message = ref('')
const isError = ref(false)

const formattedExpiry = computed(() => {
  if (!expiresAt.value) return null
  return new Date(expiresAt.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
})

async function loadStatus() {
  loading.value = true
  const result = await authStore.getQrCardStatus()
  loading.value = false

  if (result.success) {
    hasCard.value = result.hasCard
    expiresAt.value = result.expiresAt
  }
}

async function handleRevoke() {
  if (!confirm(t('settings.confirmSelfRevoke'))) return

  revoking.value = true
  message.value = ''
  const success = await authStore.revokeQrToken()
  revoking.value = false

  if (success) {
    hasCard.value = false
    expiresAt.value = null
    isError.value = false
    message.value = t('settings.cardRevokedVisitDesk')
  } else {
    isError.value = true
    message.value = t('settings.revokeFailed')
  }
}

onMounted(loadStatus)
</script>
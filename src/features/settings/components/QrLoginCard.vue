<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 mb-2">{{ t('settings.qrCard.title') }}</h2>
    <p class="text-sm text-gray-500 mb-5">
      {{ t('settings.qrCard.subtitle') }}
    </p>

    <div v-if="loading" class="py-6 text-center text-sm text-gray-400">
      {{ t('settings.checkingCardStatus') }}
    </div>

    <!-- STATE: no card issued yet — no self-generate, staff only -->
    <div v-else-if="!hasCard" class="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <p class="text-sm text-gray-600">
        {{ t('settings.qrCard.notIssuedTitle') }}
      </p>
      <p class="text-xs text-gray-400 mt-3">
        {{ t('settings.visitFrontDesk') }}
      </p>
    </div>

    <!-- STATE: card active — status + revoke only, no reissue here -->
    <div v-else class="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
      <div class="flex items-center gap-2 mb-1">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <p class="text-sm font-bold text-emerald-800">{{ t('settings.cardActive') }}</p>
      </div>
      <p class="text-sm text-emerald-700">
        {{ t('settings.qrCardActive') }}
      </p>
      <p v-if="expiresAt" class="text-xs text-emerald-600 mt-1">
        {{ t('settings.cardApprovals.validUntil', { date: formattedExpiry }) }}
      </p>

      <button
        @click="handleRevoke"
        :disabled="revoking"
        class="mt-4 text-sm border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {{ revoking ? t('settings.qrCard.working') : t('settings.reportLostRevokeCard') }}
      </button>
      <p class="text-xs text-gray-400 mt-2">
        {{ t('settings.revokingExplanation') }}
      </p>
    </div>

    <p v-if="message" class="text-sm mt-4" :class="isError ? 'text-red-600' : 'text-green-600'">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const authStore = useAuthStore()

// Card status comes from the user's own profile — set by whichever staff
// member last issued/reissued the card via Card Approvals or the
// Member/Librarian detail page. This component never issues a card
// itself; it only reflects status and allows self-revoke.
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
  if (!confirm(t('settings.confirmSelfRevoke'))) {
    return
  }

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
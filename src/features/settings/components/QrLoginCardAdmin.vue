<template>
  <div class="max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('settings.qrCard.title') }}</h2>

    <div v-if="!hasCard" class="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-white/10 rounded-xl p-4 sm:p-5 mt-4">
      <p class="text-sm text-gray-600 dark:text-slate-300">{{ t('settings.qrCard.notIssuedTitle') }}</p>
      <RouterLink
        to="/settings/card-approvals"
        class="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200"
      >
        {{ t('settings.qrCard.goToQueue') }}
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </RouterLink>
    </div>

    <template v-else>
      <p class="text-sm text-gray-500 dark:text-slate-400 mb-5 mt-1">
        {{ qrDataUrl ? t('settings.qrCard.justIssuedHint') : t('settings.qrCard.reissueHint') }}
      </p>

      <MembershipCardDesign
        v-if="qrDataUrl"
        :qr-data-url="qrDataUrl"
        :name="userName"
        :avatar-url="avatarUrl"
        :role="role"
        :id-label="idLabel"
        :id-value="idValue"
        :sub-label="subLabel"
        :expires-at="expiresAt"
      />

      <!-- Phone: stacked full-width buttons. sm+: one row -->
      <div class="flex flex-col sm:flex-row gap-2 mt-4">
        <a
          v-if="qrDataUrl"
          :href="qrDataUrl"
          :download="`qr-card-${userId}.png`"
          class="sm:flex-1 text-sm border border-gray-300 dark:border-white/15 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2.5 rounded-xl text-center font-medium"
        >
          {{ t('settings.qrCard.download') }}
        </a>
        <button
          v-if="qrDataUrl"
          type="button"
          @click="handlePrintCard"
          class="sm:flex-1 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white px-4 py-2.5 rounded-xl font-medium cursor-pointer"
        >
          {{ t('settings.qrCard.print') }}
        </button>
        <button
          type="button"
          @click="handleReissue"
          :disabled="loading"
          class="sm:flex-1 text-sm border border-red-300 dark:border-rose-400/40 text-red-600 dark:text-rose-300 hover:bg-red-50 dark:hover:bg-rose-500/10 px-4 py-2.5 rounded-xl disabled:opacity-50 font-semibold cursor-pointer"
        >
          {{ loading ? t('settings.qrCard.working') : t('settings.qrCard.lostReissue') }}
        </button>
      </div>
    </template>

    <p v-if="message" class="text-sm mt-3" :class="isError ? 'text-red-600 dark:text-rose-300' : 'text-green-600 dark:text-emerald-300'">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QRCode from 'qrcode'
import { authService } from '@/features/auth/services/authService'
import MembershipCardDesign from './MembershipCardDesign.vue'
import { printMembershipCard } from '@/utils/printMembershipCard'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  userId: { type: [Number, String], required: true },
  userName: { type: String, default: '' },
  idValue: { type: String, default: '—' },
  role: { type: String, default: 'member' }, // 'member' | 'librarian'
  avatarUrl: { type: String, default: null },
  subLabel: { type: String, default: '' },
  hasCard: { type: Boolean, default: false },
})

const idLabel = computed(() => (props.role === 'librarian' ? 'Employee ID' : 'Membership No.'))

const qrDataUrl = ref('')
const expiresAt = ref(null)
const loading = ref(false)
const message = ref('')
const isError = ref(false)

async function handleReissue() {
  if (!confirm(t('settings.qrCard.confirmReissue', { name: props.userName || 'this person' }))) return

  loading.value = true
  message.value = ''
  try {
    const { data } = await authService.generateQrTokenFor(props.userId)
    qrDataUrl.value = await QRCode.toDataURL(data.qr_token, { width: 300, margin: 1 })
    expiresAt.value = data.expires_at
    isError.value = false
    message.value = t('settings.qrCard.reissuedMsg')
  } catch (e) {
    isError.value = true
    message.value = e.response?.data?.message || t('settings.qrCard.reissueFailed', 'Failed to reissue card.')
  } finally {
    loading.value = false
  }
}

function handlePrintCard() {
  printMembershipCard({
    qrDataUrl: qrDataUrl.value,
    name: props.userName,
    avatarUrl: props.avatarUrl,
    role: props.role,
    idLabel: idLabel.value,
    idValue: props.idValue,
    subLabel: props.subLabel,
    expiresAt: expiresAt.value,
  })
}
</script>
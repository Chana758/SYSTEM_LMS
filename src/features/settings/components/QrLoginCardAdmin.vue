<template>
  <div class="max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 mb-1">QR Login Card</h2>
    <p class="text-sm text-gray-500 mb-5">
      {{ cardStatus }}
    </p>

    <MembershipCardDesign
      v-if="qrDataUrl"
      :qr-data-url="qrDataUrl"
      :name="userName"
      :role="role"
      :id-label="role === 'librarian' ? 'Employee ID' : 'Membership No.'"
      :id-value="idValue"
      :expires-at="expiresAt"
    />

    <div class="flex gap-2 mt-4">
      <a v-if="qrDataUrl" :href="qrDataUrl" download="qr-card.png"
        class="flex-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-center">
        Download
      </a>
      <button
        @click="handleGenerate"
        :disabled="loading"
        class="flex-1 text-sm bg-green-700 text-white hover:bg-green-800 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {{ loading ? 'Working...' : (qrDataUrl ? 'Regenerate' : 'Issue QR Card') }}
      </button>
    </div>

    <p v-if="message" class="text-sm mt-3" :class="isError ? 'text-red-600' : 'text-green-600'">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QRCode from 'qrcode'
import { authService } from '@/features/auth/services/authService'
import MembershipCardDesign from './MembershipCardDesign.vue'

const props = defineProps({
  userId: { type: [Number, String], required: true },
  userName: { type: String, default: '' },
  idValue: { type: String, default: '—' },
  role: { type: String, default: 'member' },
  hasCard: { type: Boolean, default: false }, // pass `member.user.has_qr_card` from parent
})

const qrDataUrl = ref('')
const expiresAt = ref(null)
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const cardStatus = computed(() =>
  props.hasCard && !qrDataUrl.value
    ? 'A card has already been issued for this person, but the QR image can only be viewed once — right after issuance. Regenerate to view/print a new one.'
    : 'Issue a QR login card this person can scan at the kiosk to log in instantly.'
)

async function handleGenerate() {
  loading.value = true
  message.value = ''
  try {
    const { data } = await authService.generateQrTokenFor(props.userId)
    qrDataUrl.value = await QRCode.toDataURL(data.qr_token, { width: 300, margin: 1 })
    expiresAt.value = data.expires_at
    isError.value = false
    message.value = 'QR card issued. Download or print it now.'
  } catch (e) {
    isError.value = true
    message.value = e.response?.data?.message || 'Failed to issue QR card.'
  } finally {
    loading.value = false
  }
}
</script>
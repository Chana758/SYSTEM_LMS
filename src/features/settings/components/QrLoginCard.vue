<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 mb-2">QR Login Card</h2>
    <p class="text-sm text-gray-500 mb-5">
      Print this code onto your library card. Scan it at the kiosk to log in without typing a password.
    </p>

    <!-- Same visual card used by QrLoginCardAdmin.vue and
         PendingCardsPage.vue — previously this rendered a plain <img>,
         which looked like a different, unrelated feature even though it
         is the exact same QR-card concept, just self-issued instead of
         staff-issued. -->
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

    <div v-if="qrDataUrl" class="flex gap-2 mt-4">
      <a
        :href="qrDataUrl"
        download="qr-card.png"
        class="flex-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-center"
      >
        Download
      </a>
      <button
        @click="handlePrintCard"
        class="flex-1 text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
      >
        Print
      </button>
      <button
        @click="handleGenerate"
        :disabled="loading"
        class="flex-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        Regenerate
      </button>
      <button
        @click="handleRevoke"
        :disabled="loading"
        class="flex-1 text-sm border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        Revoke
      </button>
    </div>

    <button
      v-else
      @click="handleGenerate"
      :disabled="loading"
      class="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
    >
      {{ loading ? 'Generating…' : 'Generate QR Login Card' }}
    </button>

    <p v-if="message" class="text-sm mt-4" :class="isError ? 'text-red-600' : 'text-green-600'">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QRCode from 'qrcode'
import { useAuthStore } from '@/features/auth/store/authStore'
import MembershipCardDesign from './MembershipCardDesign.vue'
import { printMembershipCard } from '@/utils/printMembershipCard'

const authStore = useAuthStore()

// Derived from the logged-in user's own profile (authStore.user is
// loaded with role/member/librarian relations by the backend on
// login/me) — no props needed since this card is always "about me".
const role = computed(() => authStore.user?.role?.name || 'member')
const userName = computed(() => authStore.user?.name || '')
const avatarUrl = computed(() => {
  if (!authStore.user?.avatar) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${authStore.user.avatar}`
})
const idLabel = computed(() => (role.value === 'librarian' ? 'Employee ID' : 'Membership No.'))
const idValue = computed(() =>
  role.value === 'librarian'
    ? authStore.user?.librarian?.employee_id || '—'
    : authStore.user?.member?.membership_no || '—'
)
const subLabel = computed(() =>
  role.value === 'librarian'
    ? authStore.user?.librarian?.department || ''
    : authStore.user?.member?.membership_type
      ? `${authStore.user.member.membership_type} membership`
      : ''
)

const qrDataUrl = ref('')
const expiresAt = ref(null)
const loading = ref(false)
const message = ref('')
const isError = ref(false)

async function handleGenerate() {
  loading.value = true
  message.value = ''
  const result = await authStore.generateQrToken()
  loading.value = false

  if (result.success) {
    // The raw token is returned exactly once — encode it locally, right
    // now, and never send/store it anywhere beyond this in-memory image.
    qrDataUrl.value = await QRCode.toDataURL(result.qrToken, { width: 300, margin: 1 })
    expiresAt.value = result.expiresAt
    isError.value = false
    message.value = 'QR card generated. Save or print this image securely.'
  } else {
    isError.value = true
    message.value = result.message || 'Failed to generate QR card.'
  }
}

async function handleRevoke() {
  if (!confirm('Revoke this QR card? It will stop working immediately.')) return
  const success = await authStore.revokeQrToken()
  if (success) {
    qrDataUrl.value = ''
    expiresAt.value = null
    message.value = 'QR card revoked.'
    isError.value = false
  } else {
    isError.value = true
    message.value = 'Failed to revoke QR card.'
  }
}

function handlePrintCard() {
  printMembershipCard({
    qrDataUrl: qrDataUrl.value,
    name: userName.value,
    avatarUrl: avatarUrl.value,
    role: role.value,
    idLabel: idLabel.value,
    idValue: idValue.value,
    subLabel: subLabel.value,
    expiresAt: expiresAt.value,
  })
}
</script>
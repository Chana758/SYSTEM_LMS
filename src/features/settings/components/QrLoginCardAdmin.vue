<template>
  <div class="max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 mb-1">QR Login Card</h2>

    <!--
      FIX (workflow separation):
      This component used to let an admin ISSUE a brand-new card directly
      from the Member/Librarian Detail page — the button read "Issue QR
      Card" whenever hasCard was false. That bypassed the Card Approvals
      Queue entirely (a pending user's card could be created without ever
      appearing in /settings/card-approvals), breaking the audit trail
      for first-time issuance.

      New rule:
        hasCard = false  → NOT_ISSUED. No action here. Point the admin to
                            the Card Approvals Queue instead.
        hasCard = true   → ACTIVE. Only "Report Lost & Reissue" is offered,
                            which revokes the old QR and issues a new one
                            (same generateQrTokenFor endpoint under the
                            hood, but the *meaning* here is "replace a
                            lost/compromised card", not "first issue").
    -->

    <!-- State: not yet issued — redirect to the queue, no generate button -->
    <div v-if="!hasCard" class="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <p class="text-sm text-gray-600">
        This person has not been issued a card yet. First-time cards are issued
        from the Card Approvals Queue so every issuance goes through review.
      </p>
      <RouterLink
        to="/settings/card-approvals"
        class="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-emerald-700 hover:text-emerald-800"
      >
        Go to Card Approvals Queue
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </RouterLink>
    </div>

    <!-- State: already active — reissue (lost/compromised card) only -->
    <template v-else>
      <p class="text-sm text-gray-500 mb-5">
        {{ qrDataUrl
          ? 'A new card was just issued below. Download or print it now — it will not be shown again.'
          : 'A card has already been issued for this person. The QR image can only be viewed once, right after issuance — use "Report Lost & Reissue" below if it needs to be replaced.' }}
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

      <div class="flex gap-2 mt-4">
        <a
          v-if="qrDataUrl"
          :href="qrDataUrl"
          :download="`qr-card-${userId}.png`"
          class="flex-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-center"
        >
          Download
        </a>
        <button
          v-if="qrDataUrl"
          @click="handlePrintCard"
          class="flex-1 text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          Print
        </button>
        <button
          @click="handleReissue"
          :disabled="loading"
          class="flex-1 text-sm md:text-xs border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg disabled:opacity-50 font-semibold"
        >
          {{ loading ? 'Working...' : 'Lost & Reissue' }}
        </button>
      </div>
    </template>

    <p v-if="message" class="text-sm mt-3" :class="isError ? 'text-red-600' : 'text-green-600'">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QRCode from 'qrcode'
import { authService } from '@/features/auth/services/authService'
import MembershipCardDesign from './MembershipCardDesign.vue'
import { printMembershipCard } from '@/utils/printMembershipCard'

const props = defineProps({
  userId: { type: [Number, String], required: true },
  userName: { type: String, default: '' },
  idValue: { type: String, default: '—' },
  role: { type: String, default: 'member' }, // 'member' | 'librarian'
  avatarUrl: { type: String, default: null },
  subLabel: { type: String, default: '' },
  hasCard: { type: Boolean, default: false }, // e.g. member.user.has_qr_card from parent
})

const idLabel = computed(() => (props.role === 'librarian' ? 'Employee ID' : 'Membership No.'))

const qrDataUrl = ref('')
const expiresAt = ref(null)
const loading = ref(false)
const message = ref('')
const isError = ref(false)

async function handleReissue() {
  // FIX: explicit confirm, since this immediately invalidates the
  // previous QR — mirrors the confirm() already used for self-service
  // revoke in QrLoginCard.vue, so the two flows feel consistent.
  if (!confirm(`Reissue a card for ${props.userName || 'this person'}? Their previous QR card will stop working immediately.`)) {
    return
  }

  loading.value = true
  message.value = ''
  try {
    const { data } = await authService.generateQrTokenFor(props.userId)
    qrDataUrl.value = await QRCode.toDataURL(data.qr_token, { width: 300, margin: 1 })
    expiresAt.value = data.expires_at
    isError.value = false
    message.value = 'New card issued. Download or print it now — it will not be shown again.'
  } catch (e) {
    isError.value = true
    message.value = e.response?.data?.message || 'Failed to reissue card.'
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
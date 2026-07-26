<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 mb-2">QR Login Card</h2>
    <p class="text-sm text-gray-500 mb-5">
      Print this code onto your library card. Scan it at the kiosk to log in without typing a password.
    </p>

    <div v-if="qrDataUrl" class="flex flex-col items-center gap-4">
      <img :src="qrDataUrl" alt="QR login card" class="w-48 h-48 border border-gray-100 rounded-lg" />
      <p class="text-xs text-gray-400">Expires {{ formatDate(expiresAt) }}</p>
      <div class="flex gap-2">
        <button @click="handleGenerate" class="text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg">
          Regenerate
        </button>
        <button @click="handleRevoke" class="text-sm border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg">
          Revoke
        </button>
      </div>
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
import { ref } from 'vue'
import QRCode from 'qrcode'
import { useAuthStore } from '@/features/auth/store/authStore'

const authStore = useAuthStore()

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

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
      <div class="w-12 h-12 rounded-xl bg-green-800 flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5v3m0-3h3m-3 0 3.75 3.75M20.25 4.5v3m0-3h-3m3 0-3.75 3.75M3.75 19.5v-3m0 3h3m-3 0 3.75-3.75M20.25 19.5v-3m0 3h-3m3 0-3.75-3.75M9 8.25v7.5M12 8.25v7.5M15 8.25v7.5" />
        </svg>
      </div>
      <h1 class="text-xl font-bold text-gray-800 mb-1">{{ $t('auth.scanToLogin') }}</h1>
      <p class="text-sm text-gray-400 mb-6">{{ $t('auth.scanSubtitle') }}</p>

      <QrLoginForm
        :loading="authStore.loading"
        :errors="authStore.errors"
        @submit="handleQrLogin"
      />

      <router-link :to="{ name: 'login' }" class="text-sm text-green-700 hover:underline mt-4 inline-block">
        {{ $t('auth.useEmailInstead') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import QrLoginForm from '../components/QrLoginForm.vue'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()

function redirectAfterLogin() {
  const isStaff = ['admin', 'librarian'].includes(authStore.role)
  router.push({ name: isStaff ? 'dashboard' : 'book-list' })
}

async function handleQrLogin(qrToken) {
  const success = await authStore.loginWithQr(qrToken)
  if (success) redirectAfterLogin()
}
</script>
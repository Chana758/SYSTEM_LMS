<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Library LMS</h1>
        <p class="text-gray-500 text-sm mt-1">Sign in to the Library Management System</p>
      </div>

      <!-- Tab toggle -->
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          type="button"
          @click="mode = 'password'"
          class="flex-1 text-sm font-medium py-1.5 rounded-md transition-colors"
          :class="mode === 'password' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'"
        >
          Password
        </button>
        <button
          type="button"
          @click="mode = 'qr'"
          class="flex-1 text-sm font-medium py-1.5 rounded-md transition-colors"
          :class="mode === 'qr' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'"
        >
          Scan QR Card
        </button>
      </div>

      <LoginForm
        v-if="mode === 'password'"
        :loading="authStore.loading"
        :errors="authStore.errors"
        @submit="handleLogin"
      />
      <QrLoginForm
        v-else
        :loading="authStore.loading"
        :errors="authStore.errors"
        @submit="handleQrLogin"
      />

      <p class="text-center text-sm text-gray-500 mt-6">
        Don't have an account?
        <router-link :to="{ name: 'register' }" class="text-green-700 font-medium">
          Register
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import QrLoginForm from '../components/QrLoginForm.vue'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const mode = ref('password')

function redirectAfterLogin() {
  const isStaff = ['admin', 'librarian'].includes(authStore.role)
  router.push({ name: isStaff ? 'dashboard' : 'book-list' })
}

async function handleLogin(formData) {
  const success = await authStore.login(formData)
  if (success) redirectAfterLogin()
}

async function handleQrLogin(qrToken) {
  const success = await authStore.loginWithQr(qrToken)
  if (success) redirectAfterLogin()
}
</script>
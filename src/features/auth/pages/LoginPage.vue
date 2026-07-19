<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Library LMS</h1>
        <p class="text-gray-500 text-sm mt-1">Sign in to the Library Management System</p>
      </div>

      <LoginForm
        :loading="authStore.loading"
        :errors="authStore.errors"
        @submit="handleLogin"
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
import { useRouter } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogin(formData) {
  const success = await authStore.login(formData)
  if (success) {
    // Staff (admin/librarian) land on the management dashboard.
    // Members have no access to /dashboard (see member.routes.js comment
    // and roleGuard), so they must be sent to their own landing page —
    // otherwise roleGuard immediately bounces them to /unauthorized.
    // Members land on the book catalog so they can browse right away.
    const isStaff = ['admin', 'librarian'].includes(authStore.role)
    router.push({ name: isStaff ? 'dashboard' : 'book-list' })
  }
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Library LMS</h1>
        <p class="text-gray-500 text-sm mt-1">Create a new member account</p>
      </div>

      <RegisterForm
        :loading="authStore.loading"
        :errors="authStore.errors"
        @submit="handleRegister"
      />

      <p class="text-center text-sm text-gray-500 mt-6">
        Already have an account?
        <router-link :to="{ name: 'login' }" class="text-green-700 font-medium">
          Sign in
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import RegisterForm from '../components/RegisterForm.vue'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()

async function handleRegister(formData) {
  const success = await authStore.register(formData)
  if (success) {
    router.push({ name: 'dashboard' })
  }
}
</script>
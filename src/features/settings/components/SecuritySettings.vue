<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 mb-1">Change Password</h2>
    <p class="text-sm text-gray-400 mb-6">Use a strong password you don't use elsewhere.</p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
        <input
          v-model="form.current_password" type="password" required
          class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
        />
        <p v-if="authStore.errors?.current_password" class="text-xs text-red-600 mt-1">{{ authStore.errors.current_password }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
        <input
          v-model="form.password" type="password" required minlength="8"
          class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
        />
        <div v-if="form.password" class="flex gap-1 mt-2">
          <span v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors" :class="i <= strength ? strengthColor : 'bg-gray-100'"></span>
        </div>
        <p v-if="form.password" class="text-xs mt-1" :class="strengthTextClass">{{ strengthLabel }}</p>
        <p v-if="authStore.errors?.password" class="text-xs text-red-600 mt-1">{{ authStore.errors.password }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
        <input
          v-model="form.password_confirmation" type="password" required minlength="8"
          class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
        />
        <p v-if="form.password_confirmation && form.password !== form.password_confirmation" class="text-xs text-red-600 mt-1">
          Passwords do not match.
        </p>
      </div>

      <transition name="fade">
        <p v-if="successMessage" class="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{{ successMessage }}</p>
      </transition>

      <button
        type="submit" :disabled="authStore.loading"
        class="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50"
      >
        {{ authStore.loading ? 'Saving...' : 'Update Password' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'

const authStore = useAuthStore()
const successMessage = ref('')

const form = reactive({ current_password: '', password: '', password_confirmation: '' })

const strength = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})
const strengthLabel = computed(() => ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][strength.value])
const strengthColor = computed(() => ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-600'][strength.value - 1] || 'bg-red-400')
const strengthTextClass = computed(() => (strength.value >= 3 ? 'text-green-600' : 'text-amber-600'))

async function handleSubmit() {
  successMessage.value = ''
  authStore.errors = {}

  const success = await authStore.changePassword({ ...form })
  if (success) {
    successMessage.value = 'Password updated successfully.'
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
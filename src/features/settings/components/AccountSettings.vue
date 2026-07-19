<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 mb-1">Account Information</h2>
    <p class="text-sm text-gray-400 mb-6">Update your personal contact details.</p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
        <input
          v-model="form.name" type="text" required
          class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
        />
        <p v-if="authStore.errors?.name" class="text-xs text-red-600 mt-1">{{ authStore.errors.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
        <input
          v-model="form.email" type="email" required
          class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
        />
        <p v-if="authStore.errors?.email" class="text-xs text-red-600 mt-1">{{ authStore.errors.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
        <input
          v-model="form.phone" type="text" placeholder="e.g. 012 345 678"
          class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
        />
        <p v-if="authStore.errors?.phone" class="text-xs text-red-600 mt-1">{{ authStore.errors.phone }}</p>
      </div>

      <transition name="fade">
        <p v-if="successMessage" class="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{{ successMessage }}</p>
      </transition>

      <button
        type="submit" :disabled="authStore.loading"
        class="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50"
      >
        {{ authStore.loading ? 'Saving...' : 'Save Changes' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'

const authStore = useAuthStore()
const successMessage = ref('')

const form = reactive({ name: '', email: '', phone: '' })

onMounted(() => {
  form.name = authStore.user?.name || ''
  form.email = authStore.user?.email || ''
  form.phone = authStore.user?.phone || ''
})

async function handleSubmit() {
  successMessage.value = ''
  const success = await authStore.updateAccount({ ...form })
  if (success) successMessage.value = 'Account information updated successfully.'
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
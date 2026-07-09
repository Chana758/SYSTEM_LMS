<template>
  <div class="p-6">
    <h1 class="text-xl font-bold text-gray-800 mb-6">Settings</h1>

    <div class="flex gap-6">
      <SettingsNav />

      <div class="flex-1">
        <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
          <h2 class="text-lg font-bold text-gray-800 mb-6">
            Change Password
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Current password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                v-model="form.current_password"
                type="password"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600"
              />
              <p v-if="authStore.errors?.current_password" class="text-xs text-red-600 mt-1">
                {{ authStore.errors.current_password }}
              </p>
            </div>

            <!-- New password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="8"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600"
              />
              <p v-if="authStore.errors?.password" class="text-xs text-red-600 mt-1">
                {{ authStore.errors.password }}
              </p>
            </div>

            <!-- Confirm new password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                v-model="form.password_confirmation"
                type="password"
                required
                minlength="8"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <p v-if="successMessage" class="text-sm text-green-600">
              {{ successMessage }}
            </p>

            <button
              type="submit"
              :disabled="authStore.loading"
              class="px-5 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition disabled:opacity-50"
            >
              {{ authStore.loading ? 'Saving...' : 'Update Password' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import SettingsNav from '@/features/settings/components/SettingsNav.vue'
import { useAuthStore } from '@/features/auth/store/authStore'

const authStore = useAuthStore()
const successMessage = ref('')

const form = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const handleSubmit = async () => {
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
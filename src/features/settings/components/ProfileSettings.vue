<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 mb-1">Profile Picture</h2>
    <p class="text-sm text-gray-400 mb-6">This is how others will see you across the system.</p>

    <div class="flex items-center gap-6">
      <div class="relative">
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Profile Avatar"
          class="w-24 h-24 rounded-full object-cover border-4 border-green-50 shadow-sm"
        />
        <div
          v-else
          class="w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-green-800 text-white text-2xl font-extrabold flex items-center justify-center border-4 border-green-50 shadow-sm"
        >
          {{ initials }}
        </div>

        <div v-if="authStore.loading" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
          <span class="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label
          class="cursor-pointer inline-flex items-center gap-2 justify-center px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-xl hover:bg-green-800 transition"
          :class="{ 'opacity-50 pointer-events-none': authStore.loading }"
        >
          <ArrowUpTrayIcon class="w-4 h-4" />
          Upload New Photo
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            class="hidden"
            :disabled="authStore.loading"
            @change="handleFileSelect"
          />
        </label>

        <button
          v-if="authStore.user?.avatar"
          @click="handleRemove"
          :disabled="authStore.loading"
          class="inline-flex items-center gap-2 justify-center px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition disabled:opacity-50"
        >
          <TrashIcon class="w-4 h-4" />
          Remove Photo
        </button>

        <p class="text-xs text-gray-400">JPG, PNG or WEBP. Maximum file size: 2 MB.</p>
      </div>
    </div>

    <transition name="fade">
      <p v-if="errorMessage" class="text-sm text-red-600 mt-4 bg-red-50 rounded-lg px-3 py-2">{{ errorMessage }}</p>
    </transition>
    <transition name="fade">
      <p v-if="successMessage" class="text-sm text-green-700 mt-4 bg-green-50 rounded-lg px-3 py-2">{{ successMessage }}</p>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowUpTrayIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'

const authStore = useAuthStore()
const successMessage = ref('')
const localError = ref('')

const previewUrl = computed(() => {
  if (!authStore.user?.avatar) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${authStore.user.avatar}`
})

const initials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

const errorMessage = computed(() => localError.value || authStore.errors?.avatar || authStore.errors?.general || '')

function resetMessages() {
  localError.value = ''
  successMessage.value = ''
  authStore.errors = {}
}

async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  resetMessages()

  if (file.size > 2 * 1024 * 1024) {
    localError.value = 'File size must be under 2 MB.'
    event.target.value = ''
    return
  }

  const success = await authStore.uploadAvatar(file)
  if (success) successMessage.value = 'Avatar updated successfully.'
  event.target.value = ''
}

async function handleRemove() {
  resetMessages()
  const success = await authStore.removeAvatar()
  if (success) successMessage.value = 'Avatar removed successfully.'
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
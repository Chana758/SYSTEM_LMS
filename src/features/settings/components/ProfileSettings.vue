<template>
  <!-- No outer card: SettingsCard already provides the surface -->
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('settings.profile.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-6">{{ t('settings.profile.subtitle') }}</p>

    <div class="flex items-center gap-4 sm:gap-6 flex-wrap">
      <div class="relative flex-shrink-0">
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Profile Avatar"
          class="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-green-50 dark:border-emerald-500/30 shadow-sm"
        />
        <div
          v-else
          class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-600 to-green-800 text-white text-2xl font-extrabold flex items-center justify-center border-4 border-green-50 dark:border-emerald-500/30 shadow-sm"
        >
          {{ initials }}
        </div>

        <div v-if="authStore.loading" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
          <span class="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
        </div>
      </div>

      <div class="flex flex-col gap-2 min-w-0 w-full sm:w-auto">
        <label
          class="cursor-pointer inline-flex items-center gap-2 justify-center px-4 py-2.5 bg-green-700 text-white text-sm font-medium rounded-xl hover:bg-green-800 transition"
          :class="{ 'opacity-50 pointer-events-none': authStore.loading }"
        >
          <ArrowUpTrayIcon class="w-4 h-4" />
          {{ t('settings.profile.uploadNewPhoto') }}
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
          type="button"
          @click="handleRemove"
          :disabled="authStore.loading"
          class="inline-flex items-center gap-2 justify-center px-4 py-2.5 border border-red-200 dark:border-rose-400/30 text-red-600 dark:text-rose-300 text-sm font-medium rounded-xl hover:bg-red-50 dark:hover:bg-rose-500/10 transition disabled:opacity-50 cursor-pointer"
        >
          <TrashIcon class="w-4 h-4" />
          {{ t('settings.profile.removePhoto') }}
        </button>

        <p class="text-xs text-gray-400 dark:text-slate-500">{{ t('settings.profile.fileHint') }}</p>
      </div>
    </div>

    <transition name="fade">
      <p v-if="errorMessage" class="text-sm text-red-600 dark:text-rose-300 mt-4 bg-red-50 dark:bg-rose-500/10 rounded-lg px-3 py-2">{{ errorMessage }}</p>
    </transition>
    <transition name="fade">
      <p v-if="successMessage" class="text-sm text-green-700 dark:text-emerald-300 mt-4 bg-green-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2">{{ successMessage }}</p>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowUpTrayIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
    localError.value = t('settings.profile.fileTooLarge')
    event.target.value = ''
    return
  }

  const success = await authStore.uploadAvatar(file)
  if (success) successMessage.value = t('settings.profile.avatarUpdated')
  event.target.value = ''
}

async function handleRemove() {
  resetMessages()
  const success = await authStore.removeAvatar()
  if (success) successMessage.value = t('settings.profile.avatarRemoved')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
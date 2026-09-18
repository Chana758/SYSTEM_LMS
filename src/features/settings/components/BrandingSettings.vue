<template>
  <div>
    <div class="flex items-start justify-between mb-1">
      <div>
        <h2 class="text-lg font-bold text-gray-800">{{ t('settings.branding.title') }}</h2>
        <p class="text-sm text-gray-400">{{ t('settings.branding.subtitle') }}</p>
      </div>
    </div>

    <p v-if="authStore.role !== 'admin'" class="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3 mb-2">
      {{ t('settings.branding.readOnlyHint') }}
    </p>

    <form @submit.prevent="handleSave" class="mt-6 space-y-5">
      <div class="flex items-center gap-4">
        <div class="relative w-20 h-20 rounded-full bg-white shadow-md border-2 border-amber-400 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img :src="previewUrl || brandingStore.logoUrl || defaultLogo" alt="Logo preview" class="w-full h-full object-cover rounded-full" />
        </div>

        <div>
          <button
            type="button"
            :disabled="authStore.role !== 'admin'"
            @click="fileInput?.click()"
            class="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {{ t('settings.branding.uploadLogo') }}
          </button>
          <p class="text-xs text-gray-400 mt-1.5">{{ t('settings.branding.fileHint') }}</p>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            :disabled="authStore.role !== 'admin'"
            @change="handleFileChange"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">{{ t('settings.branding.siteName') }}</label>
          <input
            v-model="form.site_name"
            type="text"
            maxlength="50"
            :disabled="authStore.role !== 'admin'"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">{{ t('settings.branding.siteNameAccent') }}</label>
          <input
            v-model="form.site_name_accent"
            type="text"
            maxlength="50"
            :disabled="authStore.role !== 'admin'"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 disabled:bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">{{ t('settings.branding.tagline') }}</label>
        <input
          v-model="form.site_tagline"
          type="text"
          maxlength="80"
          :disabled="authStore.role !== 'admin'"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 disabled:bg-gray-50"
        />
      </div>

      <transition name="fade">
        <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ errorMessage }}</p>
      </transition>
      <transition name="fade">
        <p v-if="successMessage" class="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{{ successMessage }}</p>
      </transition>

      <button
        v-if="authStore.role === 'admin'"
        type="submit"
        :disabled="isSaving"
        class="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition disabled:opacity-50"
      >
        {{ isSaving ? t('settings.branding.saving') : t('settings.branding.saveBranding') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import defaultLogo from '@/assets/images/logoh6.jpg'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const brandingStore = useBrandingStore()

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)

const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  site_name: '',
  site_name_accent: '',
  site_tagline: '',
})

onMounted(() => {
  form.site_name = brandingStore.siteName
  form.site_name_accent = brandingStore.siteNameAccent
  form.site_tagline = brandingStore.siteTagline
})

function handleFileChange(e) {
  if (authStore.role !== 'admin') return

  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = t('settings.branding.fileTooLarge')
    e.target.value = ''
    return
  }

  errorMessage.value = ''
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function handleSave() {
  if (authStore.role !== 'admin') return

  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true

  try {
    const formData = new FormData()
    if (selectedFile.value) formData.append('logo', selectedFile.value)
    formData.append('site_name', form.site_name)
    formData.append('site_name_accent', form.site_name_accent)
    formData.append('site_tagline', form.site_tagline)

    await brandingStore.update(formData)

    selectedFile.value = null
    previewUrl.value = null
    successMessage.value = t('settings.branding.updated')
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    errorMessage.value = e.response?.data?.message || t('settings.branding.updateFailed')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
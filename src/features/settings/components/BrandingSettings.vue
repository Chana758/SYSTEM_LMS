<template>
  <div>
    <div class="mb-1">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ t('settings.branding.title') }}</h2>
      <p class="text-sm text-gray-400 dark:text-slate-400">{{ t('settings.branding.subtitle') }}</p>
    </div>

    <p
      v-if="!isAdmin"
      class="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-transparent dark:border-amber-400/30 rounded-lg px-3 py-2 mt-3 mb-2"
    >
      {{ t('settings.branding.readOnlyHint') }}
    </p>

    <form @submit.prevent="handleSave" class="mt-6 space-y-5">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-md border-2 border-amber-400 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img :src="previewUrl || brandingStore.logoUrl || defaultLogo" alt="Logo preview" class="w-full h-full object-cover rounded-full" />
        </div>

        <div class="min-w-0">
          <button
            type="button"
            :disabled="!isAdmin"
            @click="fileInput?.click()"
            class="px-4 py-2.5 bg-green-700 text-white text-sm font-medium rounded-xl hover:bg-green-800 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
          >
            {{ t('settings.branding.uploadLogo') }}
          </button>
          <p class="text-xs text-gray-400 dark:text-slate-500 mt-1.5">{{ t('settings.branding.fileHint') }}</p>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            :disabled="!isAdmin"
            @change="handleFileChange"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label :class="labelCls">{{ t('settings.branding.siteName') }}</label>
          <input v-model="form.site_name" type="text" maxlength="50" :disabled="!isAdmin" :class="inputCls" />
        </div>
        <div>
          <label :class="labelCls">{{ t('settings.branding.siteNameAccent') }}</label>
          <input v-model="form.site_name_accent" type="text" maxlength="50" :disabled="!isAdmin" :class="inputCls" />
        </div>
      </div>

      <div>
        <label :class="labelCls">{{ t('settings.branding.tagline') }}</label>
        <input v-model="form.site_tagline" type="text" maxlength="80" :disabled="!isAdmin" :class="inputCls" />
      </div>

      <transition name="fade">
        <p v-if="errorMessage" class="text-sm text-red-600 dark:text-rose-300 bg-red-50 dark:bg-rose-500/10 rounded-lg px-3 py-2">{{ errorMessage }}</p>
      </transition>
      <transition name="fade">
        <p v-if="successMessage" class="text-sm text-green-700 dark:text-emerald-300 bg-green-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2">{{ successMessage }}</p>
      </transition>

      <button
        v-if="isAdmin"
        type="submit"
        :disabled="isSaving"
        class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50 cursor-pointer"
      >
        {{ isSaving ? t('settings.branding.saving') : t('settings.branding.saveBranding') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import defaultLogo from '@/assets/images/logoh6.jpg'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const brandingStore = useBrandingStore()

const isAdmin = computed(() => authStore.role === 'admin')

// Light + dark. text-base on phones so iOS Safari does not zoom in on focus.
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1'
const inputCls =
  'w-full border border-gray-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-sm bg-white dark:bg-slate-900/60 text-gray-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark] outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 dark:focus:border-emerald-400 disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-500 dark:disabled:text-slate-400 transition'

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)

const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
let successTimer = null

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

function revokePreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
}

onBeforeUnmount(() => {
  clearTimeout(successTimer)
  revokePreview()
})

function handleFileChange(e) {
  if (!isAdmin.value) return

  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = t('settings.branding.fileTooLarge')
    e.target.value = ''
    return
  }

  errorMessage.value = ''
  selectedFile.value = file
  revokePreview()
  previewUrl.value = URL.createObjectURL(file)
}

async function handleSave() {
  if (!isAdmin.value) return

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
    revokePreview()
    if (fileInput.value) fileInput.value.value = ''
    successMessage.value = t('settings.branding.updated')
    clearTimeout(successTimer)
    successTimer = setTimeout(() => (successMessage.value = ''), 2500)
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
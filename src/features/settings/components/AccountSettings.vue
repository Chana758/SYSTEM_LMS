<template>
  <!-- No outer card: SettingsCard already provides the surface -->
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('settings.account.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-6">{{ t('settings.account.subtitle') }}</p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div v-for="f in fields" :key="f.key">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{{ t(f.label) }}</label>
        <input
          v-model="form[f.key]" :type="f.type" :required="f.required"
          :placeholder="f.placeholder ? t(f.placeholder) : ''"
          :class="inputCls"
        />
        <p v-if="authStore.errors?.[f.key]" class="text-xs text-red-600 dark:text-rose-300 mt-1">{{ authStore.errors[f.key] }}</p>
      </div>

      <transition name="fade">
        <p v-if="successMessage" class="text-sm text-green-700 dark:text-emerald-300 bg-green-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2">{{ successMessage }}</p>
      </transition>

      <button
        type="submit" :disabled="authStore.loading"
        class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50 cursor-pointer"
      >
        {{ authStore.loading ? t('settings.account.saving') : t('settings.account.saveChanges') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const successMessage = ref('')

const form = reactive({ name: '', email: '', phone: '' })

const fields = [
  { key: 'name', type: 'text', label: 'settings.account.fullName', required: true },
  { key: 'email', type: 'email', label: 'settings.account.email', required: true },
  { key: 'phone', type: 'text', label: 'settings.account.phoneNumber', required: false, placeholder: 'settings.account.phonePlaceholder' },
]

// text-base on phones (16px) so iOS Safari does not zoom in on focus
const inputCls =
  'w-full border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-sm bg-white dark:bg-slate-900/60 text-gray-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark] outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 dark:focus:border-emerald-400 transition'

onMounted(() => {
  form.name = authStore.user?.name || ''
  form.email = authStore.user?.email || ''
  form.phone = authStore.user?.phone || ''
})

async function handleSubmit() {
  successMessage.value = ''
  const success = await authStore.updateAccount({ ...form })
  if (success) successMessage.value = t('settings.account.updated')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
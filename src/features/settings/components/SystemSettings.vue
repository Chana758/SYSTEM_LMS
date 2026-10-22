<template>
  <div class="bg-white dark:bg-slate-900/40 rounded-2xl border border-gray-200 dark:border-white/10 p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('settings.security.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-6">{{ t('settings.security.subtitle') }}</p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div v-for="f in fields" :key="f.key">
        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{{ t(f.label) }}</label>
        <div class="relative">
          <input
            v-model="form[f.key]" :type="show[f.show] ? 'text' : 'password'" required :minlength="f.minlength"
            :class="inputCls"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-200 transition cursor-pointer"
            :aria-label="show[f.show] ? t('settings.security.hidePassword', 'Hide password') : t('settings.security.showPassword', 'Show password')"
            :aria-pressed="show[f.show]"
            @click="show[f.show] = !show[f.show]"
          >
            <EyeSlashIcon v-if="show[f.show]" class="w-5 h-5" />
            <EyeIcon v-else class="w-5 h-5" />
          </button>
        </div>

        <!-- strength meter (new password only) -->
        <template v-if="f.key === 'password' && form.password">
          <div class="flex gap-1 mt-2">
            <span v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors" :class="i <= strength ? strengthColor : 'bg-gray-100 dark:bg-slate-700'"></span>
          </div>
          <p class="text-xs mt-1" :class="strengthTextClass">{{ strengthLabel }}</p>
        </template>

        <p v-if="authStore.errors?.[f.key]" class="text-xs text-red-600 dark:text-rose-300 mt-1">{{ authStore.errors[f.key] }}</p>
        <p v-if="f.key === 'password_confirmation' && form.password_confirmation && form.password !== form.password_confirmation" class="text-xs text-red-600 dark:text-rose-300 mt-1">
          {{ t('settings.security.passwordMismatch') }}
        </p>
      </div>

      <transition name="fade">
        <p v-if="successMessage" class="text-sm text-green-700 dark:text-emerald-300 bg-green-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2">{{ successMessage }}</p>
      </transition>

      <button
        type="submit" :disabled="authStore.loading"
        class="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50 cursor-pointer"
      >
        {{ authStore.loading ? t('settings.security.saving') : t('settings.security.updatePassword') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const successMessage = ref('')

const form = reactive({ current_password: '', password: '', password_confirmation: '' })
const show = reactive({ current: false, password: false, confirm: false })

const fields = [
  { key: 'current_password', show: 'current', label: 'settings.security.currentPassword' },
  { key: 'password', show: 'password', label: 'settings.security.newPassword', minlength: 8 },
  { key: 'password_confirmation', show: 'confirm', label: 'settings.security.confirmNewPassword', minlength: 8 },
]

const inputCls =
  'w-full border border-gray-200 dark:border-white/10 rounded-xl pl-3.5 pr-11 py-2.5 text-sm bg-white dark:bg-slate-900/60 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 dark:focus:border-emerald-400 transition'

const strength = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})
const strengthLabel = computed(() => [
  t('settings.security.strengthVeryWeak'),
  t('settings.security.strengthWeak'),
  t('settings.security.strengthFair'),
  t('settings.security.strengthGood'),
  t('settings.security.strengthStrong'),
][strength.value])
const strengthColor = computed(() => ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-600'][strength.value - 1] || 'bg-red-400')
const strengthTextClass = computed(() => (strength.value >= 3 ? 'text-green-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'))

async function handleSubmit() {
  successMessage.value = ''
  authStore.errors = {}

  const success = await authStore.changePassword({ ...form })
  if (success) {
    successMessage.value = t('settings.security.updated')
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
    show.current = false
    show.password = false
    show.confirm = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
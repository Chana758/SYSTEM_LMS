<template>
  <!-- B2.6: after a temporary password, the user must set their own before using the app -->
  <div class="min-h-[100dvh] bg-[#0b5235] md:bg-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
      <div class="flex items-start gap-3">
        <div class="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <ShieldExclamationIcon class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-900">{{ $t('auth.forceChange.title') }}</h1>
          <p class="text-[12px] text-slate-600 leading-relaxed mt-1">{{ $t('auth.forceChange.subtitle') }}</p>
        </div>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <AuthField v-model="form.current_password" :label="$t('auth.forceChange.current')" type="password" autocomplete="current-password" :icon="LockClosedIcon" :error="authStore.errors.current_password" />
        <AuthField v-model="form.password" :label="$t('auth.forceChange.new')" type="password" autocomplete="new-password" :icon="LockClosedIcon" :error="authStore.errors.password || localError" />
        <AuthField v-model="form.password_confirmation" :label="$t('auth.forceChange.confirm')" type="password" autocomplete="new-password" :icon="LockClosedIcon" />

        <p v-if="authStore.errors.general" class="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          {{ authStore.errors.general }}
        </p>

        <button type="submit" :disabled="authStore.loading"
          class="w-full h-12 rounded-xl bg-[#17664b] hover:bg-[#0f5139] text-white text-sm font-bold transition disabled:opacity-60 cursor-pointer">
          {{ $t('auth.forceChange.submit') }}
        </button>
      </form>

      <button type="button" @click="authStore.logout()" class="w-full text-center text-[12px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
        {{ $t('auth.idleLock.logout') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { LockClosedIcon, ShieldExclamationIcon } from '@heroicons/vue/24/outline'
import AuthField from '../components/AuthField.vue'
import { useAuthStore } from '../store/authStore'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const form = reactive({ current_password: '', password: '', password_confirmation: '' })
const localError = ref('')

onMounted(() => {
  authStore.clearErrors()
  if (!authStore.mustChangePassword) router.replace('/')
})

async function submit() {
  localError.value = ''
  if (form.password.length < 8) {
    localError.value = t('auth.validation.passwordMin')
    return
  }
  if (form.password !== form.password_confirmation) {
    localError.value = t('auth.validation.confirmMismatch')
    return
  }

  const ok = await authStore.changePassword({ ...form })
  if (ok) {
    toast.success(t('auth.forceChange.done'))
    router.replace({ name: authStore.isStaff ? 'dashboard' : 'book-list' })
  }
}
</script>

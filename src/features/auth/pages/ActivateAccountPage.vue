<template>
  <!-- B2.2: an imported student activates their own account (student ID + date of birth) -->
  <div class="min-h-[100dvh] bg-[#0b5235] md:bg-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
      <div class="flex items-center gap-3">
        <img :src="brandingStore.logoUrl || defaultLogo" :alt="brandingStore.siteName" class="w-12 h-12 rounded-full object-cover border-2 border-amber-400" />
        <div>
          <h1 class="text-xl font-black text-slate-900">{{ $t('auth.activate.title') }}</h1>
          <p class="text-[12px] font-semibold text-slate-500">{{ brandingStore.siteName }}</p>
        </div>
      </div>

      <template v-if="!done">
        <p class="text-[12px] text-slate-600 leading-relaxed">{{ $t('auth.activate.subtitle') }}</p>

        <form @submit.prevent="submit" class="space-y-4">
          <AuthField v-model="form.student_id" :label="$t('auth.activate.studentId')" autocomplete="username" :icon="IdentificationIcon" :error="errors.student_id" />
          <AuthField v-model="form.date_of_birth" :label="$t('auth.activate.dob')" type="date" :icon="CalendarDaysIcon" :error="errors.date_of_birth" />
          <AuthField v-model="form.password" :label="$t('auth.password')" type="password" autocomplete="new-password" :icon="LockClosedIcon" :error="errors.password" />
          <AuthField v-model="form.password_confirmation" :label="$t('auth.confirmPassword')" type="password" autocomplete="new-password" :icon="LockClosedIcon" :error="errors.password_confirmation" />
          <div class="grid grid-cols-2 gap-3">
            <AuthField v-model="form.pin" :label="$t('auth.activate.pin')" type="password" autocomplete="off" :icon="KeyIcon" :error="errors.pin" />
            <AuthField v-model="form.pin_confirmation" :label="$t('auth.activate.pinConfirm')" type="password" autocomplete="off" :icon="KeyIcon" :error="errors.pin_confirmation" />
          </div>

          <p v-if="errors.general" class="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
            {{ errors.general }}
          </p>

          <button type="submit" :disabled="loading"
            class="w-full h-12 rounded-xl bg-[#17664b] hover:bg-[#0f5139] text-white text-sm font-bold transition disabled:opacity-60 cursor-pointer">
            {{ loading ? $t('auth.activate.submitting') : $t('auth.activate.submit') }}
          </button>
        </form>
      </template>

      <div v-else class="text-center space-y-4 py-4">
        <CheckCircleIcon class="w-14 h-14 text-emerald-600 mx-auto" />
        <h2 class="text-lg font-black text-slate-900">{{ $t('auth.activate.done') }}</h2>
        <p class="text-[12px] text-slate-600">{{ doneMessage }}</p>
        <router-link :to="{ name: 'login' }"
          class="inline-flex w-full h-12 items-center justify-center rounded-xl bg-[#17664b] text-white text-sm font-bold">
          {{ $t('auth.activate.goLogin') }}
        </router-link>
      </div>

      <div v-if="!done" class="text-center">
        <router-link :to="{ name: 'login' }" class="text-[12px] font-bold text-[#17664b] hover:underline">
          {{ $t('auth.activate.back') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { IdentificationIcon, CalendarDaysIcon, LockClosedIcon, KeyIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import AuthField from '../components/AuthField.vue'
import { authService } from '../services/authService'
import { useBrandingStore } from '@/stores/brandingStore'
import defaultLogo from '@/assets/images/logoh6.jpg'

const { t } = useI18n()
const brandingStore = useBrandingStore()

const form = reactive({
  student_id: '', date_of_birth: '', password: '', password_confirmation: '', pin: '', pin_confirmation: '',
})
const errors = ref({})
const loading = ref(false)
const done = ref(false)
const doneMessage = ref('')

function localCheck() {
  const e = {}
  if (!form.student_id.trim()) e.student_id = t('auth.validation.required', 'Required')
  if (!form.date_of_birth) e.date_of_birth = t('auth.validation.required', 'Required')
  if (form.password.length < 8) e.password = t('auth.validation.passwordMin')
  if (form.password !== form.password_confirmation) e.password_confirmation = t('auth.validation.confirmMismatch')
  if (!/^\d{4}$/.test(form.pin)) e.pin = '0000-9999'
  if (form.pin !== form.pin_confirmation) e.pin_confirmation = '≠'
  return e
}

async function submit() {
  errors.value = localCheck()
  if (Object.keys(errors.value).length) return

  loading.value = true
  try {
    const { data } = await authService.activate({ ...form, student_id: form.student_id.trim() })
    doneMessage.value = data.message
    done.value = true
  } catch (error) {
    const res = error.response?.data
    if (error.response?.status === 422 && res?.errors) {
      errors.value = Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v[0]]))
    } else {
      errors.value = { general: res?.message || 'Error' }
    }
  } finally {
    loading.value = false
  }
}
</script>

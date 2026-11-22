<template>
  <!-- B4.16: the 4-digit PIN asked at the self-checkout kiosk -->
  <div class="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ t('members.pin.title') }}</h2>
        <p class="text-sm text-gray-400 dark:text-slate-400">{{ t('members.pin.subtitle') }}</p>
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-black whitespace-nowrap"
        :class="hasPin ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'">
        {{ hasPin ? t('members.pin.set') : t('members.pin.notSet') }}
      </span>
    </div>

    <form class="grid sm:grid-cols-3 gap-3" @submit.prevent="save">
      <label class="block">
        <span class="text-xs font-semibold text-gray-500 dark:text-slate-400">{{ t('members.pin.newPin') }}</span>
        <input v-model="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" pattern="\d{4}" required
          class="mt-1 w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 text-lg tracking-[0.5em] text-gray-900 dark:text-white outline-none focus:border-emerald-600" />
        <span v-if="errors.pin" class="text-xs text-rose-600">{{ errors.pin }}</span>
      </label>
      <label class="block">
        <span class="text-xs font-semibold text-gray-500 dark:text-slate-400">{{ t('members.pin.confirm') }}</span>
        <input v-model="pinConfirm" type="password" inputmode="numeric" maxlength="4" autocomplete="off" pattern="\d{4}" required
          class="mt-1 w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 text-lg tracking-[0.5em] text-gray-900 dark:text-white outline-none focus:border-emerald-600" />
      </label>
      <label class="block">
        <span class="text-xs font-semibold text-gray-500 dark:text-slate-400">{{ t('members.pin.password') }}</span>
        <input v-model="password" type="password" autocomplete="current-password" required
          class="mt-1 w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 text-gray-900 dark:text-white outline-none focus:border-emerald-600" />
        <span v-if="errors.current_password" class="text-xs text-rose-600">{{ errors.current_password }}</span>
      </label>
      <div class="sm:col-span-3 flex justify-end">
        <button type="submit" :disabled="busy" class="px-5 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black disabled:opacity-50 cursor-pointer">
          {{ hasPin ? t('members.pin.change') : t('members.pin.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/axios'
import { useAuthStore } from '@/features/auth/store/authStore'

const { t } = useI18n()
const toast = useToast()
const authStore = useAuthStore()

const pin = ref('')
const pinConfirm = ref('')
const password = ref('')
const busy = ref(false)
const errors = ref({})
const saved = ref(false)
const hasPin = computed(() => saved.value || !!authStore.user?.has_pin)

async function save() {
  errors.value = {}
  if (pin.value !== pinConfirm.value) {
    errors.value = { pin: t('members.pin.mismatch') }
    return
  }
  busy.value = true
  try {
    const { data } = await apiClient.post('/auth/pin', {
      current_password: password.value,
      pin: pin.value,
      pin_confirmation: pinConfirm.value,
    })
    saved.value = true
    if (authStore.user) {
      authStore.user = { ...authStore.user, has_pin: true }
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    pin.value = pinConfirm.value = password.value = ''
    toast.success(data.message)
  } catch (e) {
    const errs = e.response?.data?.errors || {}
    errors.value = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v[0]]))
    if (!Object.keys(errors.value).length) toast.error(e.response?.data?.message || t('common.messages.unexpectedError'))
  } finally {
    busy.value = false
  }
}
</script>

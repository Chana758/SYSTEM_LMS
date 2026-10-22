<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <!-- Main Card Container -->
    <div class="bg-white w-full max-w-6xl min-h-[530px] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

      <!--  LEFT SIDE (Green Background with Curve)  -->
      <div class="bg-[#0b5235] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden rounded-b-[80px] md:rounded-b-none md:rounded-r-[120px] z-10 shadow-[5px_0_20px_rgba(0,0,0,0.1)]">

        <div class="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>

        <div class="flex items-center justify-center md:justify-start z-10">
          <span class="text-[9px] font-extrabold tracking-widest text-emerald-50 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 uppercase">
            {{ $t('auth.systemPortal') }}
          </span>
        </div>

        <div class="my-auto py-8 z-10 flex flex-col items-center text-center space-y-4">
          <div class="w-24 h-24 md:w-30 md:h-30 rounded-full bg-white shadow-xl border-4 border-amber-400 flex items-center justify-center p-1.5 transform hover:scale-105 transition-transform duration-300">
            <img :src="brandingStore.logoUrl || defaultLogo" :alt="brandingStore.siteName" class="w-full h-full object-cover rounded-full" />
          </div>

          <div>
            <h2 class="text-3xl font-black tracking-wider text-white mb-2">{{ $t('auth.resetPasswordTitle') }}</h2>
            <p class="text-[12px] text-emerald-100/90 leading-relaxed max-w-[240px] mx-auto font-medium">
              {{ $t('auth.resetPasswordSubtitle') }}
            </p>
          </div>

          <div class="inline-flex items-center gap-1.5 bg-black/20 border border-white/10 px-4 py-1.5 rounded-full mt-4">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-[10px] font-bold text-white tracking-widest uppercase">{{ brandingStore.siteTagline }}</span>
          </div>
        </div>

        <div class="text-[9px] tracking-wider text-emerald-200/60 font-semibold text-center md:text-left z-10 uppercase">
          {{ $t('auth.secureLibrary') }}
        </div>
      </div>

      <!--  RIGHT SIDE (Form Area)  -->
      <div class="bg-white p-8 md:p-12 flex flex-col justify-center space-y-6 z-0 md:pl-16">

        <!-- Invalid link (no token/email in the URL at all) -->
        <template v-if="!token || !email">
          <div class="text-center py-4">
            <div class="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 class="text-2xl font-black text-slate-900 mb-2">{{ $t('auth.invalidResetLink') }}</h1>
            <p class="text-[12px] text-slate-500 leading-relaxed mb-6">
              {{ $t('auth.invalidResetLinkMessage') }}
            </p>
            <router-link
              :to="{ name: 'forgot-password' }"
              class="block w-full bg-[#17664b] hover:bg-emerald-800 text-white rounded-full py-3.5 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              {{ $t('auth.requestNewLink') }}
            </router-link>
          </div>
        </template>

        <!-- STEP 1: New password form -->
        <template v-else-if="!resetDone">
          <div class="text-center md:text-left">
            <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">{{ $t('auth.setNewPassword') }}</h1>
            <p class="text-[12px] font-semibold text-slate-500">{{ $t('auth.setNewPasswordFor', { email }) }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.newPassword') }}</label>
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                :class="{ 'border-red-500': errors.password }"
              />
              <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.confirmPassword') }}</label>
              <input
                v-model="form.password_confirmation"
                type="password"
                placeholder="••••••••"
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                :class="{ 'border-red-500': errors.password_confirmation }"
              />
              <p v-if="errors.password_confirmation" class="text-red-500 text-sm mt-1">{{ errors.password_confirmation }}</p>
            </div>

            <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2 font-medium disabled:opacity-50"
            >
              {{ authStore.loading ? $t('auth.resetting') : $t('auth.resetPassword') }}
            </button>
          </form>
        </template>

        <!-- STEP 2: Success -->
        <template v-else>
          <div class="text-center py-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 class="text-2xl font-black text-slate-900 mb-2">{{ $t('auth.passwordResetDone') }}</h1>
            <p class="text-[12px] text-slate-500 leading-relaxed mb-6">
              {{ $t('auth.passwordResetDoneMessage') }}
            </p>
            <router-link
              :to="{ name: 'login' }"
              class="block w-full bg-[#17664b] hover:bg-emerald-800 text-white rounded-full py-3.5 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              {{ $t('auth.signIn') }}
            </router-link>
          </div>
        </template>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import { validateResetPasswordForm, hasErrors } from '../validations/authValidation'
import defaultLogo from '@/assets/images/logoh6.jpg'

const route = useRoute()
const authStore = useAuthStore()
const brandingStore = useBrandingStore()

// Laravel's default reset-link shape is:
//   {frontend_url}/reset-password/{token}?email={email}
// i.e. token as a route param, email as a query param. Adjust here if
// your router/notification builds the link differently.
const token = computed(() => route.params.token || route.query.token || '')
const email = computed(() => route.query.email || '')

const form = ref({ password: '', password_confirmation: '' })
const errors = ref({})
const resetDone = ref(false)

async function handleSubmit() {
  errors.value = validateResetPasswordForm(form.value)
  if (hasErrors(errors.value)) return

  const result = await authStore.resetPassword({
    token: token.value,
    email: email.value,
    password: form.value.password,
    password_confirmation: form.value.password_confirmation,
  })

  if (result.success) {
    resetDone.value = true
  } else {
    errors.value = authStore.errors
  }
}
</script>
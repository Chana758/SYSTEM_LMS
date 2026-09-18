<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <!-- Main Card Container -->
    <div class="bg-white w-full max-w-6xl min-h-[530px] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

      <!-- ================= LEFT SIDE (Green Background with Curve) ================= -->
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
            <h2 class="text-3xl font-black tracking-wider text-white mb-2">{{ $t('auth.forgotPasswordTitle') }}</h2>
            <p class="text-[12px] text-emerald-100/90 leading-relaxed max-w-[240px] mx-auto font-medium">
              {{ $t('auth.forgotPasswordSubtitle') }}
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

      <!-- ================= RIGHT SIDE (Form Area) ================= -->
      <div class="bg-white p-8 md:p-12 flex flex-col justify-center space-y-6 z-0 md:pl-16">

        <!-- STEP 1: Email form -->
        <template v-if="!emailSent">
          <div class="text-center md:text-left">
            <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">{{ $t('auth.forgotPasswordHeading') }}</h1>
            <p class="text-[12px] font-semibold text-slate-500">{{ $t('auth.forgotPasswordInstructions') }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.email') }}</label>
              <input
                v-model="email"
                type="email"
                placeholder="you@example.com"
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                :class="{ 'border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
            </div>

            <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2 font-medium disabled:opacity-50"
            >
              {{ authStore.loading ? $t('auth.sending') : $t('auth.sendResetLink') }}
            </button>
          </form>

          <div class="text-center pt-2">
            <router-link :to="{ name: 'login' }" class="text-[12px] font-semibold text-[#17664b] hover:underline">
              {{ $t('auth.backToSignIn') }}
            </router-link>
          </div>
        </template>

        <!-- STEP 2: Confirmation -->
        <template v-else>
          <div class="text-center py-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 class="text-2xl font-black text-slate-900 mb-2">{{ $t('auth.checkYourEmail') }}</h1>
            <p class="text-[12px] text-slate-500 leading-relaxed mb-6">
              {{ $t('auth.resetLinkSentMessage', { email }) }}
            </p>

            <router-link
              :to="{ name: 'login' }"
              class="block w-full bg-[#17664b] hover:bg-emerald-800 text-white rounded-full py-3.5 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              {{ $t('auth.backToSignIn') }}
            </router-link>
          </div>
        </template>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import { validateForgotPasswordForm, hasErrors } from '../validations/authValidation'
import defaultLogo from '@/assets/images/logoh6.jpg'

const authStore = useAuthStore()
const brandingStore = useBrandingStore()

const email = ref('')
const emailSent = ref(false)
const errors = ref({})

async function handleSubmit() {
  errors.value = validateForgotPasswordForm({ email: email.value })
  if (hasErrors(errors.value)) return

  const result = await authStore.forgotPassword(email.value)
  if (result.success) {
    emailSent.value = true
  } else {
    errors.value = authStore.errors
  }
}
</script>
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
            <h2 class="text-3xl font-black tracking-wider text-white mb-2">{{ $t('auth.welcomeBack') }}</h2>
            <p class="text-[12px] text-emerald-100/90 leading-relaxed max-w-[240px] mx-auto font-medium">
              {{ $t('auth.welcomeSubtitle') }}
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

      <!-- ================= RIGHT SIDE (White Form Area) ================= -->
      <div class="bg-white p-8 md:p-12 flex flex-col justify-center space-y-6 z-0 md:pl-16">

        <div class="text-center md:text-left">
          <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">{{ $t('auth.loginTitle') }}</h1>
          <p class="text-[12px] font-semibold text-slate-500">{{ $t('auth.loginSubtitle') }}</p>
        </div>

        <!-- Tab Toggle: Password / Scan QR (Use Phone removed — Scan QR covers it) -->
        <div class="flex gap-1 bg-slate-100/80 rounded-full p-1.5 border border-slate-200 shadow-inner">
          <button
            type="button"
            @click="switchMode('password')"
            class="flex-1 text-[11px] font-bold py-2.5 rounded-full transition-all duration-300 cursor-pointer"
            :class="mode === 'password' ? 'bg-[#17664b] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'"
          >
            {{ $t('auth.tabPassword') }}
          </button>
          <button
            type="button"
            @click="switchMode('qr')"
            class="flex-1 text-[11px] font-bold py-2.5 rounded-full transition-all duration-300 cursor-pointer"
            :class="mode === 'qr' ? 'bg-[#17664b] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'"
          >
            {{ $t('auth.tabQrScan') }}
          </button>
        </div>

        <!-- Dynamic Form Container -->
        <div class="transition-all duration-300 min-h-[180px]">
          <LoginForm
            v-if="mode === 'password'"
            :loading="authStore.loading"
            :errors="authStore.errors"
            @submit="handleLogin"
          />
          <QrLoginForm
            v-else
            :loading="authStore.loading"
            :errors="authStore.errors"
            @submit="handleQrLogin"
          />
        </div>

        <!-- Register Link -->
        <div class="text-center pt-2">
          <p class="text-[12px] font-semibold text-slate-500">
            {{ $t('auth.noAccount') }}
            <router-link :to="{ name: 'register' }" class="text-[#17664b] font-bold hover:underline ml-1">
              {{ $t('auth.register') }}
            </router-link>
          </p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import QrLoginForm from '../components/QrLoginForm.vue'
import { useAuthStore } from '../store/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import defaultLogo from '@/assets/images/logoh6.jpg'

const router = useRouter()
const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const mode = ref('password')

function switchMode(newMode) {
  if (mode.value === newMode) return
  mode.value = newMode
  authStore.clearErrors()
}

function redirectAfterLogin() {
  const isStaff = ['admin', 'librarian'].includes(authStore.role)
  router.push({ name: isStaff ? 'dashboard' : 'book-list' })
}

async function handleLogin(formData) {
  const success = await authStore.login(formData)
  if (success) redirectAfterLogin()
}

async function handleQrLogin(qrToken) {
  const success = await authStore.loginWithQr(qrToken)
  if (success) redirectAfterLogin()
}
</script>
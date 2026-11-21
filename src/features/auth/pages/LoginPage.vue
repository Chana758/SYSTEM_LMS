<template>
  <!--
    Login is shared by admin / librarian / member, so the page can't know the role yet.
    - md and up : the original split card (unchanged)
    - phone     : app-style full screen (green hero + white bottom sheet)
  -->
  <div class="min-h-[100dvh] bg-[#0b5235] md:bg-slate-900 md:flex md:items-center md:justify-center md:p-4">

    <!-- Phone only: keeps the status-bar area green, even when the page scrolls -->
    <div
      class="md:hidden fixed top-0 inset-x-0 z-30 bg-[#0b5235]"
      style="height: env(safe-area-inset-top, 0px);"
    ></div>

    <!-- Main container -->
    <div class="w-full min-h-[100dvh] flex flex-col
                md:max-w-6xl md:min-h-[530px] md:grid md:grid-cols-2
                md:bg-white md:rounded-3xl md:shadow-2xl md:overflow-hidden">

      <!-- LEFT SIDE / PHONE HERO (green) -->
      <div
        class="bg-[#0b5235] text-white relative overflow-hidden z-10 flex flex-col justify-between
               px-6 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-12
               md:p-12 md:rounded-r-[120px] md:shadow-[5px_0_20px_rgba(0,0,0,0.1)]"
      >
        <div class="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>

        <div class="flex items-center justify-center md:justify-start z-10">
          <span class="text-[9px] font-extrabold tracking-widest text-emerald-50 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 uppercase">
            {{ $t('auth.systemPortal') }}
          </span>
        </div>

        <div class="my-auto py-4 md:py-8 z-10 flex flex-col items-center text-center space-y-3 md:space-y-4">
          <div class="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 rounded-full bg-white shadow-xl border-4 border-amber-400 flex items-center justify-center p-1.5 transform hover:scale-105 transition-transform duration-300">
            <img :src="brandingStore.logoUrl || defaultLogo" :alt="brandingStore.siteName" class="w-full h-full object-cover rounded-full" />
          </div>

          <div>
            <h2 class="text-2xl md:text-3xl font-black tracking-wider text-white mb-1.5 md:mb-2">{{ $t('auth.welcomeBack') }}</h2>
            <p class="text-[12px] text-emerald-100/90 leading-relaxed max-w-[240px] mx-auto font-medium">
              {{ $t('auth.welcomeSubtitle') }}
            </p>
          </div>

          <div class="inline-flex items-center gap-1.5 bg-black/20 border border-white/10 px-4 py-1.5 rounded-full mt-2 md:mt-4">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-[10px] font-bold text-white tracking-widest uppercase">{{ brandingStore.siteTagline }}</span>
          </div>
        </div>

        <!-- Footer note: desktop only (saves space on phones) -->
        <div class="hidden md:block text-[9px] tracking-wider text-emerald-200/60 font-semibold text-left z-10 uppercase">
          {{ $t('auth.secureLibrary') }}
        </div>
      </div>

      <!-- RIGHT SIDE / PHONE BOTTOM SHEET  -->
      <div
        class="relative z-20 flex-1 bg-white flex flex-col justify-start space-y-5
               -mt-6 rounded-t-[28px] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]
               px-5 pt-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]
               md:z-0 md:justify-center md:space-y-6 md:mt-0 md:rounded-none md:shadow-none md:p-12 md:pl-16"
      >

        <div class="text-left">
          <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">{{ $t('auth.loginTitle') }}</h1>
          <p class="text-[12px] font-semibold text-slate-500">{{ $t('auth.loginSubtitle') }}</p>
        </div>

        <LoginForm
          :loading="authStore.loading"
          :errors="authStore.errors"
          @submit="handleLogin"
        />

        <!-- Forgot Password Link -->
        <div class="text-right -mt-2 md:-mt-3">
          <router-link
            :to="{ name: 'forgot-password' }"
            class="inline-block py-1 text-[12px] font-bold text-[#17664b] hover:underline"
          >
            {{ $t('auth.forgotPassword') }}
          </router-link>
        </div>

        <!-- B2.2: imported students activate their own account -->
        <div v-if="authConfig.activation_enabled" class="text-center -mt-1">
          <router-link
            :to="{ name: 'activate-account' }"
            class="inline-block py-1 text-[12px] font-bold text-[#17664b] hover:underline"
          >
            {{ $t('auth.activateLink') }}
          </router-link>
        </div>

        <!-- Register Link (hidden when online registration is turned off, B3.1) -->
        <div v-if="authConfig.registration_enabled" class="text-center pt-1 md:pt-2">
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
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { authService } from '../services/authService'
import LoginForm from '../components/LoginForm.vue'
import { useAuthStore } from '../store/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import defaultLogo from '@/assets/images/logoh6.jpg'

const router = useRouter()
const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const toast = useToast()

// Defaults keep the links visible if /auth/config can't be reached
const authConfig = reactive({ registration_enabled: true, activation_enabled: true })

onMounted(async () => {
  try {
    const { data } = await authService.config()
    Object.assign(authConfig, data)
  } catch {
    // keep defaults
  }
})

function redirectAfterLogin() {
  // B2.6: a temporary password must be changed first
  if (authStore.mustChangePassword) {
    router.push({ name: 'force-change-password' })
    return
  }

  // A1/A3: pending approval or expired membership (can still browse)
  if (authStore.accountNotice) {
    toast.warning(authStore.accountNotice.message, { timeout: 8000 })
  }

  router.push({ name: authStore.isStaff ? 'dashboard' : 'book-list' })
}

async function handleLogin(formData) {
  const success = await authStore.login(formData)
  if (success) redirectAfterLogin()
}
</script>
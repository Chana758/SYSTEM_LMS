<template>
  <!--
    Register is member-only, so on phones it is a full web-app screen:
    compact green hero + white bottom sheet. md and up keeps the original split card.
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

      <!-- LEFT SIDE / PHONE HERO (green)  -->
      <div
        class="bg-[#0b5235] text-white relative overflow-hidden z-10 flex flex-col justify-between
               px-6 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-10
               md:p-12 md:rounded-r-[120px] md:shadow-[5px_0_20px_rgba(0,0,0,0.1)]"
      >
        <!-- Decorative subtle background circle -->
        <div class="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>

        <!-- Top Badge -->
        <div class="flex items-center justify-center md:justify-start z-10">
          <span class="text-[9px] font-extrabold tracking-widest text-emerald-50 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 uppercase">
            {{ $t('auth.memberPortal') }}
          </span>
        </div>

        <!-- Center Content (Logo & Text) -->
        <div class="my-auto py-3 md:py-8 z-10 flex flex-col items-center text-center space-y-2.5 md:space-y-4">
          <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white shadow-xl border-4 border-amber-400 flex items-center justify-center p-1.5 transform hover:scale-105 transition-transform duration-300">
            <img :src="brandingStore.logoUrl || defaultLogo" :alt="brandingStore.siteName" class="w-full h-full object-cover rounded-full" />
          </div>

          <div>
            <h2 class="text-xl md:text-3xl font-black tracking-wider text-white md:mb-2">{{ $t('auth.joinLibraryLms') }}</h2>
            <!-- Subtitle + tagline hidden on phones so the form gets the space -->
            <p class="hidden md:block text-[12px] text-emerald-100/90 leading-relaxed max-w-[240px] mx-auto font-medium">
              {{ $t('auth.joinSubtitle') }}
            </p>
          </div>

          <div class="hidden md:inline-flex items-center gap-1.5 bg-black/20 border border-white/10 px-4 py-1.5 rounded-full mt-4">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-[10px] font-bold text-white tracking-widest uppercase">{{ brandingStore.siteTagline }}</span>
          </div>
        </div>

        <!-- Footer Note: desktop only -->
        <div class="hidden md:block text-[9px] tracking-wider text-emerald-200/60 font-semibold text-left z-10 uppercase">
          {{ $t('auth.secureLibrary') }}
        </div>
      </div>

      <!--  RIGHT SIDE / PHONE BOTTOM SHEET  -->
      <div
        class="relative z-20 flex-1 bg-white flex flex-col justify-start space-y-5
               -mt-6 rounded-t-[28px] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]
               px-5 pt-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]
               md:z-0 md:justify-center md:space-y-6 md:mt-0 md:rounded-none md:shadow-none md:p-12 md:pl-16"
      >

        <!-- STEP 1: Registration form -->
        <template v-if="!registered">
          <div class="text-left">
            <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">{{ $t('auth.createAccount') }}</h1>
            <p class="text-[12px] font-semibold text-slate-500">{{ $t('auth.fillYourInfo') }}</p>
          </div>

          <RegisterForm
            :loading="authStore.loading"
            :errors="authStore.errors"
            @submit="handleRegister"
          />

          <div class="text-center pt-1 md:pt-2">
            <p class="text-[12px] font-semibold text-slate-500">
              {{ $t('auth.haveAccount') }}
              <router-link :to="{ name: 'login' }" class="text-[#17664b] font-bold hover:underline ml-1">{{ $t('auth.signIn') }}</router-link>
            </p>
          </div>
        </template>

        <!-- STEP 2: Pending approval -->
        <template v-else>
          <div class="text-center py-4">
            <div class="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 class="text-2xl font-black text-slate-900 mb-2">{{ $t('auth.registrationReceived') }}</h1>
            <p class="text-[12px] text-slate-500 leading-relaxed mb-6" v-html="$t('auth.registrationMessage')"></p>

            <button @click="finishAndEnter"
              class="w-full h-12 bg-[#17664b] hover:bg-emerald-800 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer">
              {{ $t('auth.continueToApp') }}
            </button>
          </div>
        </template>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import RegisterForm from '../components/RegisterForm.vue'
import { useAuthStore } from '../store/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import defaultLogo from '@/assets/images/logoh6.jpg'

const router = useRouter()
const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const registered = ref(false)

async function handleRegister(formData) {
  const success = await authStore.register(formData)
  if (success) registered.value = true
}

function finishAndEnter() {
  router.push({ name: 'book-list' })
}
</script>
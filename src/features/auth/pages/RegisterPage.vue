<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <!-- Main Card Container -->
    <div class="bg-white w-full max-w-6xl min-h-[530px] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
      
      <!-- ================= LEFT SIDE (Green Background with Curve) ================= -->
      <div class="bg-[#0b5235] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden rounded-b-[80px] md:rounded-b-none md:rounded-r-[120px] z-10 shadow-[5px_0_20px_rgba(0,0,0,0.1)]">
        
        <!-- Decorative subtle background circle -->
        <div class="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>

        <!-- Top Badge -->
        <div class="flex items-center justify-center md:justify-start z-10">
          <span class="text-[9px] font-extrabold tracking-widest text-emerald-50 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 uppercase">
            {{ $t('auth.memberPortal') }}
          </span>
        </div>

        <!-- Center Content (Logo & Text) -->
        <div class="my-auto py-8 z-10 flex flex-col items-center text-center space-y-4">
          <!-- Logo -->
          <div class="w-24 h-24 md:w-30 md:h-30 rounded-full bg-white shadow-xl border-4 border-amber-400 flex items-center justify-center p-1.5 transform hover:scale-105 transition-transform duration-300">
            <!-- CHANGED: dynamic logo -->
            <img :src="brandingStore.logoUrl || defaultLogo" :alt="brandingStore.siteName" class="w-full h-full object-cover rounded-full" />
          </div>
          
          <div>
            <h2 class="text-3xl font-black tracking-wider text-white mb-2">{{ $t('auth.joinLibraryLms') }}</h2>
            <p class="text-[12px] text-emerald-100/90 leading-relaxed max-w-[240px] mx-auto font-medium">
              {{ $t('auth.joinSubtitle') }}
            </p>
          </div>

          <div class="inline-flex items-center gap-1.5 bg-black/20 border border-white/10 px-4 py-1.5 rounded-full mt-4">
             <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
             <!-- CHANGED: dynamic tagline -->
             <span class="text-[10px] font-bold text-white tracking-widest uppercase">{{ brandingStore.siteTagline }}</span>
          </div>
        </div>

        <!-- Footer Note -->
        <div class="text-[9px] tracking-wider text-emerald-200/60 font-semibold text-center md:text-left z-10 uppercase">
          {{ $t('auth.secureLibrary') }}
        </div>
      </div>

      <!-- ================= RIGHT SIDE (Form Area) ================= -->
      <div class="bg-white p-8 md:p-12 flex flex-col justify-center space-y-6 z-0 md:pl-16">
        
        <!-- STEP 1: Registration form -->
        <template v-if="!registered">
          <div class="text-center md:text-left">
            <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">{{ $t('auth.createAccount') }}</h1>
            <p class="text-[12px] font-semibold text-slate-500">{{ $t('auth.fillYourInfo') }}</p>
          </div>

          <RegisterForm
            :loading="authStore.loading"
            :errors="authStore.errors"
            @submit="handleRegister"
          />

          <div class="text-center pt-2">
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
              class="w-full bg-[#17664b] hover:bg-emerald-800 text-white rounded-full py-3.5 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer">
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
import { useBrandingStore } from '@/stores/brandingStore' // NEW
import defaultLogo from '@/assets/images/logoh6.jpg' // NEW

const router = useRouter()
const authStore = useAuthStore()
const brandingStore = useBrandingStore() // NEW
const registered = ref(false)

async function handleRegister(formData) {
  const success = await authStore.register(formData)
  if (success) registered.value = true
}

function finishAndEnter() {
  router.push({ name: 'book-list' })
}
</script>
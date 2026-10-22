<template>
  <div class="max-w-2xl pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

      <!-- Header Banner ជាមួយ Back Button -->
      <div class="flex items-center gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-slate-200 dark:border-white/10">
        <router-link
          to="/reservations"
          class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-2 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm transition-colors shadow-2xs shrink-0"
          :title="$t('reservation.createPage.back')"
        >
          ←
        </router-link>

        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('reservation.createPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ $t('reservation.createPage.subtitle') }}</p>
        </div>
      </div>

      <!-- Form Container -->
      <div class="space-y-4">
        <ReservationForm :loading="store.saving" :errors="store.errors" @submit="handleSubmit" />

        <p v-if="successMessage" class="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl px-4 py-3 text-xs font-extrabold inline-flex items-center gap-2 shadow-2xs">
          <span class="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] flex-shrink-0">✓</span> {{ successMessage }}
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationStore } from '../store/reservationStore'
import ReservationForm from '../components/ReservationForm.vue'

const router = useRouter()
const store = useReservationStore()
const successMessage = ref('')

async function handleSubmit(payload) {
  successMessage.value = ''
  const result = await store.createReservation(payload)
  if (result.success) {
    successMessage.value = result.message
    setTimeout(() => router.push({ name: 'reservation-list' }), 900)
  }
}
</script>
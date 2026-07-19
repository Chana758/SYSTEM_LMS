<template>
  <div>
    <router-link to="/reservations" class="text-gray-400 hover:text-gray-600 text-sm inline-flex items-center gap-1 mb-6">
      ← Reservations
    </router-link>

    <div class="max-w-lg">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight mb-1">New Reservation</h1>
      <p class="text-sm text-gray-400 mb-5">Hold a book for a member until it's back on the shelf.</p>

      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <ReservationForm :loading="store.loading" :errors="store.errors" @submit="handleSubmit" />
        <p v-if="successMessage" class="text-emerald-600 text-sm mt-4 inline-flex items-center gap-1.5">
          <span>✓</span> {{ successMessage }}
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
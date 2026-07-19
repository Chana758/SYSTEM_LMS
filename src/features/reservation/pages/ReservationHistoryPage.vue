<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight mb-1">Reservation History</h1>
    <p class="text-sm text-gray-400 mb-6">Every book you've reserved, past and present.</p>

    <div v-if="store.loading" class="text-center py-16 text-gray-400 text-sm">Loading…</div>

    <div v-else-if="!store.myReservations.length" class="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
      <div class="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-2xl mb-3">🗂️</div>
      <p class="text-gray-700 font-semibold">No history yet</p>
      <p class="text-sm text-gray-400 mt-1">Reservations you make will show up here.</p>
    </div>

    <div v-else class="space-y-3">
      <ReservationCard
        v-for="r in store.myReservations" :key="r.id"
        :reservation="r"
        @cancel="handleCancel"
      />
    </div>

    <div class="flex justify-center gap-2 mt-8" v-if="store.myPagination.last_page > 1">
      <button
        v-for="p in store.myPagination.last_page" :key="p"
        @click="store.fetchMyReservations(p)"
        class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
        :class="p === store.myPagination.current_page ? 'bg-green-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200'"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useReservationStore } from '../store/reservationStore'
import ReservationCard from '../components/ReservationCard.vue'

const store = useReservationStore()

async function handleCancel(id) {
  if (!confirm('Cancel this reservation?')) return
  const result = await store.cancelReservation(id)
  if (!result.success) alert(result.message)
}

onMounted(() => store.fetchMyReservations())
</script>
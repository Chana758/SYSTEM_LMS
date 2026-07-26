<template>
  <div class="space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-6 md:p-8 space-y-6">
      
      <!-- Header Banner -->
      <div class="pb-6 border-b border-slate-200">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Reservation History</h1>
        <p class="text-xs font-bold text-slate-500 mt-0.5">Every book you've reserved, past and present.</p>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="bg-white rounded-2xl border-2 border-slate-300 p-14 text-center text-slate-400 text-sm font-semibold shadow-2xs">
        Loading…
      </div>

      <!-- Empty State -->
      <div v-else-if="!store.myReservations.length" class="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 shadow-2xs">
        <div class="w-14 h-14 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center text-2xl mb-3 shadow-2xs">
          🗂️
        </div>
        <p class="text-slate-900 font-extrabold text-sm">No history yet</p>
        <p class="text-xs text-slate-500 font-bold mt-1 text-center">Reservations you make will show up here.</p>
      </div>

      <!-- Reservations List Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReservationCard
          v-for="r in store.myReservations" :key="r.id"
          :reservation="r"
          @cancel="handleCancel"
        />
      </div>

      <!-- Pagination -->
      <div class="flex justify-center gap-2 pt-2" v-if="store.myPagination.last_page > 1">
        <button
          v-for="p in store.myPagination.last_page" :key="p"
          @click="store.fetchMyReservations(p)"
          class="w-8 h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          :class="p === store.myPagination.current_page ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'"
        >
          {{ p }}
        </button>
      </div>

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
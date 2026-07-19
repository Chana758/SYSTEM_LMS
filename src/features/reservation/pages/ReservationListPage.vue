<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Reservations</h1>
      <router-link
        to="/reservations/create"
        class="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
      >
        + New Reservation
      </router-link>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <CalendarDaysIcon class="w-[18px] h-[18px] text-gray-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ store.pagination.total || 0 }}</p>
          <p class="text-xs text-gray-500">Total holds</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <ClockIcon class="w-[18px] h-[18px] text-amber-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ pendingCount }}</p>
          <p class="text-xs text-gray-500">In queue</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <CheckCircleIcon class="w-[18px] h-[18px] text-blue-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ readyCount }}</p>
          <p class="text-xs text-gray-500">Ready for pickup</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
          <ExclamationTriangleIcon class="w-[18px] h-[18px] text-rose-500" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ expiredCount }}</p>
          <p class="text-xs text-gray-500">Expired</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
      <ReservationFilter v-model="store.filters" @change="handleFilterChange" />
    </div>

    <ReservationTable
      :reservations="store.reservations"
      :loading="store.loading"
      @row-click="goDetail"
      @fulfill="handleFulfill"
      @cancel="handleCancel"
    />

    <div class="flex justify-center gap-2 mt-8" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page" :key="p"
        @click="store.fetchReservations(p)"
        class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
        :class="p === store.pagination.current_page ? 'bg-green-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200'"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CalendarDaysIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useReservationStore } from '../store/reservationStore'
import ReservationFilter from '../components/ReservationFilter.vue'
import ReservationTable from '../components/ReservationTable.vue'

const router = useRouter()
const store = useReservationStore()

const pendingCount = computed(() => store.reservations.filter((r) => r.status === 'pending').length)
const readyCount = computed(() => store.reservations.filter((r) => r.status === 'ready').length)
const expiredCount = computed(() => store.reservations.filter((r) => r.status === 'expired').length)

let searchTimeout = null
function handleFilterChange() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => store.fetchReservations(1), 350)
}

function goDetail(id) {
  router.push({ name: 'reservation-detail', params: { id } })
}

async function handleFulfill(id) {
  const result = await store.fulfillReservation(id)
  if (!result.success) alert(result.message)
}

async function handleCancel(id) {
  if (!confirm('Cancel this reservation?')) return
  const result = await store.cancelReservation(id)
  if (!result.success) alert(result.message)
}

onMounted(() => store.fetchReservations())
</script>
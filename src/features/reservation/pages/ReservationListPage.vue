<template>
  <div class="space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white rounded-3xl border border-slate-300 shadow-sm p-6 md:p-8 space-y-6">
      
      <!-- Header Banner -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <CalendarDaysIcon class="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Reservations</h1>
            <p class="text-xs font-semibold text-slate-500 mt-0.5">Manage book holds, queue priorities, and pickups.</p>
          </div>
        </div>
        <router-link
          to="/reservations/create"
          class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <span class="text-base leading-none">+</span>
          <span>New Reservation</span>
        </router-link>
      </div>

      <!-- Stat Cards Grid (Modern Gradient Themes) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        
        <!-- Total Holds (Slate Theme) -->
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border border-slate-600 shadow-md p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <CalendarDaysIcon class="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest bg-slate-600/60 px-2.5 py-1 rounded-full border border-slate-500/40">Total</span>
          </div>
          <div>
            <p class="text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-bold text-slate-200 tracking-wide">Total holds</p>
          </div>
        </div>

        <!-- In Queue (Amber Theme) -->
        <div class="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl border border-amber-500 shadow-md p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <ClockIcon class="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest bg-amber-500/50 px-2.5 py-1 rounded-full border border-amber-400/40">Queue</span>
          </div>
          <div>
            <p class="text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ pendingCount }}</p>
            <p class="text-[11px] font-bold text-amber-100 tracking-wide">In queue</p>
          </div>
        </div>

        <!-- Ready for Pickup (Blue Theme) -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl border border-blue-500 shadow-md p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <CheckCircleIcon class="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest bg-blue-500/50 px-2.5 py-1 rounded-full border border-blue-400/40">Pickup</span>
          </div>
          <div>
            <p class="text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ readyCount }}</p>
            <p class="text-[11px] font-bold text-blue-100 tracking-wide">Ready for pickup</p>
          </div>
        </div>

        <!-- Expired (Rose Theme) -->
        <div class="bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl border border-rose-500 shadow-md p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <ExclamationTriangleIcon class="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest bg-rose-500/50 px-2.5 py-1 rounded-full border border-rose-400/40">Alert</span>
          </div>
          <div>
            <p class="text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ expiredCount }}</p>
            <p class="text-[11px] font-bold text-rose-100 tracking-wide">Expired</p>
          </div>
        </div>

      </div>

      <!-- Toolbar / Filter Bar -->
      <div class="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
        <ReservationFilter v-model="store.filters" @change="handleFilterChange" />
      </div>

      <!-- Table Component Container -->
      <div class="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-sm">
        <ReservationTable
          :reservations="store.reservations"
          :loading="store.loading"
          @row-click="goDetail"
          @fulfill="handleFulfill"
          @cancel="handleCancel"
        />
      </div>

      <!-- Pagination -->
      <div class="flex justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
        <button
          v-for="p in store.pagination.last_page" :key="p"
          @click="store.fetchReservations(p)"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          :class="p === store.pagination.current_page ? 'bg-emerald-700 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
        >
          {{ p }}
        </button>
      </div>

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
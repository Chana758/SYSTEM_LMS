<template>
  <div class="space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-6">
      
      <!-- Header Banner -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <CalendarDaysIcon class="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Reservations</h1>
            <p class="text-xs font-bold text-slate-500 mt-1">Manage book holds, queue priorities, and pickups.</p>
          </div>
        </div>
        <router-link
          to="/reservations/create"
          class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-colors"
        >
          + New Reservation
        </router-link>
      </div>

      <!-- Stat Cards Grid (With stronger borders & matching background/input styling) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Holds -->
        <div class="bg-slate-50/80 border-2 border-slate-300 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div class="flex items-center justify-between w-full mb-3">
            <div class="w-11 h-11 rounded-xl bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <CalendarDaysIcon class="w-5 h-5 text-slate-700" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-600">Total</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mt-1.5">Total holds</p>
          </div>
        </div>

        <!-- In Queue -->
        <div class="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div class="flex items-center justify-between w-full mb-3">
            <div class="w-11 h-11 rounded-xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ClockIcon class="w-5 h-5 text-amber-700" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-amber-700">Queue</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none">{{ pendingCount }}</p>
            <p class="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider mt-1.5">In queue</p>
          </div>
        </div>

        <!-- Ready for Pickup -->
        <div class="bg-blue-50/70 border-2 border-blue-300 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div class="flex items-center justify-between w-full mb-3">
            <div class="w-11 h-11 rounded-xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <CheckCircleIcon class="w-5 h-5 text-blue-700" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-blue-700">Pickup</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none">{{ readyCount }}</p>
            <p class="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mt-1.5">Ready for pickup</p>
          </div>
        </div>

        <!-- Expired -->
        <div class="bg-rose-50/70 border-2 border-rose-300 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div class="flex items-center justify-between w-full mb-3">
            <div class="w-11 h-11 rounded-xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ExclamationTriangleIcon class="w-5 h-5 text-rose-600" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-rose-700">Alert</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none">{{ expiredCount }}</p>
            <p class="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider mt-1.5">Expired</p>
          </div>
        </div>

      </div>

      <!-- Toolbar / Filter Bar (Updated border-2 and slate-300 to match prominent styling) -->
      <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-300 p-4 shadow-2xs">
        <ReservationFilter v-model="store.filters" @change="handleFilterChange" />
      </div>

      <!-- Table Component Container (Updated border-2 and slate-300 to match prominent styling) -->
      <div class="border-2 border-slate-300 rounded-2xl overflow-hidden bg-white shadow-2xs">
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
          class="w-8 h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          :class="p === store.pagination.current_page ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'"
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
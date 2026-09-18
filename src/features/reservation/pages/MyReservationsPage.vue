<template>
  <div class="space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-6 md:p-8 space-y-6">
      
      <!-- Header Banner -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <BookmarkIcon class="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('reservation.myReservations.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 mt-1">{{ $t('reservation.myReservations.subtitle') }}</p>
          </div>
        </div>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-colors"
        >
          + {{ $t('reservation.myReservations.reserveABook') }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="bg-white rounded-2xl border-2 border-slate-300 p-14 text-center text-slate-400 text-sm font-semibold shadow-2xs">
        {{ $t('reservation.myReservations.loading') }}
      </div>

      <!-- Empty state & Onboarding Steps -->
      <div v-else-if="!store.myReservations.length" class="space-y-6">
        <!-- How it works (Bold & structured) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-300 p-5 shadow-2xs space-y-2">
            <div class="w-10 h-10 rounded-xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-2xs">
              <span class="text-xs font-black text-amber-700">1</span>
            </div>
            <p class="text-xs font-extrabold text-slate-900">{{ $t('reservation.myReservations.step1Title') }}</p>
            <p class="text-[11px] font-bold text-slate-500 leading-relaxed">{{ $t('reservation.myReservations.step1Desc') }}</p>
          </div>

          <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-300 p-5 shadow-2xs space-y-2">
            <div class="w-10 h-10 rounded-xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center shadow-2xs">
              <span class="text-xs font-black text-blue-700">2</span>
            </div>
            <p class="text-xs font-extrabold text-slate-900">{{ $t('reservation.myReservations.step2Title') }}</p>
            <p class="text-[11px] font-bold text-slate-500 leading-relaxed">{{ $t('reservation.myReservations.step2Desc') }}</p>
          </div>

          <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-300 p-5 shadow-2xs space-y-2">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shadow-2xs">
              <span class="text-xs font-black text-emerald-700">3</span>
            </div>
            <p class="text-xs font-extrabold text-slate-900">{{ $t('reservation.myReservations.step3Title') }}</p>
            <p class="text-[11px] font-bold text-slate-500 leading-relaxed">{{ $t('reservation.myReservations.step3Desc') }}</p>
          </div>
        </div>

        <!-- Empty Box Display -->
        <div class="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 shadow-2xs">
          <div class="relative w-14 h-14 mb-4">
            <div class="absolute inset-0 rounded-2xl bg-emerald-100 border-2 border-emerald-200"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <BookOpenIcon class="w-6 h-6 text-emerald-700" />
            </div>
          </div>
          <p class="text-slate-900 font-extrabold text-sm">{{ $t('reservation.myReservations.emptyShelf') }}</p>
          <p class="text-xs text-slate-500 font-bold mt-1 mb-4 text-center max-w-xs">
            {{ $t('reservation.myReservations.emptyShelfHint') }}
          </p>
          <button
            @click="showCreateModal = true"
            class="text-xs font-black text-emerald-700 hover:text-emerald-800 hover:underline uppercase tracking-wider"
          >
            {{ $t('reservation.myReservations.browseAndReserve') }}
          </button>
        </div>
      </div>

      <!-- Reservations List -->
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

    <!-- Create Modal -->
    <ReservationCreateModal
      v-if="showCreateModal"
      @created="handleCreated"
      @cancel="showCreateModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { BookOpenIcon, BookmarkIcon } from '@heroicons/vue/24/outline'
import { useReservationStore } from '../store/reservationStore'
import ReservationCard from '../components/ReservationCard.vue'
import ReservationCreateModal from '../components/ReservationCreateModal.vue'

const store = useReservationStore()
const showCreateModal = ref(false)
const { t } = useI18n()

async function handleCancel(id) {
  if (!confirm(t('reservation.confirmCancel'))) return
  const result = await store.cancelReservation(id)
  if (!result.success) alert(result.message)
}

function handleCreated() {
  showCreateModal.value = false
  store.fetchMyReservations()
}

onMounted(() => store.fetchMyReservations())
</script>
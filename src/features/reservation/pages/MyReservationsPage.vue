<template>
  <div class="space-y-6 pb-12">
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8 space-y-6">

      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 gap-4">
        <div class="flex items-center gap-4 sm:gap-5 min-w-0">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <BookmarkIcon class="w-6 h-6 sm:w-7 sm:h-7 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('reservation.myReservations.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{{ $t('reservation.myReservations.subtitle') }}</p>
          </div>
        </div>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          + {{ $t('reservation.myReservations.reserveABook') }}
        </button>
      </div>

      <!-- Tabs: Active / History -->
      <div class="inline-flex rounded-xl border-2 border-slate-300 dark:border-white/15 overflow-hidden">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          @click="scope = tab.key"
          class="px-4 py-2 text-xs font-extrabold transition-colors cursor-pointer"
          :class="scope === tab.key
            ? 'bg-emerald-600 text-white'
            : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="rounded-2xl border-2 border-slate-300 dark:border-white/10 p-14 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold shadow-2xs">
        {{ $t('reservation.myReservations.loading') }}
      </div>

      <!-- Empty -->
      <div v-else-if="!store.myReservations.length" class="space-y-6">
        <!-- Onboarding steps (active tab only) -->
        <div v-if="scope === 'active'" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="s in steps" :key="s.n" :class="stepCard">
            <div class="w-10 h-10 rounded-xl border-2 flex items-center justify-center shadow-2xs" :class="s.box">
              <span class="text-xs font-black" :class="s.text">{{ s.n }}</span>
            </div>
            <p class="text-xs font-extrabold text-slate-900 dark:text-white">{{ $t(`reservation.myReservations.step${s.n}Title`) }}</p>
            <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{{ $t(`reservation.myReservations.step${s.n}Desc`) }}</p>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center py-12 sm:py-16 px-6 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl bg-slate-50/50 dark:bg-white/5 shadow-2xs">
          <div class="relative w-14 h-14 mb-4">
            <div class="absolute inset-0 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-200 dark:border-emerald-400/25"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <BookOpenIcon class="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
            </div>
          </div>
          <p class="text-slate-900 dark:text-white font-extrabold text-sm">
            {{ scope === 'active' ? $t('reservation.myReservations.emptyShelf') : $t('reservation.myReservations.emptyHistory') }}
          </p>
          <template v-if="scope === 'active'">
            <p class="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 mb-4 text-center max-w-xs">
              {{ $t('reservation.myReservations.emptyShelfHint') }}
            </p>
            <button
              @click="showCreateModal = true"
              class="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline uppercase tracking-wider cursor-pointer"
            >
              {{ $t('reservation.myReservations.browseAndReserve') }}
            </button>
          </template>
        </div>
      </div>

      <!-- List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReservationCard
          v-for="r in store.myReservations"
          :key="r.id"
          :reservation="r"
          @cancel="handleCancel"
        />
      </div>

      <!-- Pagination -->
      <div v-if="store.myPagination.last_page > 1" class="flex flex-wrap justify-center gap-2 pt-2">
        <button
          v-for="p in store.myPagination.last_page"
          :key="p"
          @click="load(p)"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          :class="p === store.myPagination.current_page
            ? 'bg-emerald-600 text-white'
            : 'bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-white/5'"
        >{{ p }}</button>
      </div>
    </div>

    <ReservationCreateModal
      v-if="showCreateModal"
      @created="handleCreated"
      @cancel="showCreateModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { BookOpenIcon, BookmarkIcon } from '@heroicons/vue/24/outline'
import { useReservationStore } from '../store/reservationStore'
import ReservationCard from '../components/ReservationCard.vue'
import ReservationCreateModal from '../components/ReservationCreateModal.vue'

const store = useReservationStore()
const toast = useToast()
const { t } = useI18n()

const showCreateModal = ref(false)
const scope = ref('active')

const tabs = computed(() => [
  { key: 'active', label: t('reservation.myReservations.tabActive') },
  { key: 'history', label: t('reservation.myReservations.tabHistory') },
])

const stepCard = 'bg-slate-50/70 dark:bg-white/5 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-5 shadow-2xs space-y-2'
const steps = [
  { n: 1, box: 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-400/30', text: 'text-amber-700 dark:text-amber-300' },
  { n: 2, box: 'bg-blue-100 dark:bg-sky-500/20 border-blue-300 dark:border-sky-400/30', text: 'text-blue-700 dark:text-sky-300' },
  { n: 3, box: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-400/30', text: 'text-emerald-700 dark:text-emerald-300' },
]

function load(page = 1) {
  return store.fetchMyReservations(page, scope.value)
}

async function handleCancel(id) {
  if (!confirm(t('reservation.confirmCancel'))) return
  const result = await store.cancelReservation(id)
  result.success ? toast.success(result.message) : toast.error(result.message)
  await load(store.myPagination.current_page) // the cancelled item moves to "History"
}

function handleCreated() {
  showCreateModal.value = false
  scope.value = 'active'
  load(1)
}

watch(scope, () => load(1))
onMounted(() => load(1))
</script>
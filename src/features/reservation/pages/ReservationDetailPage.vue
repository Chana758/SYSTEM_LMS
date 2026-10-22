<template>
  <!-- Bottom padding keeps the last card clear of the member bottom nav on phones (64px + safe area) -->
  <div v-if="store.currentReservation" class="space-y-5 sm:space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-slate-200 dark:border-white/10">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <router-link
          :to="backTo"
          class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-2 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm transition-colors shadow-2xs shrink-0"
          :title="$t('reservation.createPage.back')"
        >←</router-link>
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('reservation.detailPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ $t('reservation.detailPage.subtitle') }}</p>
        </div>
      </div>
      <ReservationStatusBadge :status="r.status" class="flex-shrink-0" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">

      <!-- Details -->
      <div class="md:col-span-2 space-y-5 sm:space-y-6">
        <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 pl-6 sm:p-6 sm:pl-8 md:p-8 relative overflow-hidden shadow-md">
          <span class="absolute left-0 top-0 bottom-0 w-2" :class="spineClass(r.status)"></span>

          <div class="flex gap-4 sm:gap-5 items-start">
            <div class="w-20 h-28 sm:w-24 sm:h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700/40 border-2 border-slate-200 dark:border-white/10 flex-shrink-0 shadow-2xs">
              <img v-if="r.book?.cover_image" :src="coverUrl(r.book.cover_image)" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-3xl text-slate-400 dark:text-slate-500">📖</div>
            </div>
            <div class="space-y-1 min-w-0">
              <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight break-words">{{ r.book?.title }}</h2>
              <p class="text-xs font-extrabold text-slate-600 dark:text-slate-300">{{ r.book?.author }}</p>
              <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ r.book?.category?.name }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:gap-5 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t-2 border-slate-100 dark:border-white/10 text-sm">
            <div :class="metaBox">
              <p :class="metaLabel">{{ $t('reservation.member') }}</p>
              <p class="text-slate-900 dark:text-white font-extrabold break-words">{{ r.member?.user?.name }}</p>
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 break-words">{{ r.member?.membership_no }}</p>
            </div>
            <div :class="metaBox + ' flex flex-col justify-between'">
              <p :class="metaLabel">{{ $t('reservation.detailPage.queuePriority') }}</p>
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white dark:bg-slate-900/60 border-2 border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-black text-xs shadow-2xs">
                {{ r.priority_order }}
              </span>
            </div>
            <div :class="metaBox">
              <p :class="metaLabel">{{ $t('reservation.detailPage.reservedDate') }}</p>
              <p class="text-slate-900 dark:text-white font-extrabold text-xs mt-1">{{ formatDate(r.reserved_date) }}</p>
            </div>
            <div :class="metaBox">
              <p :class="metaLabel">{{ $t('reservation.detailPage.expiresOn') }}</p>
              <p class="text-slate-900 dark:text-white font-extrabold text-xs mt-1">{{ formatDate(r.expire_date) }}</p>
            </div>
          </div>
        </div>

        <!-- Timeline (audit trail) -->
        <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-md">
          <h3 class="font-black text-slate-900 dark:text-white text-sm tracking-tight mb-4">{{ $t('reservation.detailPage.timeline') }}</h3>
          <ol class="relative border-l-2 border-slate-200 dark:border-white/10 ml-2 space-y-5">
            <li v-for="item in timeline" :key="item.key" class="pl-5 relative">
              <span class="absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-800" :class="item.dot"></span>
              <p class="text-xs font-extrabold text-slate-900 dark:text-white">{{ item.label }}</p>
              <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400">{{ formatDateTime(item.at) }}</p>
            </li>
          </ol>
        </div>
      </div>

      <!-- Actions (member: cancel own · staff: fulfill + cancel) -->
      <div v-if="canFulfill || canCancel" class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 h-fit space-y-4 shadow-md">
        <h3 class="font-black text-slate-900 dark:text-white text-sm tracking-tight">{{ $t('reservation.detailPage.actionsTitle') }}</h3>

        <button
          v-if="canFulfill"
          @click="handleFulfill"
          :disabled="actionLoading"
          class="w-full bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white py-3 sm:py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
        >{{ $t('reservation.detailPage.markFulfilled') }}</button>

        <button
          v-if="canCancel"
          @click="handleCancel"
          :disabled="actionLoading"
          class="w-full border-2 border-rose-200 dark:border-rose-400/30 bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 py-3 sm:py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
        >{{ $t('reservation.detailPage.cancelReservation') }}</button>
      </div>
    </div>
  </div>

  <div v-else class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-10 sm:p-16 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold shadow-2xs">
    {{ $t('reservation.detailPage.loading') }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useReservationStore } from '../store/reservationStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { coverUrl } from '@/utils/coverUrl'
import ReservationStatusBadge from '../components/ReservationStatusBadge.vue'

const route = useRoute()
const store = useReservationStore()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const r = computed(() => store.currentReservation)
const isStaff = computed(() => ['admin', 'librarian'].includes(authStore.role))
const isActive = computed(() => ['pending', 'ready'].includes(r.value?.status))
const canFulfill = computed(() => isStaff.value && r.value?.status === 'ready')
const canCancel = computed(() => isActive.value)
const backTo = computed(() => (isStaff.value ? '/reservations' : '/my-reservations'))

const actionLoading = ref(false)

const metaBox = 'bg-slate-50/70 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 sm:p-4 shadow-2xs'
const metaLabel = 'text-slate-400 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1'

const timeline = computed(() => {
  if (!r.value) return []
  const v = r.value
  return [
    { key: 'reserved',  at: v.created_at || v.reserved_date, dot: 'bg-slate-400',   label: t('reservation.detailPage.timelineReserved') },
    { key: 'ready',     at: v.ready_at,                      dot: 'bg-blue-500',    label: t('reservation.detailPage.timelineReady') },
    { key: 'fulfilled', at: v.fulfilled_at,                  dot: 'bg-emerald-500', label: t('reservation.detailPage.timelineFulfilled') },
    { key: 'cancelled', at: v.cancelled_at,                  dot: 'bg-slate-500',   label: t('reservation.detailPage.timelineCancelled') },
    { key: 'expired',   at: v.expired_at,                    dot: 'bg-rose-500',    label: t('reservation.detailPage.timelineExpired') },
  ]
    .filter((i) => i.at)
    .sort((a, b) => new Date(a.at) - new Date(b.at))
})

function spineClass(status) {
  return {
    pending: 'bg-amber-400',
    ready: 'bg-blue-500 dark:bg-sky-400',
    fulfilled: 'bg-emerald-500',
    cancelled: 'bg-slate-300 dark:bg-slate-600',
    expired: 'bg-rose-400',
  }[status] || 'bg-slate-300 dark:bg-slate-600'
}

async function run(action) {
  actionLoading.value = true
  const result = await action(route.params.id)
  actionLoading.value = false
  result.success ? toast.success(result.message) : toast.error(result.message)
  if (result.success) store.fetchReservation(route.params.id, true) // silent: refresh timeline without a "Loading…" flash
}

const handleFulfill = () => run(store.fulfillReservation)

function handleCancel() {
  if (!confirm(t('reservation.confirmCancel'))) return
  run(store.cancelReservation)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

onMounted(() => store.fetchReservation(route.params.id))
</script>
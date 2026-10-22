<template>
  <div class="group relative flex gap-3 sm:gap-4 bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 pl-5 pr-3 sm:pr-4 py-4 overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-black/30 shadow-2xs">
    <!-- Status Spine -->
    <span class="absolute left-0 top-0 bottom-0 w-2" :class="spineClass(reservation.status)"></span>

    <!-- Cover Image -->
    <div class="w-14 h-20 sm:w-16 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700/40 border-2 border-slate-200 dark:border-white/10 flex-shrink-0 shadow-2xs">
      <img v-if="reservation.book?.cover_image" :src="coverUrl(reservation.book.cover_image)" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-2xl text-slate-400 dark:text-slate-500">📖</div>
    </div>

    <!-- Info Section -->
    <div class="flex-1 min-w-0 flex flex-col">
      <div class="flex items-start justify-between gap-2 sm:gap-3">
        <div class="min-w-0">
          <p class="font-black text-slate-900 dark:text-white truncate text-sm tracking-tight">{{ reservation.book?.title }}</p>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ reservation.book?.author }}</p>
        </div>
        <ReservationStatusBadge :status="reservation.status" class="flex-shrink-0" />
      </div>

      <!-- Dates Metadata -->
      <div class="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
        <span class="inline-flex items-center gap-1.5">
          <span class="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">{{ $t('reservation.card.reserved') }}</span> {{ formatDate(reservation.reserved_date) }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">{{ $t('reservation.card.expires') }}</span> {{ formatDate(reservation.expire_date) }}
        </span>
      </div>

      <!-- Status-Specific Messages -->
      <p v-if="reservation.status === 'pending'" class="text-xs font-extrabold text-amber-700 dark:text-amber-300 mt-2.5 inline-flex items-center gap-2 bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/20 rounded-xl px-2.5 py-1 w-fit max-w-full shadow-2xs">
        <span class="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-400/30 font-black text-[10px] text-amber-800 dark:text-amber-200 flex-shrink-0">
          {{ reservation.priority_order }}
        </span>
        {{ $t('reservation.card.queuePosition') }}
      </p>
      <p v-else-if="reservation.status === 'ready'" class="text-xs font-extrabold text-blue-700 dark:text-sky-300 mt-2.5 bg-blue-50/80 dark:bg-sky-500/10 border border-blue-200 dark:border-sky-400/20 rounded-xl px-2.5 py-1 w-fit max-w-full shadow-2xs">
        {{ $t('reservation.card.readyMsg', { date: formatDate(reservation.expire_date) }) }}
      </p>

      <div class="flex-1"></div>

      <!-- Cancel Action Button -->
      <button
        v-if="['pending', 'ready'].includes(reservation.status)"
        @click="$emit('cancel', reservation.id)"
        class="mt-2.5 py-1.5 self-start text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
      >
        {{ $t('reservation.card.cancelReservation') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import ReservationStatusBadge from './ReservationStatusBadge.vue'
import { coverUrl } from '@/utils/coverUrl'
defineProps({ reservation: { type: Object, required: true } })
defineEmits(['cancel'])

// Spine colours are solid bars, so they only need small tweaks in dark mode.
function spineClass(status) {
  return {
    pending: 'bg-amber-400',
    ready: 'bg-blue-500 dark:bg-sky-400',
    fulfilled: 'bg-emerald-500',
    cancelled: 'bg-slate-300 dark:bg-slate-600',
    expired: 'bg-rose-400',
  }[status] || 'bg-slate-300 dark:bg-slate-600'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
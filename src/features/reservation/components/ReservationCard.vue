<template>
  <div class="group relative flex gap-4 bg-white rounded-2xl border-2 border-slate-300 pl-5 pr-4 py-4 overflow-hidden transition-shadow hover:shadow-md shadow-2xs">
    <!-- Status Spine -->
    <span class="absolute left-0 top-0 bottom-0 w-2" :class="spineClass(reservation.status)"></span>

    <!-- Cover Image -->
    <div class="w-16 h-24 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0 shadow-2xs">
      <img v-if="reservation.book?.cover_image" :src="coverUrl(reservation.book.cover_image)" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-2xl text-slate-400">📖</div>
    </div>

    <!-- Info Section -->
    <div class="flex-1 min-w-0 flex flex-col">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-black text-slate-900 truncate text-sm tracking-tight">{{ reservation.book?.title }}</p>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ reservation.book?.author }}</p>
        </div>
        <ReservationStatusBadge :status="reservation.status" />
      </div>

      <!-- Dates Metadata -->
      <div class="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 text-xs font-bold text-slate-600">
        <span class="inline-flex items-center gap-1.5">
          <span class="text-slate-400 uppercase tracking-widest text-[10px]">Reserved</span> {{ formatDate(reservation.reserved_date) }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="text-slate-400 uppercase tracking-widest text-[10px]">Expires</span> {{ formatDate(reservation.expire_date) }}
        </span>
      </div>

      <!-- Status-Specific Messages -->
      <p v-if="reservation.status === 'pending'" class="text-xs font-extrabold text-amber-700 mt-2.5 inline-flex items-center gap-2 bg-amber-50/80 border border-amber-200 rounded-xl px-2.5 py-1 w-fit shadow-2xs">
        <span class="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-amber-100 border border-amber-300 font-black text-[10px] text-amber-800">
          {{ reservation.priority_order }}
        </span>
        in queue for this title
      </p>
      <p v-else-if="reservation.status === 'ready'" class="text-xs font-extrabold text-blue-700 mt-2.5 bg-blue-50/80 border border-blue-200 rounded-xl px-2.5 py-1 w-fit shadow-2xs">
        Ready for pickup — collect before {{ formatDate(reservation.expire_date) }}
      </p>

      <div class="flex-1"></div>

      <!-- Cancel Action Button -->
      <button
        v-if="['pending', 'ready'].includes(reservation.status)"
        @click="$emit('cancel', reservation.id)"
        class="mt-2.5 self-start text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1"
      >
        Cancel reservation
      </button>
    </div>
  </div>
</template>

<script setup>
import ReservationStatusBadge from './ReservationStatusBadge.vue'

defineProps({ reservation: { type: Object, required: true } })
defineEmits(['cancel'])

function spineClass(status) {
  return {
    pending: 'bg-amber-400',
    ready: 'bg-blue-500',
    fulfilled: 'bg-emerald-500',
    cancelled: 'bg-slate-300',
    expired: 'bg-rose-400',
  }[status] || 'bg-slate-300'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function coverUrl(path) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}
</script>
<template>
  <div class="group relative flex gap-4 bg-white rounded-2xl border border-gray-200 pl-5 pr-4 py-4 overflow-hidden transition-shadow hover:shadow-md">
    <!-- status spine -->
    <span class="absolute left-0 top-0 bottom-0 w-1.5" :class="spineClass(reservation.status)"></span>

    <div class="w-16 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
      <img v-if="reservation.book?.cover_image" :src="coverUrl(reservation.book.cover_image)" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-2xl text-gray-300">📖</div>
    </div>

    <div class="flex-1 min-w-0 flex flex-col">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-serif font-semibold text-gray-900 truncate text-[15px]">{{ reservation.book?.title }}</p>
          <p class="text-xs text-gray-400">{{ reservation.book?.author }}</p>
        </div>
        <ReservationStatusBadge :status="reservation.status" />
      </div>

      <div class="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 text-xs text-gray-500">
        <span class="inline-flex items-center gap-1">
          <span class="text-gray-400">Reserved</span> {{ formatDate(reservation.reserved_date) }}
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="text-gray-400">Expires</span> {{ formatDate(reservation.expire_date) }}
        </span>
      </div>

      <p v-if="reservation.status === 'pending'" class="text-xs text-amber-700 mt-2 inline-flex items-center gap-1.5">
        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 font-serif font-bold text-[10px] text-amber-700">
          {{ reservation.priority_order }}
        </span>
        in queue for this title
      </p>
      <p v-else-if="reservation.status === 'ready'" class="text-xs text-blue-700 mt-2 font-medium">
        Ready for pickup — collect before {{ formatDate(reservation.expire_date) }}
      </p>

      <div class="flex-1"></div>

      <button
        v-if="['pending', 'ready'].includes(reservation.status)"
        @click="$emit('cancel', reservation.id)"
        class="mt-2 self-start text-xs text-red-500 hover:text-red-600 hover:underline font-medium"
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
    cancelled: 'bg-gray-300',
    expired: 'bg-rose-400',
  }[status] || 'bg-gray-300'
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
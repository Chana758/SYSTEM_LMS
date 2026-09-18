<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-wide">
        <tr>
          <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.member') }}</th>
          <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.book') }}</th>
          <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.reserved') }}</th>
          <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.expires') }}</th>
          <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.priority') }}</th>
          <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.status') }}</th>
          <th class="text-right px-4 py-3 font-semibold">{{ $t('reservation.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading State -->
        <tr v-if="loading">
          <td colspan="7" class="text-center py-12 text-gray-400 text-sm">{{ $t('reservation.loadingReservations') }}</td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="!reservations.length">
          <td colspan="7" class="py-14">
            <div class="flex flex-col items-center gap-1.5">
              <span class="text-2xl">🗂️</span>
              <p class="text-gray-500 text-sm font-medium">{{ $t('reservation.noReservationsFound') }}</p>
              <p class="text-gray-400 text-xs">{{ $t('reservation.adjustSearchOrStatus') }}</p>
            </div>
          </td>
        </tr>

        <!-- Data Rows -->
        <tr
          v-for="r in reservations" :key="r.id"
          class="border-t border-gray-100 hover:bg-green-50/40 cursor-pointer transition-colors group"
          @click="$emit('rowClick', r.id)"
        >
          <!-- Member Column with Solid Green Avatar -->
          <td class="px-4 py-3.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {{ getInitials(r.member?.user?.name) }}
              </div>
              <div>
                <p class="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">{{ r.member?.user?.name || '—' }}</p>
                <p class="text-xs text-gray-400">{{ r.member?.membership_no || '' }}</p>
              </div>
            </div>
          </td>

          <!-- Book Title -->
          <td class="px-4 py-3.5">
            <p class="font-serif text-gray-700 line-clamp-1 font-semibold">{{ r.book?.title || '—' }}</p>
          </td>

          <!-- Reserved Date -->
          <td class="px-4 py-3.5 text-gray-500 text-xs">{{ formatDate(r.reserved_date) }}</td>

          <!-- Expires Date -->
          <td class="px-4 py-3.5 text-gray-500 text-xs">{{ formatDate(r.expire_date) }}</td>

          <!-- Priority -->
          <td class="px-4 py-3.5">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-[11px] font-serif font-bold">
              {{ r.priority_order || 1 }}
            </span>
          </td>

          <!-- Status Badge -->
          <td class="px-4 py-3.5">
            <ReservationStatusBadge :status="r.status" />
          </td>

          <!-- Actions -->
          <td class="px-4 py-3.5 text-right space-x-3" @click.stop>
            <button
              v-if="r.status === 'ready'"
              @click="$emit('fulfill', r.id)"
              class="text-green-700 hover:underline text-xs font-medium cursor-pointer"
            >
              {{ $t('reservation.fulfill') }}
            </button>
            <button
              v-if="['pending', 'ready'].includes(r.status)"
              @click="$emit('cancel', r.id)"
              class="text-red-500 hover:underline text-xs font-medium cursor-pointer"
            >
              {{ $t('reservation.cancel') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import ReservationStatusBadge from './ReservationStatusBadge.vue'

defineProps({
  reservations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['rowClick', 'fulfill', 'cancel'])

function getInitials(name) {
  if (!name) return 'M'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
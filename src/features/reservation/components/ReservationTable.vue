<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-wide">
        <tr>
          <th class="text-left px-4 py-3 font-semibold">Member</th>
          <th class="text-left px-4 py-3 font-semibold">Book</th>
          <th class="text-left px-4 py-3 font-semibold">Reserved</th>
          <th class="text-left px-4 py-3 font-semibold">Expires</th>
          <th class="text-left px-4 py-3 font-semibold">Priority</th>
          <th class="text-left px-4 py-3 font-semibold">Status</th>
          <th class="text-right px-4 py-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="7" class="text-center py-12 text-gray-400 text-sm">Loading reservations…</td>
        </tr>
        <tr v-else-if="!reservations.length">
          <td colspan="7" class="py-14">
            <div class="flex flex-col items-center gap-1.5">
              <span class="text-2xl">🗂️</span>
              <p class="text-gray-500 text-sm font-medium">No reservations found</p>
              <p class="text-gray-400 text-xs">Try adjusting your search or status filter.</p>
            </div>
          </td>
        </tr>
        <tr
          v-for="r in reservations" :key="r.id"
          class="border-t border-gray-100 hover:bg-green-50/40 cursor-pointer transition-colors"
          @click="$emit('rowClick', r.id)"
        >
          <td class="px-4 py-3.5">
            <p class="font-medium text-gray-800">{{ r.member?.user?.name || '—' }}</p>
            <p class="text-xs text-gray-400">{{ r.member?.membership_no }}</p>
          </td>
          <td class="px-4 py-3.5">
            <p class="font-serif text-gray-700 line-clamp-1">{{ r.book?.title }}</p>
          </td>
          <td class="px-4 py-3.5 text-gray-500">{{ formatDate(r.reserved_date) }}</td>
          <td class="px-4 py-3.5 text-gray-500">{{ formatDate(r.expire_date) }}</td>
          <td class="px-4 py-3.5">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-[11px] font-serif font-bold">
              {{ r.priority_order }}
            </span>
          </td>
          <td class="px-4 py-3.5"><ReservationStatusBadge :status="r.status" /></td>
          <td class="px-4 py-3.5 text-right space-x-3" @click.stop>
            <button
              v-if="r.status === 'ready'"
              @click="$emit('fulfill', r.id)"
              class="text-green-700 hover:underline text-xs font-medium"
            >Fulfill</button>
            <button
              v-if="['pending', 'ready'].includes(r.status)"
              @click="$emit('cancel', r.id)"
              class="text-red-500 hover:underline text-xs font-medium"
            >Cancel</button>
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

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
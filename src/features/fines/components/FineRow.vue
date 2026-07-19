<template>
  <tr class="border-t border-gray-100 hover:bg-gray-50 transition">
    <td class="px-4 py-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {{ initials(fine.borrow?.member?.user?.name) }}
        </div>
        <span class="font-medium text-gray-800">{{ fine.borrow?.member?.user?.name || '—' }}</span>
      </div>
    </td>
    <td class="px-4 py-3 text-gray-600">{{ fine.borrow?.book_copy?.book?.title || '—' }}</td>
    <td class="px-4 py-3 font-bold" :class="fine.status === 'unpaid' ? 'text-red-600' : 'text-gray-800'">
      ${{ Number(fine.amount).toFixed(2) }}
    </td>
    <td class="px-4 py-3 capitalize text-gray-500">{{ fine.reason }}</td>
    <td class="px-4 py-3"><FineStatusBadge :status="fine.status" /></td>
    <td class="px-4 py-3 text-right">
      <FineActionMenu :fine="fine" @pay="$emit('pay', fine)" @waive="$emit('waive', fine)" @view="$emit('view', fine)" />
    </td>
  </tr>
</template>

<script setup>
import FineStatusBadge from './FineStatusBadge.vue'
import FineActionMenu from './FineActionMenu.vue'

defineProps({ fine: { type: Object, required: true } })
defineEmits(['pay', 'waive', 'view'])

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
</script>
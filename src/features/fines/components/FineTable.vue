<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
        <tr>
          <th class="text-left px-4 py-3">Member</th>
          <th class="text-left px-4 py-3">Book</th>
          <th class="text-left px-4 py-3">Amount</th>
          <th class="text-left px-4 py-3">Reason</th>
          <th class="text-left px-4 py-3">Status</th>
          <th class="text-right px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="6" class="text-center py-10 text-gray-400">
            <div class="animate-pulse">Loading fines...</div>
          </td>
        </tr>
        <tr v-else-if="!fines.length">
          <td colspan="6" class="text-center py-12">
            <div class="flex flex-col items-center gap-2 text-gray-400">
              <CheckCircleIcon class="w-10 h-10 text-green-200" />
              <p class="text-sm">No fines found — all clear!</p>
            </div>
          </td>
        </tr>
        <FineRow v-for="fine in fines" :key="fine.id" :fine="fine" @pay="$emit('pay', $event)" @waive="$emit('waive', $event)" @view="$emit('view', $event)" />
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import FineRow from './FineRow.vue'

defineProps({ fines: { type: Array, required: true }, loading: { type: Boolean, default: false } })
defineEmits(['pay', 'waive', 'view'])
</script>
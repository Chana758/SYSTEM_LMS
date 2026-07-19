<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="flex justify-between items-start mb-2">
      <div>
        <p class="font-semibold text-gray-800">{{ fine.borrow?.member?.user?.name }}</p>
        <p class="text-xs text-gray-400">{{ fine.borrow?.book_copy?.book?.title }}</p>
      </div>
      <FineStatusBadge :status="fine.status" />
    </div>
    <p class="text-lg font-bold text-gray-800">${{ Number(fine.amount).toFixed(2) }}</p>
    <p class="text-xs text-gray-400 capitalize mt-1">Reason: {{ fine.reason }}</p>
  </div>
</template>

<script setup>
import FineStatusBadge from './FineStatusBadge.vue'
defineProps({ fine: { type: Object, required: true } })
</script>
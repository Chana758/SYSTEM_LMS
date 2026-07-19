<template>
  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" :class="classMap[status] || classMap.default">
    <span class="w-1.5 h-1.5 rounded-full" :class="dotMap[status] || dotMap.default"></span>
    {{ labelMap[status] || status }}
  </span>
</template>

<script setup>
defineProps({ status: { type: String, required: true } })

const classMap = {
  unpaid: 'bg-red-50 text-red-600',
  paid: 'bg-green-50 text-green-700',
  waived: 'bg-gray-100 text-gray-500',
  default: 'bg-gray-100 text-gray-500',
}
const dotMap = {
  unpaid: 'bg-red-500',
  paid: 'bg-green-600',
  waived: 'bg-gray-400',
  default: 'bg-gray-400',
}
const labelMap = { unpaid: 'Unpaid', paid: 'Paid', waived: 'Waived' }
</script>
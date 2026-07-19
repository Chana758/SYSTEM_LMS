<template>
  <div class="rounded-xl border border-gray-100 p-5 shadow-sm" :class="bg">
    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">{{ label }}</p>
    <p class="text-3xl font-black mt-1" :class="color">{{ displayValue }}</p>
    <p v-if="trend !== null" class="text-xs font-bold mt-1" :class="trend >= 0 ? 'text-green-600' : 'text-red-500'">
      {{ trend >= 0 ? '▲' : '▼' }} {{ Math.abs(trend) }}% vs previous period
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  format: { type: String, default: 'number' }, // 'number' | 'currency'
  color: { type: String, default: 'text-gray-800' },
  bg: { type: String, default: 'bg-gray-50' },
  trend: { type: Number, default: null }, // percent, e.g. 12 or -8
})

const displayValue = computed(() => {
  if (props.format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.value || 0)
  }
  return new Intl.NumberFormat('en-US').format(props.value || 0)
})
</script>
<template>
  <div :class="[bg, 'rounded-2xl border-2 border-slate-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md']">
    <div>
      <p class="text-[11px] font-black uppercase tracking-wider text-slate-500">{{ label }}</p>
      <p class="text-2xl md:text-3xl font-black mt-2 tracking-tight" :class="color">{{ displayValue }}</p>
    </div>
    <div v-if="trend !== null" class="mt-3">
      <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg" :class="trend >= 0 ? 'bg-emerald-100/60 text-emerald-700' : 'bg-red-100/60 text-red-600'">
        {{ trend >= 0 ? '▲' : '▼' }} {{ Math.abs(trend) }}% <span class="font-medium text-slate-500 text-[10px]">vs previous</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  format: { type: String, default: 'number' }, // 'number' | 'currency'
  color: { type: String, default: 'text-slate-900' },
  bg: { type: String, default: 'bg-slate-50' },
  trend: { type: Number, default: null }, // percent, e.g. 12 or -8
})

const displayValue = computed(() => {
  if (props.format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.value || 0)
  }
  return new Intl.NumberFormat('en-US').format(props.value || 0)
})
</script>
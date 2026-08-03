<template>
  <div :class="[bg, 'rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg']">
    
    <!-- Top Row: Icon and Badge -->
    <div class="flex items-center justify-between mb-3">
      <div v-if="icon" class="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md text-white shadow-inner">
        <component :is="icon" class="w-5 h-5" />
      </div>
      <div v-if="badge" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white shadow-inner">
        {{ badge }}
      </div>
    </div>

    <!-- Center Content: Value and Label -->
    <div>
      <p class="text-3xl font-black tracking-tight text-white">{{ displayValue }}</p>
      <p class="text-[11px] font-bold uppercase tracking-wider text-white/80 mt-1">{{ label }}</p>
    </div>

    <!-- Optional Trend -->
    <div v-if="trend !== null" class="mt-3">
      <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-white/20 text-white">
        {{ trend >= 0 ? '▲' : '▼' }} {{ Math.abs(trend) }}% <span class="text-[10px] text-white/80">vs previous</span>
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
  bg: { type: String, default: 'bg-blue-600' }, // ពណ៌ផ្ទៃកាត (ឧ. bg-blue-600, bg-emerald-600, bg-orange-500, bg-red-500, bg-purple-600)
  trend: { type: Number, default: null },
  icon: { type: [Object, Function], default: null },
  badge: { type: String, default: null }
})

const displayValue = computed(() => {
  if (props.format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.value || 0)
  }
  return new Intl.NumberFormat('en-US').format(props.value || 0)
})
</script>
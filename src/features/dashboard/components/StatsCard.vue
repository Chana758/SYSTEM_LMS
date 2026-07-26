<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-between items-center transition-all hover:shadow-md hover:border-slate-300">
    <div class="space-y-1">
      <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{{ title }}</p>
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ value }}</h2>
      <slot name="footer"></slot>
    </div>
    <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" :class="iconBgClass || 'bg-emerald-50 text-emerald-600'">
      <component :is="icon" class="w-6 h-6" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: { type: [Object, Function], required: true },
  iconBgClass: { type: String, default: '' },
})
</script>
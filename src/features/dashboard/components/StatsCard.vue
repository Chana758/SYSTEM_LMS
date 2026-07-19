<template>
  <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
    <div>
      <p class="text-[10px] font-bold text-slate-400 uppercase">{{ title }}</p>
      <h2 class="text-xl font-bold text-slate-800">{{ value }}</h2>
    </div>
    <div class="p-3 bg-slate-100 rounded-full text-emerald-600">
      <component :is="icon" class="w-6 h-6" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: { type: [Object, Function], required: true },
})
</script>
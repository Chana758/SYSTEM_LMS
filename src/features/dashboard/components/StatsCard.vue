<template>
  <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
    <div>
      <p class="text-[10px] font-bold text-slate-400 uppercase">{{ title }}</p>
      <h2 class="text-xl font-bold text-slate-800">{{ value }}</h2>
      <p class="text-[10px] text-emerald-500 font-semibold mt-1">0%</p>
    </div>
    <div class="p-3 bg-slate-100 rounded-full text-emerald-600">
      {{ icon }}
    </div>
  </div>
</template>
<script setup>
defineProps(['title', 'value', 'icon'])
</script>
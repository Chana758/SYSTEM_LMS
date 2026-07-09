<template>
  <div class="space-y-6">
    <div class="grid grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.title" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs text-slate-400 uppercase font-bold">{{ stat.title }}</p>
        <h3 class="text-2xl font-bold mt-2 text-slate-800">{{ stat.value }}</h3>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-xl border shadow-sm h-72">
        <h3 class="font-bold text-slate-700">Financial Summary</h3>
      </div>
      <div class="bg-white p-6 rounded-xl border shadow-sm h-72">
        <h3 class="font-bold text-slate-700">Stock Warning</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
const stats = [
  { title: 'Total Sale', value: '$1,090.00' },
  { title: 'Gross Profit', value: '$450.00' },
  { title: 'Expense', value: '$120.00' },
  { title: 'Net Profit', value: '$330.00' }
]
</script>
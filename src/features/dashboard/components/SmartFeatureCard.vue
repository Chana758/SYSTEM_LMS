<template>
  <router-link :to="to" class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-green-300 transition group block">
    <div class="flex items-center gap-3 mb-2">
      <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100">
        <component :is="icon" class="w-5 h-5 text-green-700" />
      </div>
      <h3 class="font-semibold text-gray-800">{{ title }}</h3>
    </div>
    <p class="text-xs text-gray-500">{{ description }}</p>
  </router-link>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  icon: { type: [Object, Function], required: true },
  to: String,
})
</script>
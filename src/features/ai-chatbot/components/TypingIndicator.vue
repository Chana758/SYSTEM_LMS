<template>
  <div class="flex items-end gap-2 justify-start">
    <div class="w-7 h-7 rounded-lg bg-green-800 dark:bg-gradient-to-br dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center flex-shrink-0">
      <CpuChipIcon class="w-4 h-4 text-amber-400 dark:text-white" />
    </div>
    <div class="bg-stone-100 dark:bg-slate-800 dark:border dark:border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm inline-flex items-center gap-1">
      <span
        v-for="i in 3" :key="i"
        class="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-slate-400 animate-bounce"
        :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { CpuChipIcon } from '@heroicons/vue/24/outline'
</script>
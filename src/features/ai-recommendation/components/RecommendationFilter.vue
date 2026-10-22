<template>
  <!-- Phone: one swipeable row. sm and up: wraps like before -->
  <div
    class="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible -mx-1 px-1 pb-1 sm:pb-0
           [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    <button
      @click="select('')"
      class="relative px-4 py-2 sm:py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0"
      :class="modelValue === ''
        ? 'bg-green-800 dark:bg-emerald-600 text-white border-green-800 dark:border-emerald-500'
        : 'bg-white dark:bg-slate-800/50 text-stone-600 dark:text-slate-300 border-stone-200 dark:border-white/15 hover:bg-stone-50 dark:hover:bg-white/10'"
    >
      {{ t('recommendation.allCategories') }}
    </button>
    <button
      v-for="cat in categories" :key="cat"
      @click="select(cat)"
      class="relative px-4 py-2 sm:py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0"
      :class="modelValue === cat
        ? 'bg-green-800 dark:bg-emerald-600 text-white border-green-800 dark:border-emerald-500'
        : 'bg-white dark:bg-slate-800/50 text-stone-600 dark:text-slate-300 border-stone-200 dark:border-white/15 hover:bg-stone-50 dark:hover:bg-white/10'"
    >
      {{ cat }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

function select(cat) {
  emit('update:modelValue', cat)
}
</script>
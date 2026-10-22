<template>
  <!-- Phone: one scrolling row of chips. Desktop (lg): vertical list -->
  <nav
    class="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:pb-0 lg:flex-col lg:overflow-visible lg:gap-1
           lg:rounded-xl lg:bg-white lg:dark:bg-slate-900/60 lg:border lg:border-gray-200 lg:dark:border-white/10 lg:p-2"
  >
    <button
      @click="$emit('select', '')"
      class="flex-shrink-0 lg:w-full text-left px-4 lg:px-3 py-2 rounded-full lg:rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap border lg:border-0"
      :class="!activeId
        ? 'bg-green-700 dark:bg-emerald-600 text-white font-medium border-green-700 dark:border-emerald-500'
        : 'text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 lg:bg-transparent border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'"
    >
      {{ t('digitalLibrary.allCategories') }}
    </button>
    <button
      v-for="c in categories" :key="c.id"
      @click="$emit('select', c.id)"
      class="flex-shrink-0 lg:w-full text-left px-4 lg:px-3 py-2 rounded-full lg:rounded-lg text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer whitespace-nowrap border lg:border-0"
      :class="activeId === c.id
        ? 'bg-green-700 dark:bg-emerald-600 text-white font-medium border-green-700 dark:border-emerald-500'
        : 'text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 lg:bg-transparent border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'"
    >
      <span>{{ c.name }}</span>
      <span
        v-if="c.books_count !== undefined"
        class="text-xs px-1.5 rounded-full flex-shrink-0"
        :class="activeId === c.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-slate-400'"
      >
        {{ c.books_count }}
      </span>
    </button>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  categories: { type: Array, default: () => [] },
  activeId: { type: [Number, String], default: '' },
})
defineEmits(['select'])
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
<template>
  <div class="px-2 sm:px-4 pb-3 flex flex-wrap gap-2 justify-center">
    <button
      v-for="s in suggestions"
      :key="s"
      @click="$emit('pick', s)"
      class="text-xs font-medium rounded-full px-3.5 py-2 sm:py-1.5 border transition-colors cursor-pointer active:scale-95
             text-green-800 bg-green-50 border-green-100 hover:bg-green-100 hover:border-green-200
             dark:text-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-400/25 dark:hover:bg-emerald-500/25 dark:hover:border-emerald-400/40"
    >
      {{ s }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineEmits(['pick'])
const { t } = useI18n()

const suggestions = computed(() => [
  t('chatbot.suggestions.dueDate'),
  t('chatbot.suggestions.fines'),
  t('chatbot.suggestions.cleanCode'),
  t('chatbot.suggestions.hours'),
])
</script>
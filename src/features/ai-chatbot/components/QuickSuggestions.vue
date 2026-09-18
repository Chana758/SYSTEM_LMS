<template>
  <div class="px-4 pb-3 flex flex-wrap gap-2 justify-center">
    <button
      v-for="s in suggestions"
      :key="s"
      @click="$emit('pick', s)"
      class="text-xs font-medium text-green-800 bg-green-50 border border-green-100 rounded-full px-3.5 py-1.5 hover:bg-green-100 hover:border-green-200 transition-colors"
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
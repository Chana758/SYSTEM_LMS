<template>
  <div class="flex items-center justify-end px-5 py-3 border-b border-stone-100 dark:border-white/10">
    <button
      @click="$emit('clear')"
      class="text-xs font-semibold text-stone-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-rose-400 transition-colors px-2 py-1 cursor-pointer"
      :title="t('chatbot.clearChat')"
    >
      {{ t('chatbot.clearChat') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineEmits(['clear'])
const { t } = useI18n()
</script>
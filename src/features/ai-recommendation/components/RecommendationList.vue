<template>
  <div>
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="i" class="aspect-[3/4] rounded-xl bg-stone-100 animate-pulse"></div>
    </div>

    <div v-else-if="!books.length" class="flex flex-col items-center text-center py-16">
      <div class="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
        <SparklesIcon class="w-7 h-7 text-stone-300" />
      </div>
      <p class="text-sm font-medium text-stone-600">{{ t('recommendation.empty.title') }}</p>
      <p class="text-xs text-stone-400 mt-1">{{ t('recommendation.empty.description') }}</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <RecommendationCard
        v-for="book in books" :key="book.id"
        :book="book"
        @click="$emit('bookClick', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import RecommendationCard from './RecommendationCard.vue'

defineProps({
  books: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
defineEmits(['bookClick'])
const { t } = useI18n()
</script>
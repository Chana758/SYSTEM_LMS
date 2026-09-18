<template>
  <div class="flex flex-wrap gap-2 mb-5">
    <button
      @click="select('')"
      class="relative px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors"
      :class="modelValue === ''
        ? 'bg-green-800 text-white border-green-800'
        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'"
    >
      {{ t('recommendation.allCategories') }}
    </button>
    <button
      v-for="cat in categories" :key="cat"
      @click="select(cat)"
      class="relative px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors"
      :class="modelValue === cat
        ? 'bg-green-800 text-white border-green-800'
        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'"
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
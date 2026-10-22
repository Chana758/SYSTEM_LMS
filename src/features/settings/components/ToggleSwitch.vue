<template>
  <div class="flex items-center justify-between gap-4">
    <div>
      <p class="text-sm text-gray-700 dark:text-slate-200 font-medium">{{ label }}</p>
      <p v-if="hint" class="text-xs text-gray-400 dark:text-slate-400">{{ hint }}</p>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label"
      @click="emit('update:modelValue', !modelValue)"
      class="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 ease-in-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
      :class="modelValue ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'"
    >
      <span
        class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      ></span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
</script>
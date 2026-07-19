<template>
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm text-gray-700 font-medium">{{ label }}</p>
      <p v-if="hint" class="text-xs text-gray-400">{{ hint }}</p>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      @click="toggle"
      class="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 ease-in-out"
      :class="modelValue ? 'bg-green-600' : 'bg-gray-300'"
    >
      <span
        class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      ></span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
  emit('change')
}
</script>
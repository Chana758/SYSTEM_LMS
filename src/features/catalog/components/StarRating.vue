<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      :disabled="readonly"
      @click="!readonly && $emit('update:modelValue', i)"
      class="text-lg leading-none"
      :class="[readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition', i <= modelValue ? 'text-amber-400' : 'text-gray-200']"
    >
      ★
    </button>
    <span v-if="showCount && count !== undefined" class="text-xs text-gray-400 ml-1">({{ count }})</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  showCount: { type: Boolean, default: false },
  count: { type: Number, default: undefined },
})
defineEmits(['update:modelValue'])
</script>
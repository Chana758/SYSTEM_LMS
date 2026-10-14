<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center font-bold transition-all px-4 py-2 rounded-xl text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    :class="variantClasses"
  >
    <span v-if="loading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' }, // primary, danger, outline
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
    case 'outline':
      return 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
    default:
      return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
  }
})
</script>
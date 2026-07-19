<template>
  <span
    v-if="count > 0"
    class="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
  >
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup>
defineProps({ count: { type: Number, default: 0 } })
</script>
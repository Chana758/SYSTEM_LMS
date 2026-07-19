<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border"
    :class="classes"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: { type: String, required: true } })

const map = {
  pending:   { label: 'Pending',   classes: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  ready:     { label: 'Ready',     classes: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  fulfilled: { label: 'Fulfilled', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-500 border-gray-200',      dot: 'bg-gray-400' },
  expired:   { label: 'Expired',   classes: 'bg-rose-50 text-rose-600 border-rose-200',       dot: 'bg-rose-500' },
}

const info = computed(() => map[props.status] || map.pending)
const label = computed(() => info.value.label)
const classes = computed(() => info.value.classes)
const dotClass = computed(() => info.value.dot)
</script>
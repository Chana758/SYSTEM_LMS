<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" fill="none" class="overflow-visible">
    <polygon v-if="area" :points="area" fill="currentColor" opacity="0.15" />
    <polyline :points="line" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

// Tiny inline trend line. Colour comes from the parent via `currentColor`.
const props = defineProps({
  values: { type: Array, default: () => [] },
  width: { type: Number, default: 88 },
  height: { type: Number, default: 30 },
})

const pts = computed(() => {
  const v = props.values.map(Number)
  if (v.length < 2) return []
  const max = Math.max(...v)
  const min = Math.min(...v)
  const span = max - min || 1
  const pad = 2
  return v.map((n, i) => {
    const x = (i / (v.length - 1)) * props.width
    const y = max === min ? props.height / 2 : props.height - pad - ((n - min) / span) * (props.height - pad * 2)
    return [x.toFixed(1), y.toFixed(1)]
  })
})

const line = computed(() => pts.value.map((p) => p.join(',')).join(' '))
const area = computed(() => {
  if (!pts.value.length) return ''
  return `0,${props.height} ${line.value} ${props.width},${props.height}`
})
</script>
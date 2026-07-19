<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-black text-gray-700 uppercase tracking-wide">{{ title }}</h3>
      <slot name="actions" />
    </div>
    <div class="relative" :style="{ height: height + 'px' }">
      <canvas ref="canvasRef"></canvas>
      <div v-if="!labels.length" class="absolute inset-0 flex items-center justify-center text-sm text-gray-300 font-bold">
        No data for this range
      </div>
    </div>
  </div>
</template>

<script setup>
// Requires: npm install chart.js
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  title: { type: String, default: 'Trend' },
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  type: { type: String, default: 'line' }, // 'line' | 'bar'
  color: { type: String, default: '#10b981' },
  height: { type: Number, default: 260 },
})

const canvasRef = ref(null)
let chartInstance = null

const buildChart = () => {
  if (chartInstance) chartInstance.destroy()
  if (!canvasRef.value) return

  chartInstance = new Chart(canvasRef.value, {
    type: props.type,
    data: {
      labels: props.labels,
      datasets: [{
        data: props.values,
        borderColor: props.color,
        backgroundColor: props.type === 'bar' ? props.color : `${props.color}22`,
        fill: props.type === 'line',
        tension: 0.35,
        borderRadius: props.type === 'bar' ? 6 : 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      },
    },
  })
}

onMounted(buildChart)
onBeforeUnmount(() => chartInstance?.destroy())
watch(() => [props.labels, props.values], buildChart, { deep: true })
</script>
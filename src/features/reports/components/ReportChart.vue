<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-black text-gray-700 uppercase tracking-wide">{{ title }}</h3>
      <slot name="actions" />
    </div>
    <div class="relative" :style="{ height: height + 'px' }">
      <div ref="chartEl" class="w-full h-full"></div>
      <div v-if="!labels.length" class="absolute inset-0 flex items-center justify-center text-sm text-gray-300 font-bold">
        {{ t('reports.chart.noDataForRange') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import echarts from '@/plugins/echarts'

const { t } = useI18n()

const props = defineProps({
  title: { type: String, default: 'Trend' },
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  type: { type: String, default: 'line' }, // 'line' | 'bar'
  color: { type: String, default: '#10b981' },
  height: { type: Number, default: 260 },
})

const chartEl = ref(null)
let chart = null
let observer = null

const buildOption = () => ({
  grid: { left: 40, right: 16, top: 16, bottom: 28 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: props.labels,
    axisTick: { show: false },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    splitLine: { lineStyle: { color: '#f1f5f9' } },
  },
  series: [
    {
      type: props.type,
      data: props.values,
      smooth: props.type === 'line' ? 0.35 : false,
      showSymbol: false,
      lineStyle: { color: props.color, width: 2 },
      itemStyle: { color: props.color, borderRadius: props.type === 'bar' ? [6, 6, 0, 0] : 0 },
      areaStyle: props.type === 'line' ? { color: `${props.color}22` } : undefined,
    },
  ],
})

const render = () => {
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)
  chart.setOption(buildOption(), true)
}

onMounted(() => {
  render()
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(chartEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
  chart = null
})

watch(() => [props.labels, props.values, props.type, props.color], render, { deep: true })
</script>
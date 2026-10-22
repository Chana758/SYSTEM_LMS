<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-wide">{{ title }}</h3>
      <slot name="actions" />
    </div>
    <div class="relative" :style="{ height: height + 'px' }">
      <div ref="chartEl" class="w-full h-full"></div>
      <div v-if="!labels.length" class="absolute inset-0 flex items-center justify-center text-sm text-gray-300 dark:text-slate-600 font-bold">
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
const isDark = ref(false)
let chart = null
let observer = null
let themeObserver = null

const readTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

const buildOption = () => {
  const textColor = isDark.value ? '#94a3b8' : '#64748b'
  const gridColor = isDark.value ? 'rgba(255,255,255,0.08)' : '#f1f5f9'
  const axisColor = isDark.value ? 'rgba(255,255,255,0.15)' : '#e2e8f0'

  return {
    grid: { left: 40, right: 16, top: 16, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark.value ? '#1e293b' : '#ffffff',
      borderColor: isDark.value ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
      textStyle: { color: isDark.value ? '#e2e8f0' : '#334155' },
    },
    xAxis: {
      type: 'category',
      data: props.labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: { color: textColor },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } },
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
  }
}

const render = () => {
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)
  chart.setOption(buildOption(), true)
}

onMounted(() => {
  readTheme()
  render()
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(chartEl.value)

  // Re-render when the <html class="dark"> toggles
  themeObserver = new MutationObserver(() => {
    readTheme()
    render()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  themeObserver?.disconnect()
  chart?.dispose()
  chart = null
})

watch(() => [props.labels, props.values, props.type, props.color], render, { deep: true })
</script>
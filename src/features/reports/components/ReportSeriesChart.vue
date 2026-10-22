<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none p-5 h-full">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-wide">{{ title }}</h3>
      <slot name="actions" />
    </div>
    <div class="relative" :style="{ height: height + 'px' }">
      <div ref="el" class="w-full h-full"></div>
      <div v-if="empty" class="absolute inset-0 flex items-center justify-center text-sm text-gray-300 dark:text-slate-600 font-bold pointer-events-none">
        {{ t('reports.chart.noDataForRange') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEchart, themeTokens, chartColors } from '../composables/useEchart'

const { t } = useI18n()

// Multi-series line / bar chart. series = [{ name, values, color }]
const props = defineProps({
  title: { type: String, default: '' },
  labels: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
  type: { type: String, default: 'line' }, // 'line' | 'bar'
  stacked: { type: Boolean, default: false },
  height: { type: Number, default: 260 },
})

const empty = computed(() => !props.labels.length || props.series.every((s) => !(s.values || []).some((v) => Number(v) > 0)))

const build = (dark) => {
  const c = themeTokens(dark)
  return {
    grid: { left: 36, right: 12, top: 36, bottom: 28 },
    legend: { top: 0, right: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: c.text } },
    tooltip: {
      trigger: 'axis', backgroundColor: c.tipBg, borderColor: c.tipBorder, textStyle: { color: c.tipText },
    },
    xAxis: {
      type: 'category', data: props.labels, axisTick: { show: false },
      axisLine: { lineStyle: { color: c.axis } }, axisLabel: { color: c.text },
    },
    yAxis: {
      type: 'value', min: 0, minInterval: 1, axisLabel: { color: c.text },
      splitLine: { lineStyle: { color: c.grid } },
    },
    series: props.series.map((s, i) => {
      const color = s.color || chartColors[i % chartColors.length]
      const isLine = props.type === 'line'
      return {
        name: s.name,
        type: props.type,
        data: s.values,
        stack: props.stacked ? 'total' : undefined,
        smooth: isLine ? 0.35 : false,
        showSymbol: false,
        barMaxWidth: 28,
        lineStyle: { color, width: 2 },
        itemStyle: { color, borderRadius: !isLine && !props.stacked ? [6, 6, 0, 0] : 0 },
        areaStyle: isLine ? { color: `${color}1f` } : undefined,
      }
    }),
  }
}

const { el } = useEchart(build, () => [props.labels, props.series, props.type, props.stacked])
</script>
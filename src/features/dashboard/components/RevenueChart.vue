<template>
  <div class="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 h-full flex flex-col">
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
      <div>
        <h3 class="text-base font-black text-slate-900 tracking-tight">{{ $t('dashboard.revenueTrend.title') }}</h3>
        <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ $t('dashboard.revenueTrend.subtitle') }}</p>
      </div>
      <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-500">
        {{ $t('dashboard.revenueTrend.analytics') }}
      </span>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-10">
      <div class="w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <p v-else-if="!hasData" class="flex-1 flex items-center justify-center text-xs font-bold text-slate-400 py-10">
      {{ $t('dashboard.revenueTrend.noData') }}
    </p>

    <div v-else ref="chartRef" class="w-full flex-1 min-h-[220px]"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import echarts from '@/plugins/echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const chartRef = ref(null)
const hasData = computed(() => props.data.length > 0)

let chartInstance = null

function renderChart() {
  if (!chartRef.value || !hasData.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption({
    grid: { left: 48, right: 20, top: 20, bottom: 28 },
    xAxis: {
      type: 'category',
      data: props.data.map((d) => d.month),
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisTick: { show: false },
      axisLabel: { 
        color: '#64748b', 
        fontSize: 11,
        fontWeight: 600 
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        formatter: '${value}',
        color: '#64748b',
        fontSize: 11,
        fontWeight: 600
      },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 12 },
      valueFormatter: (v) => `$${Number(v).toFixed(2)}`,
    },
    series: [
      {
        data: props.data.map((d) => d.total),
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#34d399' }, // Emerald-400 (Top)
            { offset: 1, color: '#059669' }  // Emerald-600 (Bottom)
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        barWidth: '40%',
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#6ee7b7' },
              { offset: 1, color: '#047857' }
            ])
          }
        }
      },
    ],
  })
}

function handleResize() {
  chartInstance?.resize()
}

onMounted(async () => {
  await nextTick()
  renderChart()
  window.addEventListener('resize', handleResize)
})

watch(
  () => props.data,
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>
<template>
  <div
    class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm p-4 sm:p-6 h-full flex flex-col"
  >
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4 gap-3">
      <div class="min-w-0">
        <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ $t('dashboard.revenueTrend.title') }}</h3>
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ $t('dashboard.revenueTrend.subtitle') }}</p>
      </div>
      <span
        class="flex-shrink-0 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/30 text-[10px] font-black uppercase tracking-wider"
      >
        {{ $t('dashboard.revenueTrend.analytics') }}
      </span>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-10">
      <div class="w-6 h-6 border-[3px] border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <p v-else-if="!hasData" class="flex-1 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500 py-10">
      {{ $t('dashboard.revenueTrend.noData') }}
    </p>

    <div v-else ref="chartRef" class="w-full flex-1 min-h-[220px]"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import echarts from '@/plugins/echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const chartRef = ref(null)
// Show the empty state when there are no months OR every month is $0 —
// an all-zero chart is just an empty grid and looks broken.
const hasData = computed(
  () => Array.isArray(props.data) && props.data.some((d) => Number(d.total) > 0),
)

// Month name in the selected language ("Nov" / "វិច្ឆិកា"), from the API's "YYYY-MM".
const { locale } = useI18n()
function monthLabel(d) {
  if (!d.ym) return d.month
  const [y, m] = String(d.ym).split('-').map(Number)
  const lang = locale.value === 'km' ? 'km-KH' : 'en-US'
  try {
    return new Intl.DateTimeFormat(lang, { month: 'short' }).format(new Date(y, m - 1, 1))
  } catch {
    return d.month
  }
}

// Follow the app's dark mode (the `dark` class on <html>) so the chart re-colours live.
const isDark = ref(document.documentElement.classList.contains('dark'))
let themeObserver = null
let resizeObserver = null
let chartInstance = null

function disposeChart() {
  resizeObserver?.disconnect()
  resizeObserver = null
  chartInstance?.dispose()
  chartInstance = null
}

function palette() {
  return isDark.value
    ? {
        axisLine: '#334155',
        label: '#94a3b8',
        split: '#1e293b',
        tipBg: '#020617',
        tipBorder: '#334155',
        tipText: '#f8fafc',
        barTop: '#34d399',
        barBottom: '#047857',
        hoverTop: '#6ee7b7',
        hoverBottom: '#059669',
      }
    : {
        axisLine: '#cbd5e1',
        label: '#64748b',
        split: '#f1f5f9',
        tipBg: '#0f172a',
        tipBorder: '#334155',
        tipText: '#f8fafc',
        barTop: '#34d399',
        barBottom: '#059669',
        hoverTop: '#6ee7b7',
        hoverBottom: '#047857',
      }
}

function renderChart() {
  // The chart element is removed while loading / empty, so drop the instance with it.
  if (!chartRef.value || !hasData.value) {
    disposeChart()
    return
  }

  // The element may have been re-created; drop the old instance if it points at a removed element.
  if (chartInstance && chartInstance.getDom() !== chartRef.value) {
    disposeChart()
  }
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
    // Resize whenever the container changes (sidebar toggle, rotate phone, window resize).
    resizeObserver = new ResizeObserver(() => chartInstance?.resize())
    resizeObserver.observe(chartRef.value)
  }

  const c = palette()
  // Tighter margins on phones so the chart is not squeezed.
  const narrow = chartRef.value.clientWidth < 420

  chartInstance.setOption(
    {
      grid: { left: narrow ? 40 : 48, right: narrow ? 10 : 20, top: 20, bottom: 28 },
      xAxis: {
        type: 'category',
        data: props.data.map(monthLabel),
        axisLine: { lineStyle: { color: c.axisLine } },
        axisTick: { show: false },
        axisLabel: { color: c.label, fontSize: 11, fontWeight: 600 },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}',
          color: c.label,
          fontSize: 11,
          fontWeight: 600,
        },
        splitLine: { lineStyle: { color: c.split, type: 'dashed' } },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: c.tipBg,
        borderColor: c.tipBorder,
        textStyle: { color: c.tipText, fontSize: 12 },
        valueFormatter: (v) => `$${Number(v).toFixed(2)}`,
      },
      series: [
        {
          data: props.data.map((d) => Number(d.total) || 0),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: c.barTop },
              { offset: 1, color: c.barBottom },
            ]),
            borderRadius: [6, 6, 0, 0],
          },
          barWidth: narrow ? '55%' : '40%',
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: c.hoverTop },
                { offset: 1, color: c.hoverBottom },
              ]),
            },
          },
        },
      ],
    },
    true,
  )
}

onMounted(async () => {
  await nextTick()
  renderChart()

  themeObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

watch(
  () => [props.data, props.loading],
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true },
)

watch(isDark, () => renderChart())
watch(locale, () => renderChart())

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  disposeChart()
})
</script>
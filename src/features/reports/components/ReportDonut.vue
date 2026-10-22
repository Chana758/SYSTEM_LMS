<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none p-5 h-full min-w-0 overflow-hidden">
    <h3
      class="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-wide mb-3 truncate"
      :title="title"
    >
      {{ title }}
    </h3>

    <div class="relative" :style="{ height: height + 'px' }">
      <div ref="el" class="w-full h-full"></div>

      <!-- Centre label: HTML overlay so it is always exactly in the middle of the ring -->
      <div
        v-if="!empty"
        class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none leading-tight"
        :style="{ top: CENTER_Y, maxWidth: holeWidth + 'px' }"
      >
        <p
          class="font-black text-gray-900 dark:text-white tabular-nums truncate"
          :style="{ fontSize: totalFontSize }"
        >
          {{ totalText }}
        </p>
        <p
          v-if="centerLabel"
          class="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 truncate"
        >
          {{ centerLabel }}
        </p>
      </div>

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
import { analyticsService } from '../services/analyticsService'

const { t } = useI18n()

// items = [{ name, value, color? }]
const props = defineProps({
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  height: { type: Number, default: 260 },
  // 'number' = plain count, 'currency' = money (uses analyticsService.formatCurrency)
  format: { type: String, default: 'number', validator: (v) => ['number', 'currency'].includes(v) },
  // small caption under the total, e.g. "Total amount"
  centerLabel: { type: String, default: '' },
})

// Ring centre — the total in the middle is placed at the same y.
const CENTER_Y = '40%'

const total = computed(() =>
  // round to 2 decimals so 88.42999999999999 becomes 88.43
  Math.round(props.items.reduce((s, i) => s + Number(i.value || 0), 0) * 100) / 100,
)
const empty = computed(() => total.value === 0)

const fmt = (v) =>
  props.format === 'currency'
    ? analyticsService.formatCurrency(v)
    : new Intl.NumberFormat().format(Math.round(Number(v || 0) * 100) / 100)

const totalText = computed(() => fmt(total.value))

// Shrink the font for long numbers so it always fits inside the ring hole.
const totalFontSize = computed(() => {
  const len = totalText.value.length
  if (len <= 6) return '26px'
  if (len <= 9) return '20px'
  return '16px'
})

// Inner hole diameter ≈ 46% of the chart's shorter side (radius ['46%', ...]); keep a small margin.
const holeWidth = computed(() => Math.max(70, Math.round(props.height * 0.4)))

const build = (dark) => {
  const c = themeTokens(dark)
  return {
    tooltip: {
      trigger: 'item', backgroundColor: c.tipBg, borderColor: c.tipBorder,
      textStyle: { color: c.tipText },
      formatter: (p) => `${p.name}: ${fmt(p.value)} (${p.percent}%)`,
    },
    legend: {
      bottom: 0, left: 'center', icon: 'circle',
      itemWidth: 8, itemHeight: 8, itemGap: 10,
      textStyle: { color: c.text, fontSize: 11 },
    },
    series: [{
      type: 'pie',
      radius: ['46%', '66%'],
      center: ['50%', CENTER_Y],
      avoidLabelOverlap: true,
      label: { show: false },
      itemStyle: { borderRadius: 6, borderColor: c.surface, borderWidth: 2 },
      data: props.items.map((i, idx) => ({
        name: i.name,
        value: i.value,
        itemStyle: { color: i.color || chartColors[idx % chartColors.length] },
      })),
    }],
  }
}

const { el } = useEchart(build, () => props.items)
</script>
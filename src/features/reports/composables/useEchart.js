import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import echarts from '@/plugins/echarts'

/**
 * Shared ECharts lifecycle: init, resize, dark-mode re-render, dispose.
 * `buildOption(isDark)` returns the option, `deps` is a getter the chart watches.
 */
export function useEchart(buildOption, deps) {
  const el = ref(null)
  const isDark = ref(false)
  let chart = null
  let resizeObs = null
  let themeObs = null

  const readTheme = () => {
    isDark.value = document.documentElement.classList.contains('dark')
  }

  const render = () => {
    if (!el.value) return
    if (!chart) chart = echarts.init(el.value)
    chart.setOption(buildOption(isDark.value), true)
  }

  onMounted(() => {
    if (!el.value) return
    readTheme()
    render()

    resizeObs = new ResizeObserver(() => chart?.resize())
    resizeObs.observe(el.value)

    themeObs = new MutationObserver(() => {
      readTheme()
      render()
    })
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  })

  onBeforeUnmount(() => {
    resizeObs?.disconnect()
    themeObs?.disconnect()
    chart?.dispose()
    chart = null
  })

  if (deps) watch(deps, render, { deep: true })

  return { el, isDark }
}

export const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#ec4899']

export const themeTokens = (dark) => ({
  text: dark ? '#94a3b8' : '#64748b',
  grid: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
  axis: dark ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
  tipBg: dark ? '#1e293b' : '#ffffff',
  tipBorder: dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
  tipText: dark ? '#e2e8f0' : '#334155',
  surface: dark ? '#1e293b' : '#ffffff',
  strong: dark ? '#ffffff' : '#0f172a',
})
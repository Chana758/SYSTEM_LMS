import i18n from '@/plugins/i18n'

// Intl locale that follows the language switch (EN / KM).
// Reading i18n.global.locale inside a computed makes charts re-render when it changes.
const intlLocale = () => (i18n.global.locale.value === 'km' ? 'km-KH' : 'en-US')

// "2026-11-06" / "2026-11" -> local Date (no UTC shift, unlike new Date('2026-11-06')).
const parseKey = (key) => {
  const [y, m, d = 1] = String(key).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d)
}

export const analyticsService = {
  formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value ?? 0)
  },

  formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value ?? 0)
  },

  formatDate(value) {
    if (!value) return '—'
    const d = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? parseKey(value) : new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(intlLocale(), { month: 'short', day: 'numeric', year: 'numeric' })
  },

  /** Chart axis label: "2026-11-06" -> "Nov 6" / "6 វិច្ឆិកា", "2026-11" -> "Nov 2026". */
  formatAxisLabel(key) {
    const s = String(key ?? '')
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return parseKey(s).toLocaleDateString(intlLocale(), { month: 'short', day: 'numeric' })
    }
    if (/^\d{4}-\d{2}$/.test(s)) {
      return parseKey(s).toLocaleDateString(intlLocale(), { month: 'short', year: 'numeric' })
    }
    return s
  },

  /** % change vs. a previous-period value, for KPI trend arrows (null = not comparable). */
  percentChange(current, previous) {
    if (!previous) return null
    return Math.round(((current - previous) / previous) * 100)
  },

  /** Turns [{date, total}, ...] into {labels, values} for ReportChart. */
  toChartSeries(trend = [], dateKey = 'date', valueKey = 'total') {
    return {
      labels: trend.map((t) => this.formatAxisLabel(t[dateKey])),
      values: trend.map((t) => Number(t[valueKey] ?? 0)),
    }
  },
}
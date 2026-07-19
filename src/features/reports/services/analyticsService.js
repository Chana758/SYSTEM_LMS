export const analyticsService = {
  formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value ?? 0)
  },

  formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value ?? 0)
  },

  formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  },

  /** % change vs. a previous-period value, for KPI trend arrows. */
  percentChange(current, previous) {
    if (!previous) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  },

  /** Turns [{date, total}, ...] into {labels, values} for ReportChart. */
  toChartSeries(trend = [], dateKey = 'date', valueKey = 'total') {
    return {
      labels: trend.map((t) => t[dateKey]),
      values: trend.map((t) => Number(t[valueKey] ?? 0)),
    }
  },
}
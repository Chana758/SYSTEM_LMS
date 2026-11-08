import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

// The API may answer with a plain array, or {data: [...]}.
// Anything else becomes an empty list so components can safely call .map / .length.
const toArray = (v) => {
  if (Array.isArray(v)) return v
  if (Array.isArray(v?.data)) return v.data
  return []
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      total_books: 0,
      available_books: 0,
      total_members: 0,
      borrowed_today: 0,
      currently_borrowed: 0,
      overdue_count: 0,
      unpaid_fines_total: 0,
      low_stock_books: [],
    },
    recentActivities: [],
    revenueChart: [],

    statsLoading: false,
    activitiesLoading: false,
    revenueLoading: false,
    error: '',
  }),

  actions: {
    /**
     * GET /dashboard
     */
    async fetchStats() {
      this.statsLoading = true
      this.error = ''
      try {
        const { data } = await apiClient.get('/dashboard')
        const s = data.data ?? data
        this.stats = {
          ...this.stats,
          ...s,
          unpaid_fines_total: Number(s.unpaid_fines_total) || 0,
          low_stock_books: Array.isArray(s.low_stock_books) ? s.low_stock_books : [],
        }
      } catch (e) {
        // Store an i18n key, not text, so the page can show it in the current language.
        this.error = 'dashboard.loadError'
      } finally {
        this.statsLoading = false
      }
    },

    /**
     * GET /dashboard/recent-activities
     * Expected: array (or {data: array}) of
     * { id, type: 'borrow'|'return'|'reservation'|'fine'|'member', description, created_at }
     */
    async fetchRecentActivities() {
      this.activitiesLoading = true
      try {
        const { data } = await apiClient.get('/dashboard/recent-activities')
        this.recentActivities = toArray(data)
      } catch (e) {
        // Fail soft — a broken activity feed shouldn't break the rest of the dashboard.
        this.recentActivities = []
      } finally {
        this.activitiesLoading = false
      }
    },

    /**
     * GET /dashboard/revenue-chart
     * Expected: array (or {data: array}) of { month: 'Jan', total: 123.45 }
     */
    async fetchRevenueChart() {
      this.revenueLoading = true
      try {
        const { data } = await apiClient.get('/dashboard/revenue-chart')
        this.revenueChart = toArray(data)
      } catch (e) {
        this.revenueChart = []
      } finally {
        this.revenueLoading = false
      }
    },

    /**
     * Fetches everything the dashboard page needs in parallel.
     */
    async fetchAll() {
      await Promise.all([
        this.fetchStats(),
        this.fetchRecentActivities(),
        this.fetchRevenueChart(),
      ])
    },
  },
})
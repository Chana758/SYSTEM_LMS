
import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

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
     * GET /dashboard — the same endpoint DashboardPage.vue already called
     * directly via apiClient before. Moved here so stats live in one
     * shared place instead of being fetched ad-hoc from the page.
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
        this.error = 'Failed to load dashboard stats.'
      } finally {
        this.statsLoading = false
      }
    },

    /**
     * GET /dashboard/recent-activities — NEW endpoint (added to
     * routes/api.php). Expected shape: an array (or {data: array}) of
     * { id, type: 'borrow'|'return'|'reservation'|'fine'|'member',
     *   description, created_at }. Backend method still needs to be
     * added to DashboardController — see the note in the chat response.
     */
    async fetchRecentActivities() {
      this.activitiesLoading = true
      try {
        const { data } = await apiClient.get('/dashboard/recent-activities')
        this.recentActivities = data.data ?? data
      } catch (e) {
        // Fail soft — a missing/broken activity feed shouldn't break the
        // rest of the dashboard.
        this.recentActivities = []
      } finally {
        this.activitiesLoading = false
      }
    },

    /**
     * GET /dashboard/revenue-chart — NEW endpoint (added to
     * routes/api.php). Expected shape: an array (or {data: array}) of
     * { month: 'Jan', total: 123.45 } covering the last several months
     * of fine payments collected. Backend method still needs to be
     * added to DashboardController — see the note in the chat response.
     */
    async fetchRevenueChart() {
      this.revenueLoading = true
      try {
        const { data } = await apiClient.get('/dashboard/revenue-chart')
        this.revenueChart = data.data ?? data
      } catch (e) {
        this.revenueChart = []
      } finally {
        this.revenueLoading = false
      }
    },

    /**
     * Convenience action — fetches everything the dashboard page needs
     * in parallel on mount.
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
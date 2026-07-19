import { defineStore } from 'pinia'
import { reportService } from '../services/reportService'

export const useReportStore = defineStore('reports', {
  state: () => ({
    dashboard: null,
    history: [],
    historyPagination: { current_page: 1, last_page: 1 },
    loading: false,
    exporting: false,
    error: null,
  }),

  actions: {
    async loadDashboard(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await reportService.dashboard(params)
        this.dashboard = data.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Failed to load dashboard.'
      } finally {
        this.loading = false
      }
    },

    async loadHistory(params = {}) {
      try {
        const { data } = await reportService.history(params)
        this.history = data.data.data
        this.historyPagination.current_page = data.data.current_page
        this.historyPagination.last_page = data.data.last_page
      } catch (e) {
        this.history = []
      }
    },

    async generateExport(payload) {
      this.exporting = true
      try {
        const { data } = await reportService.exportReport(payload)
        await this.loadHistory()
        return data
      } finally {
        this.exporting = false
      }
    },

    async removeReport(id) {
      await reportService.deleteReport(id)
      this.history = this.history.filter((r) => r.id !== id)
    },
  },
})
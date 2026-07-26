import apiClient from '@/api/axios'

export const dashboardService = {
  getStats() {
    return apiClient.get('/dashboard')
  },

  getRecentActivities() {
    return apiClient.get('/dashboard/recent-activities')
  },

  getRevenueChart() {
    return apiClient.get('/dashboard/revenue-chart')
  },
}
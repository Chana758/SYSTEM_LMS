// Adjust this import to your project's shared axios instance
// (e.g. the one used by scannerService.js already in this project).
import api from '@/api/axios'

export const reportService = {
  dashboard: (params) => api.get('/admin/reports/dashboard', { params }),
  borrow:    (params) => api.get('/admin/reports/borrow', { params }),
  fine:      (params) => api.get('/admin/reports/fine', { params }),
  user:      (params) => api.get('/admin/reports/user', { params }),
  revenue:   (params) => api.get('/admin/reports/revenue', { params }),
  stock:     (params) => api.get('/admin/reports/stock', { params }),

  history: (params)     => api.get('/admin/reports', { params }),
  exportReport: (payload) => api.post('/admin/reports/export', payload),
  deleteReport: (id)      => api.delete(`/admin/reports/${id}`),
}
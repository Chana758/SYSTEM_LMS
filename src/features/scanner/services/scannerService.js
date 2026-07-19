import api from '@/api/axios'

export const scannerService = {
  scan(payload) {
    return api.post('/scan', payload)
  },

  getHistory(params = {}) {
    return api.get('/scan/history', { params })
  },

  getSummary() {
    return api.get('/scan/summary')
  },

  confirmBorrow(payload) {
    return api.post('/borrows', payload)
  },

  confirmReturn(borrowId) {
    return api.post(`/borrows/${borrowId}/return`)
  },

  searchMembers(search) {
    return api.get('/members', { params: { search } })
  },
}
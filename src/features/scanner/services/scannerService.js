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

  // FIX: now accepts a payload (condition, damage_fee, lost_fee, notes)
  // instead of always defaulting to 'good' server-side. Backward
  // compatible — payload defaults to {} so existing callers still work.
  confirmReturn(borrowId, payload = {}) {
    return api.post(`/borrows/${borrowId}/return`, payload)
  },

  searchMembers(search) {
    return api.get('/members', { params: { search } })
  },

  // 🆕 Add a member to the reservation queue for a book that's
  // currently checked out — used by the scanner's "Reserve" flow.
  reserveBook(payload) {
    return api.post('/reservations', payload)
  },
}
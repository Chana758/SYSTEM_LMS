
import api from '@/api/axios'

export const scannerService = {
  // Scan a barcode and send the result to the API.
  scan(payload) {
    return api.post('/scan', payload)
  },

  // Get scan history with optional filters or pagination.
  getHistory(params = {}) {
    return api.get('/scan/history', { params })
  },

  // Get scan summary statistics.
  getSummary() {
    return api.get('/scan/summary')
  },

  // Confirm borrowing a book.
  confirmBorrow(payload) {
    return api.post('/borrows', payload)
  },

  // Confirm returning a borrowed book.
  confirmReturn(borrowId, payload = {}) {
    return api.post(`/borrows/${borrowId}/return`, payload)
  },

  // Search for members by keyword.
  searchMembers(search) {
    return api.get('/members', { params: { search } })
  },

  // Create a book reservation.
  reserveBook(payload) {
    return api.post('/reservations', payload)
  },
}

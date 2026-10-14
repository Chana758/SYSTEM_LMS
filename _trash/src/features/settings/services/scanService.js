import api from '@/api/axios'

export const scanService = {
  // Any authenticated user — process a scanned barcode
  processScan(payload) {
    // payload: { barcode, scan_type: 'borrow'|'return'|'lookup', device }
    return api.post('/scan', payload)
  },

  // Admin + Librarian — paginated scan audit log
  getHistory(params = {}) {
    return api.get('/scan/history', { params })
  },
}

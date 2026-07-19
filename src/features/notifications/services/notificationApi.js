import apiClient from '@/api/axios'

export default {
  index(params = {}) {
    return apiClient.get('/notifications', { params })
  },
  unreadCount() {
    return apiClient.get('/notifications/unread-count')
  },
  show(id) {
    return apiClient.get(`/notifications/${id}`)
  },
  markRead(id) {
    return apiClient.post(`/notifications/${id}/read`)
  },
  markAllRead() {
    return apiClient.post('/notifications/mark-all-read')
  },
  destroy(id) {
    return apiClient.delete(`/notifications/${id}`)
  },
  send(payload) {
    return apiClient.post('/notifications', payload)
  },
}
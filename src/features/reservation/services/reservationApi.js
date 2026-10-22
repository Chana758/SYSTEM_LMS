import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export default {
  // GET /reservations                (staff)
  index(params = {}) {
    return apiClient.get(ENDPOINTS.RESERVATIONS.LIST, { params })
  },

  // GET /reservations/stats          (staff)
  stats() {
    return apiClient.get(ENDPOINTS.RESERVATIONS.STATS)
  },

  // GET /reservations/my-list        (?scope=active|history)
  myReservations(params = {}) {
    return apiClient.get(ENDPOINTS.RESERVATIONS.MY_LIST, { params })
  },

  // GET /reservations/{id}
  show(id) {
    return apiClient.get(ENDPOINTS.RESERVATIONS.SHOW(id))
  },

  // POST /reservations
  store(payload) {
    return apiClient.post(ENDPOINTS.RESERVATIONS.CREATE, payload)
  },

  // POST /reservations/{id}/cancel
  cancel(id) {
    return apiClient.post(ENDPOINTS.RESERVATIONS.CANCEL(id))
  },

  // POST /reservations/{id}/fulfill  (staff)
  fulfill(id) {
    return apiClient.post(ENDPOINTS.RESERVATIONS.FULFILL(id))
  },
}
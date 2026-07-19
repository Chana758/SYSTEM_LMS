import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints' 

export default {
  // GET /reservations
  index(params = {}) {
    return apiClient.get(ENDPOINTS.RESERVATIONS.LIST, { params })
  },

  // GET /reservations/my-list
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

  // POST /reservations/{id}/fulfill
  fulfill(id) {
    return apiClient.post(ENDPOINTS.RESERVATIONS.FULFILL(id))
  },
}
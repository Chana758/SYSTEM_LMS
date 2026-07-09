import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const authService = {
  register(payload) {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, payload)
  },

  login(payload) {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, payload)
  },

  logout() {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT)
  },

  me() {
    return apiClient.get(ENDPOINTS.AUTH.ME)
  },
}
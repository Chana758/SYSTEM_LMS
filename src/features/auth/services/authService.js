import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const authService = {
  register(payload) {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, payload)
  },
  login(payload) {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, payload)
  },
  loginWithQr(qrToken) {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN_QR, { qr_token: qrToken })
  },
  generateQrToken() {
    return apiClient.post(ENDPOINTS.AUTH.QR_TOKEN_GENERATE)
  },
  generateQrTokenFor(userId) {
    return apiClient.post(`/auth/users/${userId}/qr-token/generate`)
  },
  // NEW — front-desk approval queue
  getPendingCards(params = {}) {
    return apiClient.get('/auth/pending-cards', { params })
  },
  revokeQrToken() {
    return apiClient.post(ENDPOINTS.AUTH.QR_TOKEN_REVOKE)
  },
  logout() {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT)
  },
  me() {
    return apiClient.get(ENDPOINTS.AUTH.ME)
  },
}
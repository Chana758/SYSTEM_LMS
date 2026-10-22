import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const authService = {
  // 1. Authentication
  register(payload) {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, payload)
  },
  login(payload) {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, payload)
  },
  loginWithQr(qrToken) {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN_QR, { qr_token: qrToken })
  },
  logout() {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT)
  },
  me() {
    return apiClient.get(ENDPOINTS.AUTH.ME)
  },

  // 2. Forgot / reset password
  forgotPassword(email) {
    return apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
  },
  resetPassword(payload) {
    // payload: { token, email, password, password_confirmation }
    return apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload)
  },

  // 3. QR Login Card
  // Self, read-only. Returns { has_card, expires_at } only, never a token.
  getQrCardStatus() {
    return apiClient.get(ENDPOINTS.AUTH.QR_TOKEN_STATUS)
  },
  // Self, revoke own card (e.g. report lost).
  revokeQrToken() {
    return apiClient.post(ENDPOINTS.AUTH.QR_TOKEN_REVOKE)
  },
  // Admin/librarian only: issues/reissues a card for a specific user.
  generateQrTokenFor(userId) {
    return apiClient.post(ENDPOINTS.AUTH.QR_TOKEN_GENERATE_FOR(userId))
  },
  // Admin/librarian only: front-desk approval queue.
  getPendingCards(params = {}) {
    return apiClient.get(ENDPOINTS.AUTH.PENDING_CARDS, { params })
  },
}
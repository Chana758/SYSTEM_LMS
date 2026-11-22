import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const authService = {
  // 1. Authentication
  register(payload) {
    // With an ID photo the payload is FormData: send it as multipart, with more time to upload
    const isForm = typeof FormData !== 'undefined' && payload instanceof FormData
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, payload, isForm ? { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 } : undefined)
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
  logoutAll() {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT_ALL)
  },
  // Public: registration/activation switches + staff idle-lock minutes (B3.1)
  config() {
    return apiClient.get(ENDPOINTS.AUTH.CONFIG)
  },
  // Public: imported student sets password + PIN with student ID + date of birth (B2.2)
  activate(payload) {
    return apiClient.post(ENDPOINTS.AUTH.ACTIVATE, payload)
  },
  // Staff idle lock (B2.7)
  verifyPassword(password) {
    return apiClient.post(ENDPOINTS.AUTH.VERIFY_PASSWORD, { password })
  },
  // Admin/librarian: temporary password + clear PIN (B2.5)
  resetCredentials(userId) {
    return apiClient.post(ENDPOINTS.AUTH.RESET_CREDENTIALS(userId))
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
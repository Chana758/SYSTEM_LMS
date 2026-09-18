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
    return apiClient.post('/auth/forgot-password', { email })
  },
  resetPassword(payload) {
    // payload: { token, email, password, password_confirmation }
    return apiClient.post('/auth/reset-password', payload)
  },

  // 3. QR Login Card
  // Self, read-only. Returns { has_card, expires_at } only, never a
  // token. Replaces the old self-service generate() call.
  getQrCardStatus() {
    return apiClient.get('/auth/qr-token/status')
  },
  // Self, revoke own card (e.g. report lost).
  revokeQrToken() {
    return apiClient.post('/auth/qr-token/revoke')
  },
  // Admin/librarian only — issues/reissues a card for a specific user.
  // This is now the ONLY way any QR card gets created.
  generateQrTokenFor(userId) {
    return apiClient.post(`/auth/users/${userId}/qr-token/generate`)
  },
  // Admin/librarian only — front-desk approval queue.
  getPendingCards(params = {}) {
    return apiClient.get('/auth/pending-cards', { params })
  },

  // REMOVED: generateQrToken() (self-service issuance). The backing
  // route POST /auth/qr-token/generate has been deleted from
  // routes/api.php on purpose — do not re-add a call to it.
}
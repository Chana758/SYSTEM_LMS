import { defineStore } from 'pinia'
import { authService } from '../services/authService'
import { profileService } from '@/features/settings/services/profileService'
import { securityService } from '@/features/settings/services/securityService'
import { accountService } from '@/features/settings/services/accountService'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('access_token') || null,
    loading: false,
    errors: {},
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role?.name || null,
  },

  actions: {
    // 1. Authentication Actions
    async register(payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await authService.register(payload)
        this._setSession(data.user, data.access_token)
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

    async login(payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await authService.login(payload)
        this._setSession(data.user, data.access_token)
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Log in by scanning a QR login card (kiosk scanner types the raw
     * token into an input, we send it here as-is). Mirrors login()
     * above but authenticates by token instead of email+password.
     */
    async loginWithQr(qrToken) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await authService.loginWithQr(qrToken)
        this._setSession(data.user, data.access_token)
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

    // 2. QR Login Card Actions

    /**
     * Read-only status check for the currently logged-in user's own QR
     * card. Used by QrLoginCard.vue on mount to decide which UI state
     * to show. Never returns a token — issuance is staff-only now, via
     * generateQrTokenFor(userId) on authService directly (see
     * QrLoginCardAdmin.vue / PendingCardsPage.vue).
     */
    async getQrCardStatus() {
      try {
        const { data } = await authService.getQrCardStatus()
        return { success: true, hasCard: data.has_card, expiresAt: data.expires_at }
      } catch (error) {
        return { success: false, hasCard: false, expiresAt: null }
      }
    },

    // Self-revoke (e.g. report lost) stays available.
    async revokeQrToken() {
      this.loading = true
      try {
        await authService.revokeQrToken()
        return true
      } catch (error) {
        return false
      } finally {
        this.loading = false
      }
    },

    // REMOVED: generateQrToken(). Self-service issuance no longer has
    // a backing route. Any component still calling this will break at
    // build/lint time, which is intentional — it forces every caller
    // through the staff-only generateQrTokenFor(userId) flow instead.

    async logout() {
      try {
        await authService.logout()
      } finally {
        this._clearSession()
        router.push({ name: 'login' })
      }
    },

    async fetchMe() {
      try {
        const { data } = await authService.me()
        this.user = data
        localStorage.setItem('user', JSON.stringify(data))
      } catch (error) {
        this._clearSession()
      }
    },

    /**
     * Request a password-reset email for the given address. Always
     * resolves { success: true } on a 200 (the backend intentionally
     * returns a generic "if an account exists..." message regardless
     * of whether the email is registered, so the UI can't leak which
     * emails have accounts).
     */
    async forgotPassword(email) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await authService.forgotPassword(email)
        return { success: true, message: data.message }
      } catch (error) {
        this._handleError(error)
        return { success: false, message: this.errors.general || this.errors.email }
      } finally {
        this.loading = false
      }
    },

    /**
     * Submit a new password using the token + email pulled from the
     * reset-link URL. On success the backend also revokes any existing
     * QR login card for that user (see AuthController), so no extra
     * cleanup is needed here.
     */
    async resetPassword(payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await authService.resetPassword(payload)
        return { success: true, message: data.message }
      } catch (error) {
        this._handleError(error)
        return { success: false, message: this.errors.general }
      } finally {
        this.loading = false
      }
    },

    // 3. Profile & Account Actions
    async uploadAvatar(file) {
      this.loading = true
      try {
        const { data } = await profileService.uploadAvatar(file)
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
        return data
      } catch (error) {
        this._handleError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async removeAvatar() {
      this.loading = true
      try {
        const { data } = await profileService.removeAvatar()
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
        return data
      } catch (error) {
        this._handleError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async changePassword(payload) {
      this.loading = true
      this.errors = {}
      try {
        await securityService.changePassword(payload)
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

    async updateAccount(payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await accountService.updateAccount(payload)
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

    // 4. Helper Methods

    /**
     * Clear any leftover validation/general errors.
     *
     * Why this was needed: `errors` is only reset at the top of each
     * async action (login, loginWithQr, register, etc.). But switching
     * between the Password and QR tabs on the login screen does NOT
     * fire any of those actions — it's just a local `ref` toggle in
     * LoginPage.vue. So a failed QR scan (e.g. "invalid QR code") would
     * leave `errors.general` set in the store, and since both
     * LoginForm and QrLoginForm read from the same shared
     * `authStore.errors`, switching tabs made the stale message bleed
     * into the other form.
     *
     * Fix: call this whenever the UI changes context without
     * submitting a new request (e.g. on tab switch, or navigating from
     * Forgot Password to Login).
     */
    clearErrors() {
      this.errors = {}
    },

    _setSession(user, token) {
      this.user = user
      this.token = token
      localStorage.setItem('access_token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    _clearSession() {
      this.user = null
      this.token = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },

    _handleError(error) {
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {}
        this.errors = Object.fromEntries(
          Object.entries(backendErrors).map(([key, msgs]) => [key, msgs[0]])
        )
        // Fall back to the top-level message (e.g. throttling responses
        // from the Password broker come back as { message: "..." } with
        // no per-field `errors` object at all).
        if (!Object.keys(this.errors).length && error.response.data.message) {
          this.errors = { general: error.response.data.message }
        }
      } else {
        this.errors = {
          general: error.response?.data?.message || 'An unexpected error occurred',
        }
      }
    },
  },
})
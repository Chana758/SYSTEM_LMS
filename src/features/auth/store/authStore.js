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

    /**
     * Generate (or regenerate) the CURRENTLY logged-in user's own QR
     * login card. Requires an existing session (password login first).
     * Returns the raw token so the caller can encode/display it as a
     * QR image — it is never retrievable again after this call.
     */
    async generateQrToken() {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await authService.generateQrToken()
        return { success: true, qrToken: data.qr_token, expiresAt: data.expires_at }
      } catch (error) {
        this._handleError(error)
        return { success: false, message: this.errors.general }
      } finally {
        this.loading = false
      }
    },

    async revokeQrToken() {
      this.loading = true
      try {
        await authService.revokeQrToken()
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

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

    // 2. Profile & Account Actions
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

    // 3. Helper Methods
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
      } else {
        this.errors = {
          general: error.response?.data?.message || 'An unexpected error occurred',
        }
      }
    },
  },
})
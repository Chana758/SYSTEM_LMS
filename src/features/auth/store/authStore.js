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
    isDemo: (state) => state.user?.is_demo === true,
  },

  actions: {
    // 1. Authentication
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

    // Log in with the raw token from a scanned QR card
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

    // 2. QR login card

    // Read-only status of the current user's QR card (never returns the token)
    async getQrCardStatus() {
      try {
        const { data } = await authService.getQrCardStatus()
        return { success: true, hasCard: data.has_card, expiresAt: data.expires_at }
      } catch (error) {
        return { success: false, hasCard: false, expiresAt: null }
      }
    },

    // Self-revoke (e.g. card lost)
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
        // Backend may return { user: {...} } or the user object directly
        const user = data.user ?? data
        this.user = user
        localStorage.setItem('user', JSON.stringify(user))
      } catch (error) {
        this._clearSession()
      }
    },

    // Request a reset email; the backend returns a generic message so emails can't be enumerated
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

    // Set a new password using the token + email from the reset link
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

    // 3. Profile & account
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

    // 4. Helpers

    // Clear stale errors when the UI changes context without a request (e.g. tab switch)
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
      // Demo restriction is already shown as a toast by the interceptor
      if (error.isDemoRestricted) {
        this.errors = {}
        return
      }

      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {}
        this.errors = Object.fromEntries(
          Object.entries(backendErrors).map(([key, msgs]) => [key, msgs[0]])
        )
        // Fall back to the top-level message when there are no per-field errors
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
import { defineStore } from 'pinia'
import { authService } from '../services/authService'
import { profileService } from '@/features/settings/services/profileService'
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

    async logout() {
      try {
        await authService.logout()
      } finally {
        this._clearSession()
        router.push({ name: 'login' })   // new edit: redirect to login page after logout
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

    async uploadAvatar(file) {
      this.loading = true
      try {
        const { data } = await profileService.uploadAvatar(file)
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

    async removeAvatar() {
      this.loading = true
      try {
        const { data } = await profileService.removeAvatar()
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
import { defineStore } from 'pinia'
import { staffService } from '../services/staffService'

export const useStaffStore = defineStore('staff', {
  state: () => ({
    librarians: [],
    currentLibrarian: null,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    filters: { search: '', status: '' },
    loading: false,
    errors: {},
  }),

  actions: {
    async fetchList(page = 1) {
      this.loading = true
      try {
        const { data } = await staffService.list({ ...this.filters, page })
        this.librarians = data.data
        this.pagination = {
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
        }
      } catch (error) {
        this._handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id) {
      this.loading = true
      try {
        const { data } = await staffService.show(id)
        this.currentLibrarian = data
        return data
      } catch (error) {
        this._handleError(error)
        return null
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      this.loading = true
      this.errors = {}
      try {
        await staffService.create(payload)
        await this.fetchList()
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

    async update(id, payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await staffService.update(id, payload)
        this.currentLibrarian = data.librarian
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

    async remove(id) {
      this.loading = true
      try {
        await staffService.remove(id)
        this.librarians = this.librarians.filter((l) => l.id !== id)
        return true
      } catch (error) {
        this._handleError(error)
        return false
      } finally {
        this.loading = false
      }
    },

    _handleError(error) {
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {}
        this.errors = Object.fromEntries(
          Object.entries(backendErrors).map(([key, msgs]) => [key, msgs[0]])
        )
      } else {
        this.errors = { general: error.response?.data?.message || 'មានបញ្ហាកើតឡើង' }
      }
    },
  },
})
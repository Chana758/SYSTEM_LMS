import { defineStore } from 'pinia'
import { fineService } from '../services/fineService'

export const useFineStore = defineStore('fine', {
  state: () => ({
    fines: [],
    myFines: [],
    currentFine: null,
    summary: { total_unpaid: 0, total_paid: 0, total_waived: 0, count_unpaid: 0 },
    loading: false,
    errors: {},
    filters: { status: '', reason: '', search: '' },
    pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1 },
  }),

  getters: {
    myTotalUnpaid: (state) =>
      state.myFines.filter((f) => f.status === 'unpaid').reduce((sum, f) => sum + Number(f.amount), 0),
  },

  actions: {
    async fetchFines(page = 1) {
      this.loading = true
      this.errors = {}
      this.pagination.current_page = page
      try {
        const { data } = await fineService.list({
          status: this.filters.status || undefined,
          reason: this.filters.reason || undefined,
          search: this.filters.search || undefined,
          page,
          per_page: this.pagination.per_page,
        })
        this.fines = data.data
        this.pagination = {
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total,
          last_page: data.last_page,
        }
      } catch (e) {
        this.errors = { general: e.response?.data?.message || 'Failed to load fines' }
        this.fines = []
      } finally {
        this.loading = false
      }
    },

    async fetchMyFines() {
      this.loading = true
      try {
        const { data } = await fineService.myFines()
        this.myFines = data.data
      } catch (e) {
        this.myFines = []
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      try {
        const { data } = await fineService.summary()
        this.summary = data
      } catch (e) {
        console.error('fetchSummary failed', e)
      }
    },

    async fetchFine(id) {
      this.loading = true
      try {
        const { data } = await fineService.show(id)
        this.currentFine = data
      } finally {
        this.loading = false
      }
    },

    async createFine(payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await fineService.create(payload)
        return { success: true, message: data.message, data: data.data }
      } catch (e) {
        this.errors = e.response?.data?.errors || {}
        return { success: false, message: e.response?.data?.message || 'Failed to create fine' }
      } finally {
        this.loading = false
      }
    },
  },
})
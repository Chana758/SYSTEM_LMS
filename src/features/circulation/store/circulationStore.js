import { defineStore } from 'pinia'
import { circulationService } from '../services/circulationService'

export const useCirculationStore = defineStore('circulation', {
  state: () => ({
    borrows: [],
    myBorrows: [],
    overdueBorrows: [],
    pagination: { total: 0, current_page: 1, last_page: 1 },
    myPagination: { total: 0, current_page: 1, last_page: 1 },
    filters: { status: '', search: '', from: '', to: '' },
    loading: false,
    errors: {},
  }),

  actions: {
    async fetchList(page = 1) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await circulationService.getBorrows({
          page,
          status: this.filters.status || undefined,
          search: this.filters.search || undefined,
          from: this.filters.from || undefined,
          to: this.filters.to || undefined,
        })
        this.borrows = data.data
        this.pagination = {
          total: data.total,
          current_page: data.current_page,
          last_page: data.last_page,
        }
      } finally {
        this.loading = false
      }
    },

    async fetchMyBorrows(page = 1) {
      this.loading = true
      try {
        const { data } = await circulationService.getMyBorrows({ page })
        this.myBorrows = data.data
        this.myPagination = {
          total: data.total,
          current_page: data.current_page,
          last_page: data.last_page,
        }
      } finally {
        this.loading = false
      }
    },

    async fetchOverdue(page = 1) {
      this.loading = true
      try {
        const { data } = await circulationService.getOverdue({ page })
        this.overdueBorrows = data.data
        this.pagination = {
          total: data.total,
          current_page: data.current_page,
          last_page: data.last_page,
        }
      } finally {
        this.loading = false
      }
    },

    async borrow(payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await circulationService.createBorrow(payload)
        return { success: true, message: data.message }
      } catch (e) {
        if (e.response?.status === 422) {
          this.errors = e.response.data.errors || { general: e.response.data.message }
        }
        return { success: false, message: e.response?.data?.message || 'Borrow failed.' }
      } finally {
        this.loading = false
      }
    },

    async renew(borrowId, forMember = false) {
      try {
        const { data } = await circulationService.renewBorrow(borrowId)
        forMember ? await this.fetchMyBorrows(this.myPagination.current_page) : await this.fetchList(this.pagination.current_page)
        return { success: true, message: data.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Renew failed.' }
      }
    },

    async returnBook(borrowId, condition = 'good', extra = {}) {
      this.loading = true
      try {
        const { data } = await circulationService.returnBook(borrowId, { condition, ...extra })
        return { success: true, message: data.message, data: data.data }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Return failed.' }
      } finally {
        this.loading = false
      }
    },
  },
})
import { defineStore } from 'pinia'
import { circulationService } from '../services/circulationService'

const emptyPage = () => ({ total: 0, current_page: 1, last_page: 1 })
const toPage = (d) => ({ total: d.total, current_page: d.current_page, last_page: d.last_page })
const errMsg = (e, fallback) => e.response?.data?.message || e.message || fallback

export const useCirculationStore = defineStore('circulation', {
  state: () => ({
    borrows: [],
    myBorrows: [],
    overdueBorrows: [],
    pagination: emptyPage(),
    myPagination: emptyPage(),
    overduePagination: emptyPage(), // separate, so Overdue never clobbers the Borrow list
    filters: { status: '', search: '', from: '', to: '' },
    loading: false,
    error: '',   // load errors (shown on the page)
    errors: {},  // validation errors (shown on forms)
  }),

  actions: {
    async fetchList(page = 1) {
      this.loading = true
      this.errors = {}
      this.error = ''
      try {
        const { data } = await circulationService.getBorrows({
          page,
          status: this.filters.status || undefined,
          search: this.filters.search || undefined,
          from: this.filters.from || undefined,
          to: this.filters.to || undefined,
        })
        this.borrows = data.data
        this.pagination = toPage(data)
      } catch (e) {
        this.borrows = []
        this.pagination = emptyPage()
        this.error = errMsg(e, 'Failed to load borrows.')
        console.error('fetchList failed:', e.response?.data || e)
      } finally {
        this.loading = false
      }
    },

    async fetchMyBorrows(page = 1) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await circulationService.getMyBorrows({ page })
        this.myBorrows = data.data
        this.myPagination = toPage(data)
      } catch (e) {
        this.myBorrows = []
        this.myPagination = emptyPage()
        this.error = errMsg(e, 'Failed to load your borrows.')
        console.error('fetchMyBorrows failed:', e.response?.data || e)
      } finally {
        this.loading = false
      }
    },

    async fetchOverdue(page = 1) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await circulationService.getOverdue({ page })
        this.overdueBorrows = data.data
        this.overduePagination = toPage(data)
      } catch (e) {
        this.overdueBorrows = []
        this.overduePagination = emptyPage()
        this.error = errMsg(e, 'Failed to load overdue books.')
        console.error('fetchOverdue failed:', e.response?.data || e)
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
        return { success: false, message: errMsg(e, 'Borrow failed.') }
      } finally {
        this.loading = false
      }
    },

    async renew(borrowId, forMember = false) {
      try {
        const { data } = await circulationService.renewBorrow(borrowId)
        if (forMember) await this.fetchMyBorrows(this.myPagination.current_page)
        else await this.fetchList(this.pagination.current_page)
        return { success: true, message: data.message }
      } catch (e) {
        return { success: false, message: errMsg(e, 'Renew failed.') }
      }
    },

    async returnBook(borrowId, condition = 'good', extra = {}) {
      this.loading = true
      try {
        const { data } = await circulationService.returnBook(borrowId, { condition, ...extra })
        return { success: true, message: data.message, data: data.data }
      } catch (e) {
        return { success: false, message: errMsg(e, 'Return failed.') }
      } finally {
        this.loading = false
      }
    },
  },
})
import { defineStore } from 'pinia'
import { reservationService } from '../services/reservationService'

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: [],
    myReservations: [],
    currentReservation: null,
    loading: false,
    errors: {},
    pagination: { current_page: 1, last_page: 1, total: 0 },
    myPagination: { current_page: 1, last_page: 1, total: 0 },
    filters: { search: '', status: '' },
  }),

  actions: {
    async fetchReservations(page = 1) {
      this.loading = true
      const result = await reservationService.getReservations({
        page,
        search: this.filters.search || undefined,
        status: this.filters.status || undefined,
      })
      this.loading = false

      if (result.success) {
        this.reservations = result.data.data
        this.pagination = {
          current_page: result.data.current_page,
          last_page: result.data.last_page,
          total: result.data.total,
        }
      }
      return result
    },

    async fetchMyReservations(page = 1) {
      this.loading = true
      const result = await reservationService.getMyReservations({ page })
      this.loading = false

      if (result.success) {
        this.myReservations = result.data.data
        this.myPagination = {
          current_page: result.data.current_page,
          last_page: result.data.last_page,
          total: result.data.total,
        }
      }
      return result
    },

    async fetchReservation(id) {
      this.loading = true
      const result = await reservationService.getReservation(id)
      this.loading = false

      if (result.success) this.currentReservation = result.data
      return result
    },

    async createReservation(payload) {
      this.loading = true
      this.errors = {}
      const result = await reservationService.createReservation(payload)
      this.loading = false

      if (!result.success) this.errors = result.errors || { general: result.message }
      return result
    },

    async cancelReservation(id) {
      const result = await reservationService.cancelReservation(id)
      if (result.success) {
        this.reservations = this.reservations.map((r) => (r.id === id ? result.data : r))
        this.myReservations = this.myReservations.map((r) => (r.id === id ? result.data : r))
        if (this.currentReservation?.id === id) this.currentReservation = result.data
      }
      return result
    },

    async fulfillReservation(id) {
      const result = await reservationService.fulfillReservation(id)
      if (result.success) {
        this.reservations = this.reservations.map((r) => (r.id === id ? result.data : r))
        if (this.currentReservation?.id === id) this.currentReservation = result.data
      }
      return result
    },
  },
})
import { defineStore } from 'pinia'
import { reservationService } from '../services/reservationService'

const emptyStats = () => ({ total: 0, pending: 0, ready: 0, fulfilled: 0, cancelled: 0, expired: 0 })
const toPagination = (d) => ({ current_page: d.current_page, last_page: d.last_page, total: d.total })

// Only the newest request of each kind may write to the store.
let listSeq = 0
let mineSeq = 0
let detailSeq = 0

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: [],
    myReservations: [],
    currentReservation: null,
    stats: emptyStats(),
    loading: false, // fetching lists / detail
    saving: false,  // creating a reservation (kept separate so lists don't flash "Loading…")
    errors: {},
    pagination: { current_page: 1, last_page: 1, total: 0 },
    myPagination: { current_page: 1, last_page: 1, total: 0 },
    filters: { search: '', status: '' },
  }),

  actions: {
    // ---------- staff list ----------
    async fetchReservations(page = 1) {
      const seq = ++listSeq
      this.loading = true
      const result = await reservationService.getReservations({
        page,
        search: this.filters.search || undefined,
        status: this.filters.status || undefined,
      })
      if (seq !== listSeq) return result // a newer request is in flight
      this.loading = false

      if (result.success) {
        this.reservations = result.data.data
        this.pagination = toPagination(result.data)
      }
      return result
    },

    // Real totals from the server (not counted from the current page).
    async fetchStats() {
      const result = await reservationService.getStats()
      if (result.success) this.stats = { ...emptyStats(), ...result.data }
      return result
    },

    // ---------- member list ----------
    // scope: 'active' (pending + ready) | 'history' (everything else)
    async fetchMyReservations(page = 1, scope = 'active') {
      const seq = ++mineSeq
      this.loading = true
      const result = await reservationService.getMyReservations({ page, scope })
      if (seq !== mineSeq) return result
      this.loading = false

      if (result.success) {
        this.myReservations = result.data.data
        this.myPagination = toPagination(result.data)
      }
      return result
    },

    // silent = refresh in place (no blank "Loading…" flash after an action)
    async fetchReservation(id, silent = false) {
      const seq = ++detailSeq
      if (!silent) {
        this.currentReservation = null
        this.loading = true
      }
      const result = await reservationService.getReservation(id)
      if (seq !== detailSeq) return result
      if (!silent) this.loading = false

      if (result.success) this.currentReservation = result.data
      return result
    },

    // ---------- commands ----------
    async createReservation(payload) {
      this.saving = true
      this.errors = {}
      const result = await reservationService.createReservation(payload)
      this.saving = false

      if (!result.success) {
        // `{}` is truthy in JS, so check the keys; otherwise business-rule
        // messages (duplicate, limit reached ...) would be lost.
        this.errors = Object.keys(result.errors || {}).length
          ? result.errors
          : { general: result.message }
      }
      return result
    },

    async cancelReservation(id) {
      const result = await reservationService.cancelReservation(id)
      if (result.success) this.replace(result.data)
      return result
    },

    async fulfillReservation(id) {
      const result = await reservationService.fulfillReservation(id)
      if (result.success) this.replace(result.data)
      return result
    },

    // Swap an updated reservation into every place it may be shown.
    replace(updated) {
      const swap = (list) => list.map((r) => (r.id === updated.id ? updated : r))
      this.reservations = swap(this.reservations)
      this.myReservations = swap(this.myReservations)
      if (this.currentReservation?.id === updated.id) this.currentReservation = updated
    },
  },
})
import { defineStore } from 'pinia'
import { finePaymentService } from '../services/finePaymentService'

export const useFinePaymentStore = defineStore('finePayment', {
  state: () => ({
    processing: false,
    errors: {},
  }),

  actions: {
    async payFine(id, paymentMethod) {
      this.processing = true
      this.errors = {}
      try {
        const { data } = await finePaymentService.pay(id, paymentMethod)
        return { success: true, message: data.message, data: data.data }
      } catch (e) {
        this.errors = { general: e.response?.data?.message || 'Failed to process payment' }
        return { success: false, message: this.errors.general }
      } finally {
        this.processing = false
      }
    },

    async waiveFine(id, notes) {
      this.processing = true
      this.errors = {}
      try {
        const { data } = await finePaymentService.waive(id, notes)
        return { success: true, message: data.message, data: data.data }
      } catch (e) {
        this.errors = { general: e.response?.data?.message || 'Failed to waive fine' }
        return { success: false, message: this.errors.general }
      } finally {
        this.processing = false
      }
    },
  },
})
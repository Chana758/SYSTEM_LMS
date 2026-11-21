import { fineApi } from './fineApi'

export const finePaymentService = {
  pay(id, paymentMethod, cash = {}) { return fineApi.pay(id, paymentMethod, cash) },
  waive(id, notes) { return fineApi.waive(id, notes) },
}
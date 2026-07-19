import { fineApi } from './fineApi'

export const finePaymentService = {
  pay(id, paymentMethod) { return fineApi.pay(id, paymentMethod) },
  waive(id, notes) { return fineApi.waive(id, notes) },
}
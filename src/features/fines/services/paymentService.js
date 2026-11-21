import apiClient from '@/api/axios'

// B5.1-B5.4 (Sam): KHQR payments
export const paymentService = {
  // Start (or reuse) a KHQR for one unpaid fine. Amount is decided by the server.
  payFineByKhqr(fineId) {
    return apiClient.post(`/fines/${fineId}/khqr`)
  },
  // B6.2: deposit of an external member (own, or staff at the desk)
  payDepositByKhqr(memberId) {
    return apiClient.post(`/members/${memberId}/deposit/khqr`)
  },
  myDeposit() {
    return apiClient.get('/my-deposit')
  },
  // Staff
  deposit(memberId) {
    return apiClient.get(`/members/${memberId}/deposit`)
  },
  requireDeposit(memberId) {
    return apiClient.post(`/members/${memberId}/deposit/require`)
  },
  depositCash(memberId) {
    return apiClient.post(`/members/${memberId}/deposit/cash`)
  },
  refundDeposit(memberId) {
    return apiClient.post(`/members/${memberId}/deposit/refund`)
  },
  // Polled every few seconds by the QR modal; the server asks the bank.
  status(paymentId) {
    return apiClient.get(`/payments/${paymentId}/status`)
  },
  // Staff demo button, test mode only
  simulatePaid(paymentId) {
    return apiClient.post(`/payments/${paymentId}/simulate-paid`)
  },
  // Staff: all payments (KHQR + cash)
  list(params = {}) {
    return apiClient.get('/payments', { params })
  },
  // Member: own receipts
  mine(params = {}) {
    return apiClient.get('/my-payments', { params })
  },
}

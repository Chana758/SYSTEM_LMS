import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const fineApi = {
  list: (params = {}) => apiClient.get(ENDPOINTS.FINES.LIST, { params }),
  myFines: (params = {}) => apiClient.get('/my-fines', { params }),
  summary: () => apiClient.get(ENDPOINTS.FINES.SUMMARY),
  create: (payload) => apiClient.post(ENDPOINTS.FINES.CREATE, payload),
  show: (id) => apiClient.get(ENDPOINTS.FINES.SHOW(id)),
  // NEW — PUT to the same /fines/{id} URL used by show(), matching the
  // new PUT route added in routes/api.php (§6 FINES).
  pay: (id, paymentMethod, cash = {}) => apiClient.post(ENDPOINTS.FINES.PAY(id), {
    payment_method: paymentMethod,
    received_khr: cash.received_khr || 0,
    received_usd: cash.received_usd || 0,
    change_in: cash.change_in || 'KHR',
  }),
  waive: (id, notes) => apiClient.post(ENDPOINTS.FINES.WAIVE(id), { notes }),
}
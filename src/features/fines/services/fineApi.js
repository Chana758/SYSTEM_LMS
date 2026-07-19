import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const fineApi = {
  list: (params = {}) => apiClient.get(ENDPOINTS.FINES.LIST, { params }),
  myFines: (params = {}) => apiClient.get('/my-fines', { params }),
  summary: () => apiClient.get(ENDPOINTS.FINES.SUMMARY),
  create: (payload) => apiClient.post(ENDPOINTS.FINES.CREATE, payload),
  show: (id) => apiClient.get(ENDPOINTS.FINES.SHOW(id)),
  pay: (id, paymentMethod) => apiClient.post(ENDPOINTS.FINES.PAY(id), { payment_method: paymentMethod }),
  waive: (id, notes) => apiClient.post(ENDPOINTS.FINES.WAIVE(id), { notes }),
}
import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const circulationService = {
  // Admin / Librarian
  getBorrows(params) {
    return apiClient.get(ENDPOINTS.BORROWS.LIST, { params })
  },
  returnBook(borrowId, payload) {
    return apiClient.post(ENDPOINTS.BORROWS.RETURN(borrowId), payload)
  },

  // Member
  getMyBorrows(params) {
    return apiClient.get(ENDPOINTS.BORROWS.MY_BORROWS, { params })
  },

  // Shared
  renewBorrow(borrowId) {
    return apiClient.post(ENDPOINTS.BORROWS.RENEW(borrowId))
  },
}
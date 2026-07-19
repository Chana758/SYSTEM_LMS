import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const staffService = {
  list(params = {}) {
    return apiClient.get(ENDPOINTS.LIBRARIANS.LIST, { params })
  },
  create(payload) {
    return apiClient.post(ENDPOINTS.LIBRARIANS.CREATE, payload)
  },
  show(id) {
    return apiClient.get(ENDPOINTS.LIBRARIANS.SHOW(id))
  },
  update(id, payload) {
    return apiClient.put(ENDPOINTS.LIBRARIANS.UPDATE(id), payload)
  },
  remove(id) {
    return apiClient.delete(ENDPOINTS.LIBRARIANS.DELETE(id))
  },
  restore(id) {
    return apiClient.post(ENDPOINTS.LIBRARIANS.RESTORE(id))
  },
}
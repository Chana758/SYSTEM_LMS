import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const ebookService = {
  getEbooks(params) {
    return apiClient.get(ENDPOINTS.EBOOKS.LIST, { params })
  },
  getEbook(id) {
    return apiClient.get(ENDPOINTS.EBOOKS.SHOW(id))
  },
  download(id) {
    return apiClient.post(ENDPOINTS.EBOOKS.DOWNLOAD(id))
  },
  create(formData) {
    return apiClient.post(ENDPOINTS.EBOOKS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  update(id, formData) {
    formData.append('_method', 'PUT')
    return apiClient.post(ENDPOINTS.EBOOKS.UPDATE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  remove(id) {
    return apiClient.delete(ENDPOINTS.EBOOKS.DELETE(id))
  },
  getProgress(id) {
    return apiClient.get(ENDPOINTS.EBOOKS.GET_PROGRESS(id))
  },
  updateProgress(id, payload) {
    return apiClient.put(ENDPOINTS.EBOOKS.UPDATE_PROGRESS(id), payload)
  },
  toggleFavorite(id) {
    return apiClient.post(ENDPOINTS.EBOOKS.TOGGLE_FAVORITE(id))
  },
  getMyFavorites(params) {
    return apiClient.get(ENDPOINTS.EBOOKS.MY_FAVORITES, { params })
  },
}
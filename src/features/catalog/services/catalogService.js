import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const catalogService = {
  // Books
  listBooks(params = {}) {
    return apiClient.get(ENDPOINTS.BOOKS.LIST, { params })
  },
  showBook(id) {
    return apiClient.get(ENDPOINTS.BOOKS.SHOW(id))
  },
  createBook(payload) {
    return apiClient.post(ENDPOINTS.BOOKS.CREATE, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  updateBook(id, payload) {
    payload.set('_method', 'PUT')
    return apiClient.post(ENDPOINTS.BOOKS.UPDATE(id), payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteBook(id) {
    return apiClient.delete(ENDPOINTS.BOOKS.DELETE(id))
  },
  addCopies(id, quantity) {
    return apiClient.post(ENDPOINTS.BOOKS.ADD_COPIES(id), { quantity })
  },

  // ★ Smart features
  fetchPopularBooks(limit = 6) {
    return apiClient.get(ENDPOINTS.BOOKS.POPULAR, { params: { limit } })
  },
  listReviews(bookId) {
    return apiClient.get(ENDPOINTS.BOOKS.REVIEWS(bookId))
  },
  submitReview(bookId, payload) {
    return apiClient.post(ENDPOINTS.BOOKS.REVIEWS(bookId), payload)
  },

  // Categories
  listCategories(params = {}) {
    return apiClient.get(ENDPOINTS.CATEGORIES.LIST, { params })
  },
  listAllCategories() {
    return apiClient.get(ENDPOINTS.CATEGORIES.LIST, { params: { all: true } })
  },
  createCategory(payload) {
    return apiClient.post(ENDPOINTS.CATEGORIES.CREATE, payload)
  },
  updateCategory(id, payload) {
    return apiClient.put(ENDPOINTS.CATEGORIES.UPDATE(id), payload)
  },
  deleteCategory(id) {
    return apiClient.delete(ENDPOINTS.CATEGORIES.DELETE(id))
  },

  // Book Copies
  updateCopy(id, payload) {
    return apiClient.patch(ENDPOINTS.BOOK_COPIES.UPDATE(id), payload)
  },
  deleteCopy(id) {
    return apiClient.delete(ENDPOINTS.BOOK_COPIES.DELETE(id))
  },
}
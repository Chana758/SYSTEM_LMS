import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

/**
 * Wraps the catalog endpoints (books/categories) that the Digital Library
 * feature needs, separate from ebookService which handles the ebooks table.
 */
export const libraryService = {
  getCategories() {
    return apiClient.get(ENDPOINTS.CATEGORIES.LIST)
  },
  getBooksByCategory(categoryId, params) {
    return apiClient.get(ENDPOINTS.BOOKS.LIST, { params: { ...params, category_id: categoryId } })
  },
  searchBooks(search, params) {
    return apiClient.get(ENDPOINTS.BOOKS.LIST, { params: { ...params, search } })
  },
}
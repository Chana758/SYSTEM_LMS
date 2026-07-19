import { defineStore } from 'pinia'
import { catalogService } from '../services/catalogService'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    books: [],
    popularBooks: [],
    categories: [],
    currentBook: null,
    reviews: [],
    loading: false,
    isbnLookupLoading: false,
    errors: {},
    filters: { search: '', category_id: '' },
    pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1 },
  }),

  actions: {
    async fetchBooks() {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await catalogService.listBooks({
          search: this.filters.search || undefined,
          category_id: this.filters.category_id || undefined,
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
        })
        this.books = data.data
        this.pagination = {
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total,
          last_page: data.last_page,
        }
      } catch (e) {
        this.errors = e.response?.data?.errors || { general: 'Failed to fetch books' }
      } finally {
        this.loading = false
      }
    },

    async fetchPopularBooks(limit = 6) {
      try {
        const { data } = await catalogService.fetchPopularBooks(limit)
        this.popularBooks = data
      } catch (e) {
        console.error('fetchPopularBooks failed:', e.response?.data || e.message)
      }
    },

    async lookupIsbn(isbn) {
      this.isbnLookupLoading = true
      try {
        const { data } = await catalogService.lookupIsbn(isbn)
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'ISBN lookup failed' }
      } finally {
        this.isbnLookupLoading = false
      }
    },

    async fetchBook(id) {
      this.loading = true
      try {
        const { data } = await catalogService.showBook(id)
        this.currentBook = data
        this.reviews = data.reviews || []
      } finally {
        this.loading = false
      }
    },

    async fetchReviews(bookId) {
      try {
        const { data } = await catalogService.listReviews(bookId)
        this.reviews = data.data
      } catch (e) {
        console.error('fetchReviews failed:', e.response?.data || e.message)
      }
    },

    async submitReview(bookId, payload) {
      try {
        const { data } = await catalogService.submitReview(bookId, payload)
        return { success: true, message: data.message, data: data.review }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to submit review', errors: e.response?.data?.errors }
      }
    },

    async createBook(payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await catalogService.createBook(payload)
        return { success: true, message: data.message, data: data.book }
      } catch (e) {
        this.errors = e.response?.data?.errors || {}
        return { success: false, message: e.response?.data?.message || 'Failed to create book' }
      } finally {
        this.loading = false
      }
    },

    async updateBook(id, payload) {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await catalogService.updateBook(id, payload)
        return { success: true, message: data.message, data: data.book }
      } catch (e) {
        this.errors = e.response?.data?.errors || {}
        return { success: false, message: e.response?.data?.message || 'Failed to update book' }
      } finally {
        this.loading = false
      }
    },

    async deleteBook(id) {
      try {
        const { data } = await catalogService.deleteBook(id)
        this.books = this.books.filter((b) => b.id !== id)
        return { success: true, message: data.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to delete book' }
      }
    },

    async addCopies(id, quantity) {
      try {
        const { data } = await catalogService.addCopies(id, quantity)
        return { success: true, message: data.message, data: data.book }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to add copies' }
      }
    },

    async fetchCategories() {
      this.loading = true
      this.errors = {}
      try {
        const { data } = await catalogService.listCategories()
        this.categories = Array.isArray(data) ? data : (data.data ?? [])
      } catch (e) {
        console.error('fetchCategories failed:', e.response?.status, e.response?.data || e.message)
        this.errors = { general: e.response?.data?.message || 'Failed to load categories' }
        this.categories = []
      } finally {
        this.loading = false
      }
    },

    async createCategory(payload) {
      try {
        const { data } = await catalogService.createCategory(payload)
        return { success: true, message: data.message, data: data.category }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to create category', errors: e.response?.data?.errors }
      }
    },

    async updateCategory(id, payload) {
      try {
        const { data } = await catalogService.updateCategory(id, payload)
        return { success: true, message: data.message, data: data.category }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to update category', errors: e.response?.data?.errors }
      }
    },

    async deleteCategory(id) {
      try {
        const { data } = await catalogService.deleteCategory(id)
        this.categories = this.categories.filter((c) => c.id !== id)
        return { success: true, message: data.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to delete category' }
      }
    },
  },
})
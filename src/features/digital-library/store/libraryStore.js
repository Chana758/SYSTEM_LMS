import { defineStore } from 'pinia'
import { ebookService } from '@/features/digital-library/services/ebookService'
import { libraryService } from '@/features/digital-library/services/libraryService'

export const useLibraryStore = defineStore('digitalLibrary', {
  state: () => ({
    ebooks: [],
    categories: [],
    currentEbook: null,
    favorites: [],
    loading: false,
    error: '',
    pagination: { current_page: 1, last_page: 1, total: 0 },
    favPagination: { current_page: 1, last_page: 1, total: 0 },
    filters: { search: '', category_id: '', format: '' },
  }),

  actions: {
    async fetchEbooks(page = 1) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await ebookService.getEbooks({
          page,
          search: this.filters.search || undefined,
          category_id: this.filters.category_id || undefined,
          format: this.filters.format || undefined,
        })
        this.ebooks = data.data
        this.pagination = {
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          total: data.total || 0,
        }
      } catch (e) {
        this.error = e.response?.data?.message || 'Failed to load e-books.'
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const { data } = await libraryService.getCategories()
        this.categories = data.data ?? data
      } catch (e) {
        this.error = e.response?.data?.message || 'Failed to load categories.'
      }
    },

    async fetchEbook(id) {
      this.loading = true
      try {
        const { data } = await ebookService.getEbook(id)
        this.currentEbook = data
      } catch (e) {
        this.error = e.response?.data?.message || 'E-book not found.'
      } finally {
        this.loading = false
      }
    },

    async downloadEbook(id) {
      try {
        const { data } = await ebookService.download(id)
        return { success: true, ...data }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Download failed.' }
      }
    },

    async createEbook(formData) {
      this.loading = true
      try {
        const { data } = await ebookService.create(formData)
        return { success: true, message: data.message, data: data.data }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to add e-book.' }
      } finally {
        this.loading = false
      }
    },

    async updateEbook(id, formData) {
      this.loading = true
      try {
        const { data } = await ebookService.update(id, formData)
        return { success: true, message: data.message, data: data.data }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to update e-book.' }
      } finally {
        this.loading = false
      }
    },

    async deleteEbook(id) {
      try {
        const { data } = await ebookService.remove(id)
        this.ebooks = this.ebooks.filter((e) => e.id !== id)
        return { success: true, message: data.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to delete e-book.' }
      }
    },

    async saveProgress(id, lastPage, percentage) {
      try {
        await ebookService.updateProgress(id, { last_page: lastPage, percentage })
      } catch (e) {
        // Silent fail is acceptable for progress auto-save
        console.warn('Failed to save reading progress', e)
      }
    },

    async toggleFavorite(id) {
      try {
        const { data } = await ebookService.toggleFavorite(id)
        if (this.currentEbook?.id === id) {
          this.currentEbook.is_favorited = data.is_favorited
        }
        return { success: true, isFavorited: data.is_favorited, message: data.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Action failed.' }
      }
    },

    async fetchFavorites(page = 1) {
      this.loading = true
      try {
        const { data } = await ebookService.getMyFavorites({ page })
        this.favorites = data.data
        this.favPagination = {
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
        }
      } catch (e) {
        this.error = e.response?.data?.message || 'Failed to load favorites.'
      } finally {
        this.loading = false
      }
    },
  },
})
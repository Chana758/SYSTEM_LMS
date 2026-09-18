import { defineStore } from 'pinia'
import { recommendationService } from '../services/recommendationService'

export const useRecommendationStore = defineStore('recommendation', {
  state: () => ({
    books: [],
    reason: '',
    reasonLabel: '',
    loading: false,
    error: '',
  }),

  actions: {
    async fetchRecommendations() {
      this.loading = true
      this.error = ''
      try {
        const { data } = await recommendationService.getRecommendations()
        this.books = data.data
        this.reason = data.reason
        this.reasonLabel = data.reason_label
      } catch (e) {
        this.error = e.response?.data?.message || 'Failed to load recommendations.'
        this.books = []
      } finally {
        this.loading = false
      }
    },

    // Fire-and-forget click tracking — never blocks navigation to the book.
    trackClick(bookId) {
      recommendationService.markClicked(bookId).catch(() => {})
    },
  },
})
import apiClient from '@/api/axios'

export const recommendationService = {
  getRecommendations() {
    return apiClient.get('/recommendations')
  },

  markClicked(bookId) {
    return apiClient.post(`/recommendations/${bookId}/click`)
  },
}
import apiClient from '@/api/axios'

export const chatbotService = {
  sendMessage(message) {
    return apiClient.post('/chatbot', { message })
  },

  getHistory(params = {}) {
    return apiClient.get('/chatbot/history', { params })
  },

  clearHistory() {
    return apiClient.delete('/chatbot/history')
  },
}
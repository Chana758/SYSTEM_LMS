import api from '@/api/axios'

export const preferenceService = {
  getPreferences() {
    return api.get('/auth/profile/preferences')
  },
  updatePreferences(payload) {
    return api.put('/auth/profile/preferences', payload)
  },
}
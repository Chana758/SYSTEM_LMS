import api from '@/api/axios'

export const settingService = {
  /**
   * Fetch all settings, optionally filtered by group.
   * Librarian responses are automatically filtered server-side.
   */
  getSettings(group = null) {
    return api.get('/settings', { params: group ? { group } : {} })
  },

  // Admin only
  createSetting(payload) {
    return api.post('/settings', payload)
  },

  // Admin only
  updateSetting(id, value) {
    return api.put(`/settings/${id}`, { value })
  },

  // Admin only
  deleteSetting(id) {
    return api.delete(`/settings/${id}`)
  },
} 
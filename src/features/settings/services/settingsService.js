import api from '@/api/axios'

export const settingService = {
  getSettings(group = null) {
    return api.get('/settings', { params: group ? { group } : {} })
  },
  createSetting(payload) {
    return api.post('/settings', payload)
  },
  updateSetting(id, value) {
    return api.put(`/settings/${id}`, { value })
  },
  deleteSetting(id) {
    return api.delete(`/settings/${id}`)
  },

  // NEW — public, no auth required
  getBranding() {
    return api.get('/branding')
  },

  // NEW — admin only, multipart because of optional logo file
  updateBranding(formData) {
    return api.post('/settings/branding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
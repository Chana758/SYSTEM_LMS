import api from '@/api/axios'

// Laravel expects strings here, so convert booleans/numbers before sending
const toStr = (v) => (v === null || v === undefined ? null : String(v))

export const settingService = {
  // Fetch settings (optionally filtered by group)
  getSettings(group = null) {
    return api.get('/settings', { params: group ? { group } : {} })
  },

  // Create a new setting (admin)
  createSetting(payload) {
    return api.post('/settings', { ...payload, value: toStr(payload.value) })
  },

  // Update the value of one setting (admin)
  updateSetting(id, value) {
    return api.put(`/settings/${id}`, { value: toStr(value) })
  },

  // Delete one setting (admin)
  deleteSetting(id) {
    return api.delete(`/settings/${id}`)
  },

  // Get logo and site name (public)
  getBranding() {
    return api.get('/branding')
  },

  // Update branding (admin, multipart because of the optional logo file)
  updateBranding(formData) {
    return api.post('/settings/branding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
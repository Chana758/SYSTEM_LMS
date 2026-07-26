import api from '@/api/axios'

export const membershipTypeService = {
  getAll(activeOnly = false) {
    return api.get('/membership-types', { params: activeOnly ? { active_only: 1 } : {} })
  },
  create(payload) {
    return api.post('/membership-types', payload)
  },
  update(id, payload) {
    return api.put(`/membership-types/${id}`, payload)
  },
  delete(id) {
    return api.delete(`/membership-types/${id}`)
  },
}
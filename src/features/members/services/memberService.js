import api from '@/api/axios'

export const memberService = {
  getAll(params = {}) {
    return api.get('/members', { params })
  },
  getOne(id) {
    return api.get(`/members/${id}`)
  },
  create(payload) {
    return api.post('/members', payload)
  },
  update(id, payload) {
    return api.put(`/members/${id}`, payload)
  },
  delete(id) {
    return api.delete(`/members/${id}`)
  },
  restore(id) {
    return api.post(`/members/${id}/restore`)
  },

  // Self-service — logged-in member views their own profile (read-only)
  getMyProfile() {
    return api.get('/member/profile')
  },
}
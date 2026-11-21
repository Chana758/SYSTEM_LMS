import apiClient from '@/api/axios'

// Library door: kiosk check-in/out, visits, kiosk devices, login logs (Sam, B4.4-B4.9)
export const visitService = {
  // Kiosk tablet (role "kiosk")
  kioskMe() {
    return apiClient.get('/kiosk/me')
  },
  kioskScan(code) {
    return apiClient.post('/kiosk/scan', { code })
  },
  kioskGuest(payload) {
    return apiClient.post('/kiosk/guest', payload)
  },
  kioskGuests() {
    return apiClient.get('/kiosk/guests')
  },
  kioskGuestOut(visitId) {
    return apiClient.post(`/kiosk/guests/${visitId}/out`)
  },

  // Member
  myCardCode() {
    return apiClient.get('/my-card/code')
  },
  myVisits() {
    return apiClient.get('/my-visits')
  },
  myLoginLogs() {
    return apiClient.get('/auth/my-login-logs')
  },

  // Staff
  list(params = {}) {
    return apiClient.get('/visits', { params })
  },
  stats(params = {}) {
    return apiClient.get('/visits/stats', { params })
  },
  checkIn(payload) {
    return apiClient.post('/visits/check-in', payload)
  },
  checkOut(visitId) {
    return apiClient.post(`/visits/${visitId}/check-out`)
  },

  // Admin
  devices() {
    return apiClient.get('/kiosk-devices')
  },
  createDevice(payload) {
    return apiClient.post('/kiosk-devices', payload)
  },
  updateDevice(id, payload) {
    return apiClient.put(`/kiosk-devices/${id}`, payload)
  },
  deleteDevice(id) {
    return apiClient.delete(`/kiosk-devices/${id}`)
  },
  resetDevicePassword(id) {
    return apiClient.post(`/kiosk-devices/${id}/reset-password`)
  },
  doorKey(id) {
    return apiClient.post(`/kiosk-devices/${id}/door-key`)
  },
  testDoor(id) {
    return apiClient.post(`/kiosk-devices/${id}/test-door`)
  },
  settings() {
    return apiClient.get('/visit-settings')
  },
  saveSettings(payload) {
    return apiClient.put('/visit-settings', payload)
  },
  loginLogs(params = {}) {
    return apiClient.get('/login-logs', { params })
  },
  loginSummary() {
    return apiClient.get('/login-logs/summary')
  },
}

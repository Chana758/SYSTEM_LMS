import api from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const securityService = {
  // Mirrors what authStore.changePassword() calls internally — kept here
  // for consistency with other settings services, in case a component
  // needs to call it directly without going through the store.
  changePassword(payload) {
    return api.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload)
  },
}
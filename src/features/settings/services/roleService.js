import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

export const roleService = {
  // PATCH /users/{userId}/role   (admin only)
  // payload: { role: 'admin' | 'librarian' | 'member', note?: string }
  changeRole(userId, payload) {
    return apiClient.patch(ENDPOINTS.USERS.CHANGE_ROLE(userId), payload)
  },
}
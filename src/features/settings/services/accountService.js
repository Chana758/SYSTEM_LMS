import api from '@/api/axios'

export const accountService = {
  updateAccount(payload) {
    return api.put('/auth/profile/account', payload)
  },
}
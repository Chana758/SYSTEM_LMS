import apiClient from '@/api/axios'
import { ENDPOINTS } from '@/api/endpoints'

// Block 1 staff tools: approve new registrations (B2.3) and import from Excel (B2.1)
export const memberAccountService = {
  pending(params = {}) {
    return apiClient.get(ENDPOINTS.MEMBER_ACCOUNTS.PENDING, { params })
  },
  approve(memberId, payload) {
    return apiClient.post(ENDPOINTS.MEMBER_ACCOUNTS.APPROVE(memberId), payload)
  },
  reject(memberId, reason = '') {
    return apiClient.post(ENDPOINTS.MEMBER_ACCOUNTS.REJECT(memberId), { reason })
  },
  // dryRun = true only checks the rows and returns errors
  import(file, dryRun) {
    const form = new FormData()
    form.append('file', file)
    form.append('dry_run', dryRun ? '1' : '0')
    // The client default is JSON, which would turn the file into "{}".
    // A file of a few hundred rows can also take longer than the 10 s default.
    return apiClient.post(ENDPOINTS.MEMBER_ACCOUNTS.IMPORT, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    })
  },
}

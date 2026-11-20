import api from '@/api/axios'

export const backupService = {
  // Admin only — downloads a .sql file blob
  createBackup() {
    return api.get('/settings/backup/create', {
      responseType: 'blob',
    })
  },

  // Admin + Librarian — paginated backup history log
  getHistory(page = 1) {
    return api.get('/settings/backup/history', { params: { page } })
  },
}
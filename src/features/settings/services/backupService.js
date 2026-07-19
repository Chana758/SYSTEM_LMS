import api from '@/api/axios'

export const backupService = {
  // Admin only — downloads a .sql file blob
  createBackup() {
    return api.get('/settings/backup/create', {
      responseType: 'blob',
    })
  },

  // Admin only
  restoreBackup(file) {
    const formData = new FormData()
    formData.append('backup_file', file)
    // FIX: backend now requires a typed 'confirm=RESTORE' field as a
    // server-side check to match the frontend confirmation modal.
    formData.append('confirm', 'RESTORE')

    return api.post('/settings/backup/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Admin + Librarian — paginated backup history log
  getHistory(page = 1) {
    return api.get('/settings/backup/history', { params: { page } })
  },
}
import { defineStore } from 'pinia'
import { notificationService } from '../services/notificationService'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    pagination: { current_page: 1, last_page: 1, total: 0, per_page: 15 },
    loading: false,
    error: null,
  }),

  actions: {
    async fetchNotifications(page = 1, params = {}) {
      this.loading = true
      this.error = null
      const result = await notificationService.getNotifications({ page, ...params })
      this.loading = false
      if (result.success) {
        this.notifications = result.data.data || []
        this.pagination = {
          current_page: result.data.current_page || 1,
          last_page: result.data.last_page || 1,
          total: result.data.total || 0,
          per_page: result.data.per_page || 15,
        }
      } else {
        this.error = result.message
      }
      return result
    },

    async fetchUnreadCount() {
      const result = await notificationService.getUnreadCount()
      if (result.success) this.unreadCount = result.data.count || 0
      return result
    },

    async fetchNotification(id) {
      const result = await notificationService.getNotification(id)
      if (result.success) {
        this.notifications = this.notifications.map((n) =>
          n.id == id ? { ...n, is_read: true } : n
        )
        this.fetchUnreadCount()
      }
      return result
    },

    async markRead(id) {
      const result = await notificationService.markRead(id)
      if (result.success) {
        this.notifications = this.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
        this.fetchUnreadCount()
      }
      return result
    },

    async markAllRead() {
      const result = await notificationService.markAllRead()
      if (result.success) {
        this.notifications = this.notifications.map((n) => ({ ...n, is_read: true }))
        this.unreadCount = 0
      }
      return result
    },

    async deleteNotification(id) {
      const result = await notificationService.deleteNotification(id)
      if (result.success) {
        this.notifications = this.notifications.filter((n) => n.id != id)
        this.pagination.total = Math.max(0, this.pagination.total - 1)
        this.fetchUnreadCount()
      }
      return result
    },

    async sendNotification(payload) {
      const result = await notificationService.sendNotification(payload)
      if (result.success) {
        this.fetchUnreadCount()
      }
      return result
    },
  },
})
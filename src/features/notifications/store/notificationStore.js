import { defineStore } from 'pinia'
import { notificationService } from '../services/notificationService'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    loading: false,
  }),

  actions: {
    async fetchNotifications(page = 1, params = {}) {
      this.loading = true
      const result = await notificationService.getNotifications({ page, ...params })
      this.loading = false
      if (result.success) {
        this.notifications = result.data.data
        this.pagination = {
          current_page: result.data.current_page,
          last_page: result.data.last_page,
          total: result.data.total,
        }
      }
      return result
    },

    async fetchUnreadCount() {
      const result = await notificationService.getUnreadCount()
      if (result.success) this.unreadCount = result.data.count
      return result
    },

    async fetchNotification(id) {
      const result = await notificationService.getNotification(id)
      if (result.success) {
        this.notifications = this.notifications.map((n) => (n.id == id ? { ...n, is_read: true } : n))
        this.fetchUnreadCount()
      }
      return result
    },

    async markRead(id) {
      const result = await notificationService.markRead(id)
      if (result.success) {
        this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
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
      }
      return result
    },

    async sendNotification(payload) {
      return notificationService.sendNotification(payload)
    },
  },
})
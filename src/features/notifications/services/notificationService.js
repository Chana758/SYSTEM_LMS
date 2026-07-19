import notificationApi from './notificationApi'

function extractError(error) {
  const response = error?.response
  return {
    success: false,
    message: response?.data?.message || 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។',
    errors: response?.data?.errors || {},
  }
}

export const notificationService = {
  async getNotifications(params) {
    try {
      const { data } = await notificationApi.index(params)
      return { success: true, data }
    } catch (error) {
      return extractError(error)
    }
  },
  async getUnreadCount() {
    try {
      const { data } = await notificationApi.unreadCount()
      return { success: true, data }
    } catch (error) {
      return extractError(error)
    }
  },
  async getNotification(id) {
    try {
      const { data } = await notificationApi.show(id)
      return { success: true, data }
    } catch (error) {
      return extractError(error)
    }
  },
  async markRead(id) {
    try {
      const { data } = await notificationApi.markRead(id)
      return { success: true, message: data.message, data: data.data }
    } catch (error) {
      return extractError(error)
    }
  },
  async markAllRead() {
    try {
      const { data } = await notificationApi.markAllRead()
      return { success: true, message: data.message }
    } catch (error) {
      return extractError(error)
    }
  },
  async deleteNotification(id) {
    try {
      const { data } = await notificationApi.destroy(id)
      return { success: true, message: data.message }
    } catch (error) {
      return extractError(error)
    }
  },
  async sendNotification(payload) {
    try {
      const { data } = await notificationApi.send(payload)
      return { success: true, message: data.message }
    } catch (error) {
      return extractError(error)
    }
  },
}
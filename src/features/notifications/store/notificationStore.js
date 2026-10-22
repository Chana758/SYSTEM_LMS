import { defineStore } from 'pinia'
import { notificationService } from '../services/notificationService'
import { useAuthStore } from '@/features/auth/store/authStore'

const PREF_KEY = 'notification_prefs'
const DEFAULT_PREFS = () => ({ browserPush: false, muted: [] })

// Preferences are stored per user so two accounts on one browser don't share settings.
const prefKey = () => {
  try {
    const id = useAuthStore().user?.id
    return id ? `${PREF_KEY}_${id}` : PREF_KEY
  } catch {
    return PREF_KEY
  }
}

const loadPrefs = () => {
  try {
    const s = JSON.parse(localStorage.getItem(prefKey()) || '{}')
    return { browserPush: !!s.browserPush, muted: Array.isArray(s.muted) ? s.muted : [] }
  } catch {
    return DEFAULT_PREFS()
  }
}

// Highest notification id already seen/pushed (not reactive on purpose).
let lastPushedId = 0

const canPush = () =>
  typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],          // full list page
    recent: [],                 // dropdown (8 latest, muted types hidden)
    recentLoading: false,
    unreadCount: 0,
    unreadByType: {},
    pagination: { current_page: 1, last_page: 1, total: 0, per_page: 15 },
    loading: false,
    error: null,
    prefs: loadPrefs(),
  }),

  getters: {
    mutedParams: (s) => (s.prefs.muted.length ? s.prefs.muted : undefined),
  },

  actions: {
    /* ---------------- preferences ---------------- */
    // Re-read prefs for the currently logged-in user (call after login / on init).
    loadUserPrefs() {
      this.prefs = loadPrefs()
    },

    savePrefs(patch) {
      this.prefs = { ...this.prefs, ...patch }
      localStorage.setItem(prefKey(), JSON.stringify(this.prefs))
      this.fetchUnreadCount()
      this.fetchRecent()
    },

    toggleMute(type) {
      const muted = this.prefs.muted.includes(type)
        ? this.prefs.muted.filter((x) => x !== type)
        : [...this.prefs.muted, type]
      this.savePrefs({ muted })
    },

    // Returns 'granted' | 'denied' | 'unsupported'
    async setBrowserPush(on) {
      if (!on) { this.savePrefs({ browserPush: false }); return 'granted' }
      if (!('Notification' in window)) return 'unsupported'
      const perm = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission()
      if (perm !== 'granted') return 'denied'
      this.savePrefs({ browserPush: true })
      return 'granted'
    },

    /* ---------------- fetching ---------------- */
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

    async fetchRecent() {
      this.recentLoading = true
      const result = await notificationService.getNotifications({
        page: 1, per_page: 8, exclude_types: this.mutedParams,
      })
      this.recentLoading = false
      if (result.success) this.recent = result.data.data || []
      return result
    },

    async fetchUnreadCount() {
      const result = await notificationService.getUnreadCount({ exclude_types: this.mutedParams })
      if (result.success) {
        this.unreadCount = result.data.count || 0
        this.unreadByType = result.data.by_type || {}
      }
      return result
    },

    async fetchNotification(id) {
      const result = await notificationService.getNotification(id)
      if (result.success) {
        this._patch(id, { is_read: true })
        this.fetchUnreadCount()
      }
      return result
    },

    /* ---------------- polling + browser push ---------------- */
    async init() {
      this.loadUserPrefs()
      await this.fetchUnreadCount()
      const r = await notificationService.getNotifications({ page: 1, per_page: 1 })
      if (r.success && r.data.data?.length) lastPushedId = Number(r.data.data[0].id) || 0
    },

    async poll() {
      const prev = this.unreadCount
      const r = await this.fetchUnreadCount()
      if (!r.success || this.unreadCount <= prev) return

      const fresh = await notificationService.getNotifications({
        page: 1, per_page: 5, is_read: false, exclude_types: this.mutedParams,
      })
      if (!fresh.success) return

      const items = (fresh.data.data || [])
        .filter((n) => Number(n.id) > lastPushedId)
        .reverse() // oldest first

      if (items.length) {
        lastPushedId = Math.max(lastPushedId, ...items.map((n) => Number(n.id)))
        this.fetchRecent()
        if (this.prefs.browserPush && canPush()) {
          items.forEach((n) => new Notification(n.title, { body: n.message, tag: `notif-${n.id}` }))
        }
      }
    },

    /* ---------------- mutations ---------------- */
    async markRead(id) {
      const result = await notificationService.markRead(id)
      if (result.success) {
        this._patch(id, { is_read: true })
        this.fetchUnreadCount()
      }
      return result
    },

    async markAllRead() {
      const result = await notificationService.markAllRead()
      if (result.success) {
        const read = (n) => ({ ...n, is_read: true })
        this.notifications = this.notifications.map(read)
        this.recent = this.recent.map(read)
        this.unreadCount = 0
        this.unreadByType = {}
      }
      return result
    },

    async deleteNotification(id) {
      const result = await notificationService.deleteNotification(id)
      if (result.success) {
        this.notifications = this.notifications.filter((n) => n.id != id)
        this.recent = this.recent.filter((n) => n.id != id)
        this.pagination.total = Math.max(0, this.pagination.total - 1)
        this.fetchUnreadCount()
      }
      return result
    },

    async sendNotification(payload) {
      const result = await notificationService.sendNotification(payload)
      if (result.success) this.fetchUnreadCount()
      return result
    },

    _patch(id, patch) {
      const apply = (n) => (n.id == id ? { ...n, ...patch } : n)
      this.notifications = this.notifications.map(apply)
      this.recent = this.recent.map(apply)
    },
  },
})
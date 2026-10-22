export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGIN_QR: '/auth/login/qr',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CREATE_LIBRARIAN: '/auth/create-librarian',
    UPDATE_AVATAR: '/auth/profile/avatar',
    REMOVE_AVATAR: '/auth/profile/avatar',
    UPDATE_ACCOUNT: '/auth/profile/account',
    CHANGE_PASSWORD: '/auth/change-password',
    QR_TOKEN_STATUS: '/auth/qr-token/status',
    QR_TOKEN_REVOKE: '/auth/qr-token/revoke',
    QR_TOKEN_GENERATE_FOR: (userId) => `/auth/users/${userId}/qr-token/generate`,
    PENDING_CARDS: '/auth/pending-cards',
  },

  MEMBERS: {
    LIST: '/members',
    CREATE: '/members',
    SHOW: (id) => `/members/${id}`,
    UPDATE: (id) => `/members/${id}`,
    DELETE: (id) => `/members/${id}`,
    RESTORE: (id) => `/members/${id}/restore`,
    MY_PROFILE: '/member/profile',
  },

  LIBRARIANS: {
    LIST: '/librarians',
    CREATE: '/librarians',
    SHOW: (id) => `/librarians/${id}`,
    UPDATE: (id) => `/librarians/${id}`,
    DELETE: (id) => `/librarians/${id}`,
  },
  USERS: {
    CHANGE_ROLE: (userId) => `/users/${userId}/role`,
  },
  BOOKS: {
    LIST: '/books',
    CREATE: '/books',
    SHOW: (id) => `/books/${id}`,
    UPDATE: (id) => `/books/${id}`,
    DELETE: (id) => `/books/${id}`,
    ADD_COPIES: (id) => `/books/${id}/add-copies`,
    POPULAR: '/books/popular',
    REVIEWS: (id) => `/books/${id}/reviews`,
  },
  BOOK_COPIES: {
    UPDATE: (id) => `/book-copies/${id}`,
    DELETE: (id) => `/book-copies/${id}`,
  },

  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },

  MEMBERSHIP_TYPES: {
    LIST: '/membership-types',
    CREATE: '/membership-types',
    UPDATE: (id) => `/membership-types/${id}`,
    DELETE: (id) => `/membership-types/${id}`,
  },

  BORROWS: {
    LIST: '/borrows',
    OVERDUE: '/borrows/overdue',
    CREATE: '/borrows',
    SHOW: (id) => `/borrows/${id}`,
    RETURN: (id) => `/borrows/${id}/return`,
    RENEW: (id) => `/borrows/${id}/renew`,
    MY_BORROWS: '/my-borrows',
  },

  RESERVATIONS: {
    LIST: '/reservations',
    STATS: '/reservations/stats',
    MY_LIST: '/reservations/my-list',
    CREATE: '/reservations',
    SHOW: (id) => `/reservations/${id}`,
    CANCEL: (id) => `/reservations/${id}/cancel`,
    FULFILL: (id) => `/reservations/${id}/fulfill`,
  },

  FINES: {
    LIST: '/fines',
    SUMMARY: '/fines/summary',
    CREATE: '/fines',
    SHOW: (id) => `/fines/${id}`,
    UPDATE: (id) => `/fines/${id}`,
    PAY: (id) => `/fines/${id}/pay`,
    WAIVE: (id) => `/fines/${id}/waive`,
    MY_FINES: '/my-fines',
  },

  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    SHOW: (id) => `/notifications/${id}`,
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id) => `/notifications/${id}`,
    SEND: '/notifications',
  },

  EBOOKS: {
    LIST: '/ebooks',
    CREATE: '/ebooks',
    SHOW: (id) => `/ebooks/${id}`,
    UPDATE: (id) => `/ebooks/${id}`,
    DELETE: (id) => `/ebooks/${id}`,
    DOWNLOAD: (id) => `/ebooks/${id}/download`,
    GET_PROGRESS: (id) => `/ebooks/${id}/progress`,
    UPDATE_PROGRESS: (id) => `/ebooks/${id}/progress`,
    TOGGLE_FAVORITE: (id) => `/ebooks/${id}/favorite`,
    MY_FAVORITES: '/my-favorites',
  },

  PREFERENCES: {
    SHOW: '/auth/profile/preferences',
    UPDATE: '/auth/profile/preferences',
  },

  SETTINGS: {
    BRANDING: '/branding',
    UPDATE_BRANDING: '/settings/branding',
    LIST: '/settings',
    CREATE: '/settings',
    UPDATE: (id) => `/settings/${id}`,
    DELETE: (id) => `/settings/${id}`,
  },

  BACKUP: {
    HISTORY: '/settings/backup/history',
    CREATE: '/settings/backup/create',
    RESTORE: '/settings/backup/restore',
  },

  REPORTS: {
    DASHBOARD: '/admin/reports/dashboard',
    BORROW: '/admin/reports/borrow',
    FINE: '/admin/reports/fine',
    USER: '/admin/reports/user',
    REVENUE: '/admin/reports/revenue',
    STOCK: '/admin/reports/stock',
    EXPORT: '/admin/reports/export',
    LIST: '/admin/reports',
    DELETE: (id) => `/admin/reports/${id}`,
  },

  SCAN: {
    STORE: '/scan',
    HISTORY: '/scan/history',
    SUMMARY: '/scan/summary',
  },

  DASHBOARD: {
    STATS: '/dashboard',
    RECENT_ACTIVITIES: '/dashboard/recent-activities',
    REVENUE_CHART: '/dashboard/revenue-chart',
  },

  CHATBOT: {
    HISTORY: '/chatbot/history',
    SEND: '/chatbot',
    CLEAR_HISTORY: '/chatbot/history',
  },

  RECOMMENDATIONS: {
    LIST: '/recommendations',
    MARK_CLICKED: (bookId) => `/recommendations/${bookId}/click`,
  },
}
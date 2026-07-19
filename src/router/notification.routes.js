export default [
  {
    path: '/notifications',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth' },
    children: [
      { path: '', name: 'notification-list', component: () => import('@/features/notifications/pages/NotificationListPage.vue') },
      { path: 'settings', name: 'notification-settings', component: () => import('@/features/notifications/pages/NotificationSettingsPage.vue') },
      { path: ':id', name: 'notification-detail', component: () => import('@/features/notifications/pages/NotificationDetailPage.vue') },
    ],
  },
]
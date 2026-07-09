export default [
  {
    path: '/notifications',
    name: 'notifications.list',
    component: () => import('@/features/notifications/pages/NotificationListPage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/notifications/:id',
    name: 'notifications.detail',
    component: () => import('@/features/notifications/pages/NotificationDetailPage.vue'),
    meta: { middleware: 'auth' },
    props: true,
  },
  {
    path: '/notifications/settings',
    name: 'notifications.settings',
    component: () => import('@/features/notifications/pages/NotificationSettingsPage.vue'),
    meta: { middleware: 'auth' },
  },
]
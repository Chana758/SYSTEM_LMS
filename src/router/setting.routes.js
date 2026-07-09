// router/setting.routes.js
import AdminLayout from '@/layouts/AdminLayout.vue'

export default [
  {
    path: '/settings',
    component: AdminLayout,
    redirect: '/settings/profile',
    children: [
      {
        path: 'profile',
        name: 'settings.profile',
        component: () => import('@/features/settings/pages/ProfilePage.vue'),
        meta: { middleware: 'auth' },
      },
      {
        path: 'security',
        name: 'settings.security',
        component: () => import('@/features/settings/pages/SecurityPage.vue'),
        meta: { middleware: 'auth' },
      },
      {
        path: 'backup',
        name: 'settings.backup',
        component: () => import('@/features/settings/pages/BackupPage.vue'),
        meta: { middleware: 'auth', roles: ['admin'] },
      },
    ],
  },
]
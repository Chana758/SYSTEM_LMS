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
        path: 'account',
        name: 'settings.account',
        component: () => import('@/features/settings/pages/AccountPage.vue'),
        meta: { middleware: 'auth' },
      },
      {
        path: 'security',
        name: 'settings.security',
        component: () => import('@/features/settings/pages/SecurityPage.vue'),
        meta: { middleware: 'auth' },
      },
      // FIX: was completely missing — matches backend
      // GET/PUT /auth/profile/preferences (auth:sanctum only, no role
      // restriction). Without this route, the "Preferences" link in
      // SettingsNav.vue had nowhere valid to navigate to for ANY role.
      {
        path: 'preferences',
        name: 'settings.preferences',
        component: () => import('@/features/settings/pages/PreferencesPage.vue'),
        meta: { middleware: 'auth' },
      },
      // FIX: was completely missing — matches backend
      // GET /settings with role:admin,librarian middleware. Without this
      // route, the "System Settings" link had nowhere to navigate to,
      // even though SettingsNav.vue already gates it to admin/librarian.
      {
        path: 'system',
        name: 'settings.system',
        component: () => import('@/features/settings/pages/SystemSettingsPage.vue'),
        meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
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
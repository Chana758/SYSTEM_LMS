// Library door: kiosk, visits, digital card, login logs (Sam, B4.2-B4.9)
export default [
  {
    // Full-screen tablet at the door. No sidebar; the "kiosk" account sees only this page.
    path: '/kiosk',
    name: 'kiosk',
    component: () => import('@/features/visits/pages/KioskPage.vue'),
    meta: { middleware: 'auth', roles: ['kiosk'] },
  },
  {
    path: '/visits',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'visits', component: () => import('@/features/visits/pages/VisitsPage.vue') },
    ],
  },
  {
    path: '/my-card',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['member'] },
    children: [
      { path: '', name: 'my-card', component: () => import('@/features/visits/pages/MyCardPage.vue') },
    ],
  },
  {
    path: '/login-logs',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin'] },
    children: [
      { path: '', name: 'login-logs', component: () => import('@/features/visits/pages/LoginLogsPage.vue') },
    ],
  },
]

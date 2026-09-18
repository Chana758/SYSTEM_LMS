export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/pages/LoginPage.vue'),
    meta: { middleware: 'guest' },
  },
  {
    path: '/login/qr',
    name: 'login-qr',
    component: () => import('@/features/auth/pages/QrLoginPage.vue'),
    meta: { middleware: 'guest' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/features/auth/pages/RegisterPage.vue'),
    meta: { middleware: 'guest' },
  },
  
  {
    path: '/remote-login/:sessionId',
    name: 'remote-login',
    component: () => import('@/features/auth/pages/RemoteLoginMobilePage.vue'),
  },
]
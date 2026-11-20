export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/pages/LoginPage.vue'),
    meta: { middleware: 'guest' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/features/auth/pages/RegisterPage.vue'),
    meta: { middleware: 'guest' },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/features/auth/pages/ForgotPasswordPage.vue'),
    meta: { middleware: 'guest' },
  },
  {
    path: '/reset-password/:token?',
    name: 'reset-password',
    component: () => import('@/features/auth/pages/ResetPasswordPage.vue'),
    meta: { middleware: 'guest' },
  },
]
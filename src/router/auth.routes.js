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
    // B2.2: imported students set their password + PIN
    path: '/activate',
    name: 'activate-account',
    component: () => import('@/features/auth/pages/ActivateAccountPage.vue'),
    meta: { middleware: 'guest' },
  },
  {
    // B2.6: forced password change after a temporary password
    path: '/change-password',
    name: 'force-change-password',
    component: () => import('@/features/auth/pages/ForceChangePasswordPage.vue'),
    meta: { middleware: 'auth' },
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
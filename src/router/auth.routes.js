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
]
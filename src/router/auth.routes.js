export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/pages/LoginPage.vue'),
    meta: { middleware: 'guest' },
  },
  // FIX: was missing — QrLoginPage.vue (dedicated kiosk mode) exists as
  // a page file but had no route pointing to it. The <router-link
  // :to="{ name: 'login' }"> inside it doesn't need this, but nothing
  // else in the app could navigate here (e.g. a "Kiosk Mode" link on a
  // front-desk shared computer) without this route being registered.
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
]
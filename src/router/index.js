import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/middleware/auth'
import { guestGuard } from '@/middleware/guest'

import authRoutes from './auth.routes'
import dashboardRoutes from './dashboard.routes'
import settingsRoutes from './setting.routes'   

const routes = [
  { path: '/', redirect: '/dashboard' },
  ...authRoutes,
  ...dashboardRoutes,
  ...settingsRoutes,   
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.middleware === 'auth') return authGuard(to)
  if (to.meta.middleware === 'guest') return guestGuard(to)
})

export default router
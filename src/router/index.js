import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/middleware/auth'
import { guestGuard } from '@/middleware/guest'
import { roleGuard } from '@/middleware/role'
import { useAuthStore } from '@/features/auth/store/authStore'

import authRoutes from './auth.routes'
import dashboardRoutes from './dashboard.routes'
import settingsRoutes from './setting.routes'
import memberRoutes from './member.routes'
import staffRoutes from './staff.routes'
import catalogRoutes from './catalog.routes'
import circulationRoutes from './circulation.routes'
import fineRoutes from './fine.routes'
import reservationRoutes from './reservation.routes'
import notificationRoutes from './notification.routes'
import digitalLibraryRoutes from './digital-library.routes'
// FIX: was missing — scanner.routes.js already existed on disk with
// /scanner and /scanner/history defined, but nothing imported it here,
// so Vue Router had no matching route and clicking "Scanner" in the
// sidebar would fall through to a 404 / NotFound page.
import scannerRoutes from './scanner.routes'
import reportRoutes from './report.routes'

const routes = [
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return { name: 'login' }
      }

      if (['admin', 'librarian'].includes(authStore.role)) {
        return { name: 'dashboard' }
      }

      // Members have no access to /dashboard — send them to their own landing page.
      return { name: 'my-borrows-page' }
    },
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/features/auth/pages/UnauthorizedPage.vue'),
  },
  ...authRoutes,
  ...dashboardRoutes,
  ...settingsRoutes,
  ...memberRoutes,
  ...staffRoutes,
  ...catalogRoutes,
  ...circulationRoutes,
  ...fineRoutes,
  ...reservationRoutes,
  ...notificationRoutes,
  ...digitalLibraryRoutes,
  ...scannerRoutes, // FIX: register scanner routes
  ...reportRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.middleware === 'auth') {
    const authResult = authGuard(to)
    if (authResult) return authResult
    return roleGuard(to)
  }

  if (to.meta.middleware === 'guest') {
    return guestGuard(to)
  }
})

export default router
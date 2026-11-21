import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/middleware/auth'
import { guestGuard } from '@/middleware/guest'
import { roleGuard } from '@/middleware/role'
import { demoGuard } from '@/middleware/demo'
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
import scannerRoutes from './scanner.routes'
import reportRoutes from './report.routes'
import chatbotRoutes from './chatbot.routes'
import aiRecommendationRoutes from './ai-recommendation.routes'
import visitRoutes from './visits.routes'

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

      // The door tablet only ever shows the kiosk screen
      if (authStore.role === 'kiosk') {
        return { name: 'kiosk' }
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
  ...scannerRoutes,
  ...reportRoutes,
  ...chatbotRoutes,
  ...aiRecommendationRoutes,
  ...visitRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  // B2.6: nothing else opens until a temporary password is replaced
  const auth = useAuthStore()
  if (
    auth.isAuthenticated &&
    auth.mustChangePassword &&
    to.meta.middleware === 'auth' &&
    to.name !== 'force-change-password'
  ) {
    return { name: 'force-change-password' }
  }

  // A kiosk account must not wander into other pages
  if (auth.isAuthenticated && auth.role === 'kiosk' && to.meta.middleware === 'auth' && to.name !== 'kiosk') {
    return { name: 'kiosk' }
  }

  if (to.meta.middleware === 'auth') {
    // Order matters: login check -> role check -> demo restriction
    return authGuard(to) || roleGuard(to) || demoGuard(to)
  }

  if (to.meta.middleware === 'guest') {
    return guestGuard(to)
  }
})

export default router
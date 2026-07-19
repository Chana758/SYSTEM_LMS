import { useAuthStore } from '@/features/auth/store/authStore'

/**
 * Ensures the user is authenticated before accessing a protected route.
 * Must be used with route metadata: meta: { middleware: 'auth' }
 *
 * NOTE: This guard is responsible for AUTHENTICATION only (is the user
 * logged in?). Role-based AUTHORIZATION (is this user allowed to see
 * this specific route?) is handled separately by roleGuard, which runs
 * immediately after this guard in router/index.js.
 *
 * Do NOT add role checks here. A previous version of this guard
 * redirected unauthorized users back to { name: 'dashboard' }, but since
 * /dashboard itself can be role-restricted, a user without access would
 * be redirected back to the very route that just rejected them —
 * causing an infinite redirect loop. roleGuard correctly redirects to
 * /unauthorized instead, which has no role restriction and safely
 * breaks the loop.
 */
export function authGuard(to) {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return { name: 'login' }
  }
}
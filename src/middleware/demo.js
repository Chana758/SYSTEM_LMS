import { useAuthStore } from '@/features/auth/store/authStore'

// Pages that do nothing useful for a read-only demo account.
// Shared by the sidebar (hides the link) and the route guard (blocks the URL).
export const DEMO_HIDDEN_PATHS = [
  '/settings/backup',
  '/settings/card-approvals',
  '/chatbot',
  '/scanner',
]

export function isDemoHiddenPath(path) {
  return DEMO_HIDDEN_PATHS.some((p) => path === p || path.startsWith(p + '/'))
}

export function demoGuard(to) {
  const authStore = useAuthStore()

  if (authStore.isDemo && isDemoHiddenPath(to.path)) {
    return { name: 'unauthorized' }
  }
}

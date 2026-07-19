import { useAuthStore } from '@/features/auth/store/authStore'

export function roleGuard(to) {
  const authStore = useAuthStore()

  const allowedRoles = to.meta.roles
  if (!allowedRoles || allowedRoles.length === 0) {
    return
  }

  if (!allowedRoles.includes(authStore.role)) {
    return { name: 'unauthorized' }
  }
}
import { useAuthStore } from '@/features/auth/store/authStore'

export function guestGuard(to, from) {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
}
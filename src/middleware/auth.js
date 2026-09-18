import { useAuthStore } from '@/features/auth/store/authStore'

export function authGuard(to) {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return { name: 'login' }
  }
}
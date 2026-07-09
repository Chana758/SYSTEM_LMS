import { useAuthStore } from '@/features/auth/store/authStore'

export function authGuard(to, from) {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return { name: 'login' }
  }
}
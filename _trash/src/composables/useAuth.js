import { computed } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'

export function useAuth() {
  const auth = useAuthStore()
  const user = computed(() => auth.user)
  const role = computed(() => auth.user?.role)
  const isAuthenticated = computed(() => !!auth.token)
  const hasRole = (...roles) => roles.includes(role.value)

  return { user, role, isAuthenticated, hasRole }
}
<template>
  <nav class="w-56 flex-shrink-0">
    <RouterLink
      to="/settings/profile"
      class="block px-4 py-2.5 rounded-lg text-sm font-medium mb-1"
      :class="isActive('/settings/profile')
        ? 'bg-green-700 text-white'
        : 'text-gray-700 hover:bg-gray-100'"
    >
      Profile
    </RouterLink>

    <RouterLink
      to="/settings/security"
      class="block px-4 py-2.5 rounded-lg text-sm font-medium mb-1"
      :class="isActive('/settings/security')
        ? 'bg-green-700 text-white'
        : 'text-gray-700 hover:bg-gray-100'"
    >
      Security
    </RouterLink>

    <RouterLink
      v-if="authStore.role === 'admin'"
      to="/settings/backup"
      class="block px-4 py-2.5 rounded-lg text-sm font-medium mb-1"
      :class="isActive('/settings/backup')
        ? 'bg-green-700 text-white'
        : 'text-gray-700 hover:bg-gray-100'"
    >
      Backup &amp; Restore
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/features/auth/store/authStore'

const route = useRoute()
const authStore = useAuthStore()

const isActive = (path) => route.path === path
</script>
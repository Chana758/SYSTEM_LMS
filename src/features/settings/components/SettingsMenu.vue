<template>
  <div class="lg:hidden -mx-4 px-4 mb-5 overflow-x-auto">
    <div class="flex gap-2 pb-1 min-w-max">
      <router-link
        v-for="item in items" :key="item.to"
        :to="item.to"
        class="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
        :class="route.path === item.to ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'"
      >
        <component :is="item.icon" class="w-3.5 h-3.5" />
        {{ item.label }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  UserCircleIcon, IdentificationIcon, ShieldCheckIcon,
  AdjustmentsHorizontalIcon, Cog6ToothIcon, ArchiveBoxArrowDownIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'

const route = useRoute()
const authStore = useAuthStore()

const items = computed(() => {
  const base = [
    { to: '/settings/profile', icon: UserCircleIcon, label: 'Profile' },
    { to: '/settings/account', icon: IdentificationIcon, label: 'Account' },
    { to: '/settings/security', icon: ShieldCheckIcon, label: 'Security' },
    { to: '/settings/preferences', icon: AdjustmentsHorizontalIcon, label: 'Preferences' },
  ]
  if (['admin', 'librarian'].includes(authStore.role)) {
    base.push({ to: '/settings/system', icon: Cog6ToothIcon, label: 'System' })
  }
  if (authStore.role === 'admin') {
    base.push({ to: '/settings/backup', icon: ArchiveBoxArrowDownIcon, label: 'Backup' })
  }
  return base
})
</script>
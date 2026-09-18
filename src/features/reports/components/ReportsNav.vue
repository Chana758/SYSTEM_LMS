<template>
  <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
    <router-link
      v-for="item in items" :key="item.to"
      :to="item.to"
      class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
      :class="isActive(item.to)
        ? 'bg-emerald-700 text-white shadow-md'
        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'"
    >
      <component :is="item.icon" class="w-4 h-4" />
      {{ t(item.labelKey) }}
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ChartBarIcon, ArrowsRightLeftIcon, BanknotesIcon,
  CurrencyDollarIcon, ArchiveBoxIcon, UsersIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const isActive = (path) => route.path === path

// 'Revenue' tab is admin-only, mirroring the backend split in
// routes/api.php (§10 ADMIN REPORTS) — revenue is financial/sensitive
// data, kept out of the same tier as borrow/fine/stock/user which
// librarian needs day-to-day.
const items = computed(() => {
  const base = [
    { to: '/reports', labelKey: 'reports.navOverview', icon: ChartBarIcon },
    { to: '/reports/borrow', labelKey: 'reports.navBorrow', icon: ArrowsRightLeftIcon },
    { to: '/reports/fine', labelKey: 'reports.navFine', icon: BanknotesIcon },
  ]
  if (authStore.role === 'admin') {
    base.push({ to: '/reports/revenue', labelKey: 'reports.navRevenue', icon: CurrencyDollarIcon })
  }
  base.push(
    { to: '/reports/stock', labelKey: 'reports.navStock', icon: ArchiveBoxIcon },
    { to: '/reports/user', labelKey: 'reports.navUser', icon: UsersIcon },
  )
  return base
})
</script>
<template>
  <aside
    class="h-screen flex flex-col bg-gray-50 transition-all duration-300 border-r border-gray-200"
    :class="isCollapsed ? 'w-20' : 'w-60'"
    style="box-shadow: 4px 0 16px rgba(0,0,0,0.02);"
  >
    <div class="flex items-center gap-2.5 px-3.5 pt-4 pb-4">
      <div class="bg-green-800 rounded-xl w-[40px] h-[39px] flex items-center justify-center flex-shrink-0">
        <BookOpenIcon class="w-[18px] h-[18px] text-white" />
      </div>
      <span v-if="!isCollapsed" class="text-[18px] font-bold text-gray-900">
        Library LMS
      </span>
    </div>

    <div class="border-t border-gray-200 mx-0 mb-3"></div>

    <div v-if="canSee('dashboard')" class="px-2.5 mb-3">
      <router-link
        to="/dashboard"
        class="flex items-center gap-2.5 px-3 py-3 bg-green-800 rounded-xl hover:bg-green-700 transition-colors"
      >
        <ChartPieIcon class="w-[17px] h-[17px] text-white" />
        <span v-if="!isCollapsed" class="text-white text-[16px] font-medium">
          Dashboard
        </span>
      </router-link>
    </div>

    <nav class="flex-1 overflow-y-auto px-2.5 flex flex-col gap-1.5 pb-3">
      <template v-if="visibleCoreMenus.length">
        <p v-if="!isCollapsed" class="text-[9px] uppercase tracking-widest text-gray-400 font-bold px-1 pt-1 pb-1">
          Management
        </p>
        <SidebarLink v-for="item in visibleCoreMenus" :key="item.name + item.path" :item="item" :isCollapsed="isCollapsed" />
        <hr class="border-gray-200 my-1.5" />
      </template>

      <template v-if="visibleSmartMenus.length">
        <p v-if="!isCollapsed" class="text-[9px] uppercase tracking-widest text-gray-400 font-bold px-1 pb-1">
          Smart Tools
        </p>
        <SidebarLink v-for="item in visibleSmartMenus" :key="item.name" :item="item" :isCollapsed="isCollapsed" />
        <hr class="border-gray-200 my-1.5" />
      </template>

      <template v-if="visibleSystemMenus.length">
        <p v-if="!isCollapsed" class="text-[9px] uppercase tracking-widest text-gray-400 font-bold px-1 pb-1">
          System
        </p>
        <SidebarLink v-for="item in visibleSystemMenus" :key="item.name" :item="item" :isCollapsed="isCollapsed" />
        <hr class="border-gray-200 my-1.5" />
      </template>

      <button
        @click="handleLogout"
        class="relative flex items-center gap-2.5 py-5.5 border border-gray-200 pl-4 pr-3 bg-white rounded-xl text-red-500 hover:bg-red-50 transition-all w-full overflow-hidden"
      >
        <span class="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></span>
        <ArrowRightOnRectangleIcon class="w-[20px] h-[18px]" />
        <span v-if="!isCollapsed" class="text-[16px]">Logout</span>
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  BookOpenIcon, ChartPieIcon, UsersIcon, ArrowsRightLeftIcon,
  ArrowUturnLeftIcon, BanknotesIcon, ChartBarIcon, Cog6ToothIcon,
  CpuChipIcon, SparklesIcon, QrCodeIcon, BellIcon, CalendarDaysIcon,
  DocumentTextIcon, ArchiveBoxArrowDownIcon, UserGroupIcon,
  ArrowRightOnRectangleIcon, ExclamationTriangleIcon, ClockIcon, UserCircleIcon,
} from '@heroicons/vue/24/outline'
import SidebarLink from './SidebarLink.vue'
import { useAuthStore } from '@/features/auth/store/authStore'

defineProps({ isCollapsed: Boolean })

const router = useRouter()
const authStore = useAuthStore()

const coreMenus = [
  { name: 'Books',             path: '/books',           icon: BookOpenIcon,            permission: ['admin', 'librarian', 'member'] },
  { name: 'My Profile',        path: '/my-profile',      icon: UserCircleIcon,          permission: ['member'] },
  { name: 'Members',           path: '/members',         icon: UsersIcon,               permission: ['admin'] },
  { name: 'Librarians',        path: '/staff',           icon: UserGroupIcon,           permission: ['admin'] },

  { name: 'Borrow',            path: '/borrow',          icon: ArrowsRightLeftIcon,     permission: ['admin', 'librarian'] },
  { name: 'My Borrows',        path: '/my-borrows',      icon: ClockIcon,               permission: ['member'] },

  { name: 'Return',            path: '/return',          icon: ArrowUturnLeftIcon,      permission: ['admin', 'librarian'] },
  { name: 'Overdue',           path: '/overdue',         icon: ExclamationTriangleIcon, permission: ['admin', 'librarian'] },
  { name: 'Borrow History',    path: '/borrow-history',  icon: ClockIcon,               permission: ['admin', 'librarian'] },

  { name: 'Reservations',      path: '/reservations',    icon: CalendarDaysIcon,        permission: ['admin', 'librarian'] },
  { name: 'My Reservations',   path: '/my-reservations', icon: CalendarDaysIcon,        permission: ['member'] },

  { name: 'Fines',             path: '/fines',           icon: BanknotesIcon,           permission: ['admin', 'librarian'] },
  { name: 'My Fines',          path: '/my-fines',        icon: BanknotesIcon,           permission: ['member'] },
]

const smartMenus = [
  { name: 'Digital Library',   path: '/digital-library',   icon: DocumentTextIcon, permission: ['admin', 'librarian', 'member'] },
  { name: 'AI Chatbot',        path: '/chatbot',           icon: CpuChipIcon,      permission: ['admin', 'librarian', 'member'] },
  { name: 'Recommendations',   path: '/ai-recommendation', icon: SparklesIcon,     permission: ['admin', 'librarian', 'member'] },
  { name: 'Scanner',           path: '/scanner',           icon: QrCodeIcon,       permission: ['admin', 'librarian'] },
]

const systemMenus = [
  { name: 'Reports',           path: '/reports',           icon: ChartBarIcon,            permission: ['admin', 'librarian'] },

  //  FIX: removed the "Analytics" entry pointing to /dashboard/analytics.
  // That page (AnalyticsPage.vue) was a duplicate of this Reports/Overview
  // page but with hardcoded/mock data (fake circulation %, fake category
  // breakdown, and a mislabeled "Total Revenue Collected" that actually
  // showed unpaid fines). It has been deleted along with its route —
  // /reports is now the single source of truth for analytics.ាច

  { name: 'Notifications',     path: '/notifications',     icon: BellIcon,                permission: ['admin', 'librarian', 'member'] },

  { name: 'Card Approvals',    path: '/settings/card-approvals', icon: QrCodeIcon,        permission: ['admin', 'librarian'] },

  { name: 'Backup & Restore',  path: '/settings/backup',   icon: ArchiveBoxArrowDownIcon, permission: ['admin'] },
  { name: 'Settings',          path: '/settings',           icon: Cog6ToothIcon,          permission: ['admin', 'librarian', 'member'] },
]

function canSee(key) {
  if (key === 'dashboard') {
    return ['admin', 'librarian'].includes(authStore.role)
  }
  return true
}

const visibleCoreMenus = computed(() =>
  coreMenus.filter((item) => item.permission.includes(authStore.role))
)
const visibleSmartMenus = computed(() =>
  smartMenus.filter((item) => item.permission.includes(authStore.role))
)
const visibleSystemMenus = computed(() =>
  systemMenus.filter((item) => item.permission.includes(authStore.role))
)

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
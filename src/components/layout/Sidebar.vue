<template>
  <aside
    class="h-screen flex flex-col bg-gray-50 transition-all duration-300 border-r border-gray-200"
    :class="isCollapsed ? 'w-20' : 'w-64'"
    style="box-shadow: 4px 0 16px rgba(0,0,0,0.02);"
  >
    <!-- Brand / Logo Section (Green + Gold Classic Library Theme) -->
    <div class="relative flex flex-col items-center justify-center pt-6 pb-5 px-3 text-center transition-all overflow-hidden flex-shrink-0 bg-green-800 border-b-2 border-amber-400/70">

      <!-- Logo Image with gold ring accent -->
      <div class="relative flex-shrink-0 mb-3 group">
        <div class="absolute -inset-2 rounded-full bg-amber-300 opacity-20 blur-md group-hover:opacity-40 transition duration-500"></div>
        <div
          class="relative w-[76px] h-[76px] flex items-center justify-center rounded-full bg-white p-1 shadow-lg ring-2 ring-amber-400/70 transition-transform duration-300 group-hover:scale-105"
        >
          <img
            src="@/assets/images/logoh6.jpg"
            alt="Smart Nexus Logo"
            class="w-full h-full object-contain rounded-full"
          />
        </div>
      </div>

      <div v-if="!isCollapsed" class="flex flex-col items-center leading-tight relative">
        <span class="text-[17px] font-black text-white tracking-wider">
          SMART <span class="text-amber-300">NEXUS</span>
        </span>
        <!-- Gold divider line -->
        <div class="w-8 h-[2px] bg-amber-400/70 rounded-full my-1.5"></div>
        <span class="flex items-center gap-1.5 text-[9px] font-bold text-amber-100 uppercase tracking-widest bg-white/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse"></span>
          Smart System LMS
        </span>
      </div>
    </div>

    <div v-if="canSee('dashboard')" class="px-3 mt-3 mb-2.5 flex-shrink-0">
      <router-link
        to="/dashboard"
        class="relative flex items-center gap-3 px-3.5 py-2.5 bg-green-800 rounded-xl hover:bg-green-700 transition-all shadow-sm group overflow-hidden border border-amber-400/40"
      >
        <span class="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></span>
        <ChartPieIcon class="w-[18px] h-[18px] text-amber-300 flex-shrink-0 group-hover:scale-110 transition-transform ml-1" />
        <span v-if="!isCollapsed" class="text-white text-[15px] font-medium tracking-wide">
          Dashboard
        </span>
      </router-link>
    </div>

    <!-- Navigation Area (Scrollable) -->
    <nav class="flex-1 overflow-y-auto px-3 flex flex-col gap-1.5 pb-3 custom-scrollbar">
      <template v-if="visibleCoreMenus.length">
        <p v-if="!isCollapsed" class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold px-1.5 pt-1.5 pb-1">
          <span class="w-1 h-1 rounded-full bg-amber-400"></span>
          Management
        </p>
        <SidebarLink v-for="item in visibleCoreMenus" :key="item.name + item.path" :item="item" :isCollapsed="isCollapsed" />
        <hr class="border-gray-200 my-2" />
      </template>

      <template v-if="visibleSmartMenus.length">
        <p v-if="!isCollapsed" class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold px-1.5 pb-1">
          <span class="w-1 h-1 rounded-full bg-amber-400"></span>
          Smart Tools
        </p>
        <SidebarLink v-for="item in visibleSmartMenus" :key="item.name" :item="item" :isCollapsed="isCollapsed" />
        <hr class="border-gray-200 my-2" />
      </template>

      <template v-if="visibleSystemMenus.length">
        <p v-if="!isCollapsed" class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold px-1.5 pb-1">
          <span class="w-1 h-1 rounded-full bg-amber-400"></span>
          System
        </p>
        <SidebarLink v-for="item in visibleSystemMenus" :key="item.name" :item="item" :isCollapsed="isCollapsed" />
        <hr class="border-gray-200 my-2" />
      </template>
    </nav>

    <!-- Logout Button -->
    <div class="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
      <button
        @click="handleLogout"
        class="relative flex items-center gap-3 py-3 px-3.5 border border-gray-200 bg-white rounded-xl text-red-500 hover:bg-red-50 transition-all w-full overflow-hidden group shadow-sm"
      >
        <span class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-400 rounded-r-md"></span>
        <ArrowRightOnRectangleIcon class="w-[20px] h-[20px] flex-shrink-0 ml-0.5 group-hover:-translate-x-0.5 transition-transform" />
        <span v-if="!isCollapsed" class="text-[15px] font-medium">Logout</span>
      </button>
    </div>
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
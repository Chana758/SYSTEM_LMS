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
          <!-- CHANGED: dynamic logo, falls back to bundled asset -->
          <img
            :src="brandingStore.logoUrl || defaultLogo"
            :alt="brandingStore.siteName"
            class="w-full h-full object-contain rounded-full"
          />
        </div>
      </div>

      <div v-if="!isCollapsed" class="flex flex-col items-center leading-tight relative">
        <span class="text-[17px] font-black text-white tracking-wider">
          <!-- CHANGED: dynamic site name -->
          {{ brandingStore.siteName }} <span class="text-amber-300">{{ brandingStore.siteNameAccent }}</span>
        </span>
        <!-- Gold divider line -->
        <div class="w-8 h-[2px] bg-amber-400/70 rounded-full my-1.5"></div>
        <span class="flex items-center gap-1.5 text-[9px] font-bold text-amber-100 uppercase tracking-widest bg-white/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse"></span>
          <!-- CHANGED: dynamic tagline -->
          {{ brandingStore.siteTagline }}
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
          {{ $t('sidebar.dashboard') }}
        </span>
      </router-link>
    </div>

    <!-- Navigation Area (Scrollable) -->
    <nav class="flex-1 overflow-y-auto px-3 flex flex-col gap-1.5 pb-3 custom-scrollbar">
      <template v-if="visibleCoreMenus.length">
        <p v-if="!isCollapsed" class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold px-1.5 pt-1.5 pb-1">
          <span class="w-1 h-1 rounded-full bg-amber-400"></span>
          {{ $t('sidebar.sections.management') }}
        </p>
        <SidebarLink
          v-for="item in visibleCoreMenus"
          :key="item.name + item.path"
          :item="item"
          :isCollapsed="isCollapsed"
          :isActive="item.path === activePath"
        />
        <hr class="border-gray-200 my-2" />
      </template>

      <template v-if="visibleSmartMenus.length">
        <p v-if="!isCollapsed" class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold px-1.5 pb-1">
          <span class="w-1 h-1 rounded-full bg-amber-400"></span>
          {{ $t('sidebar.sections.smartTools') }}
        </p>
        <SidebarLink
          v-for="item in visibleSmartMenus"
          :key="item.name"
          :item="item"
          :isCollapsed="isCollapsed"
          :isActive="item.path === activePath"
        />
        <hr class="border-gray-200 my-2" />
      </template>

      <template v-if="visibleSystemMenus.length">
        <p v-if="!isCollapsed" class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold px-1.5 pb-1">
          <span class="w-1 h-1 rounded-full bg-amber-400"></span>
          {{ $t('sidebar.sections.system') }}
        </p>
        <SidebarLink
          v-for="item in visibleSystemMenus"
          :key="item.name"
          :item="item"
          :isCollapsed="isCollapsed"
          :isActive="item.path === activePath"
        />
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
        <span v-if="!isCollapsed" class="text-[15px] font-medium">{{ $t('sidebar.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  BookOpenIcon, ChartPieIcon, UsersIcon, ArrowsRightLeftIcon,
  ArrowUturnLeftIcon, BanknotesIcon, ChartBarIcon, Cog6ToothIcon,
  CpuChipIcon, SparklesIcon, QrCodeIcon, BellIcon, CalendarDaysIcon,
  DocumentTextIcon, ArchiveBoxArrowDownIcon, UserGroupIcon,
  ArrowRightOnRectangleIcon, ExclamationTriangleIcon, ClockIcon, UserCircleIcon,
} from '@heroicons/vue/24/outline'
import SidebarLink from './SidebarLink.vue'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBrandingStore } from '@/stores/brandingStore' // NEW
import defaultLogo from '@/assets/images/logoh6.jpg' // NEW — fallback

defineProps({ isCollapsed: Boolean })

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const brandingStore = useBrandingStore() // NEW
const { t } = useI18n()

const coreMenus = computed(() => [
  { name: t('sidebar.menu.books'),          path: '/books',           icon: BookOpenIcon,            permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.myProfile'),      path: '/my-profile',      icon: UserCircleIcon,          permission: ['member'] },
  { name: t('sidebar.menu.members'),        path: '/members',         icon: UsersIcon,               permission: ['admin'] },
  { name: t('sidebar.menu.librarians'),     path: '/staff',           icon: UserGroupIcon,           permission: ['admin'] },

  { name: t('sidebar.menu.borrow'),         path: '/borrow',          icon: ArrowsRightLeftIcon,     permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.myBorrows'),      path: '/my-borrows',      icon: ClockIcon,               permission: ['member'] },

  { name: t('sidebar.menu.return'),         path: '/return',          icon: ArrowUturnLeftIcon,      permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.overdue'),        path: '/overdue',         icon: ExclamationTriangleIcon, permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.borrowHistory'),  path: '/borrow-history',  icon: ClockIcon,               permission: ['admin', 'librarian'] },

  { name: t('sidebar.menu.reservations'),   path: '/reservations',    icon: CalendarDaysIcon,        permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.myReservations'), path: '/my-reservations', icon: CalendarDaysIcon,        permission: ['member'] },

  { name: t('sidebar.menu.fines'),          path: '/fines',           icon: BanknotesIcon,           permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.myFines'),        path: '/my-fines',        icon: BanknotesIcon,           permission: ['member'] },
])

const smartMenus = computed(() => [
  { name: t('sidebar.menu.digitalLibrary'),  path: '/digital-library',   icon: DocumentTextIcon, permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.aiChatbot'),       path: '/chatbot',           icon: CpuChipIcon,      permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.recommendations'), path: '/ai-recommendation', icon: SparklesIcon,     permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.scanner'),         path: '/scanner',           icon: QrCodeIcon,       permission: ['admin', 'librarian'] },
])

const systemMenus = computed(() => [
  { name: t('sidebar.menu.reports'),         path: '/reports',                 icon: ChartBarIcon,            permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.notifications'),   path: '/notifications',           icon: BellIcon,                permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.cardApprovals'),   path: '/settings/card-approvals', icon: QrCodeIcon,              permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.backupRestore'),   path: '/settings/backup',         icon: ArchiveBoxArrowDownIcon, permission: ['admin'] },
  { name: t('sidebar.menu.settings'),        path: '/settings',                icon: Cog6ToothIcon,           permission: ['admin', 'librarian', 'member'] },
])

function canSee(key) {
  if (key === 'dashboard') {
    return ['admin', 'librarian'].includes(authStore.role)
  }
  return true
}

const visibleCoreMenus = computed(() =>
  coreMenus.value.filter((item) => item.permission.includes(authStore.role))
)
const visibleSmartMenus = computed(() =>
  smartMenus.value.filter((item) => item.permission.includes(authStore.role))
)
const visibleSystemMenus = computed(() =>
  systemMenus.value.filter((item) => item.permission.includes(authStore.role))
)

const allMenuPaths = computed(() => [
  ...visibleCoreMenus.value,
  ...visibleSmartMenus.value,
  ...visibleSystemMenus.value,
].map((item) => item.path))

const activePath = computed(() => {
  const matches = allMenuPaths.value.filter(
    (p) => route.path === p || route.path.startsWith(p + '/')
  )
  if (!matches.length) return null
  return matches.reduce((a, b) => (b.length > a.length ? b : a))
})

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
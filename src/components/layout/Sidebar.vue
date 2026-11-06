<template>
  <aside
    class="relative h-full flex flex-col overflow-hidden bg-gradient-to-b border-r transition-all duration-300
           from-green-900 via-green-900 to-green-950 border-green-950
           dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:border-white/5"
    :class="isCollapsed ? 'w-20' : 'w-64'"
    style="box-shadow: 6px 0 24px rgba(0,0,0,0.12);"
  >
    <!-- Close button: only shown inside the phone drawer -->
    <button
      v-if="closable"
      type="button"
      @click="$emit('close')"
      class="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-rose-500/80 text-white border border-white/15 transition cursor-pointer"
      aria-label="Close menu"
    >
      <XMarkIcon class="w-5 h-5" />
    </button>

    <!-- Soft decorative glows (emerald in light mode, indigo in dark mode) -->
    <div class="pointer-events-none absolute -top-24 -left-20 h-60 w-60 rounded-full bg-amber-400/10 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-emerald-400/10 dark:bg-indigo-400/10 blur-3xl"></div>

    <!-- Brand -->
    <div
      class="relative flex-shrink-0 flex flex-col items-center text-center transition-all"
      :class="isCollapsed ? 'px-2 pt-5 pb-4' : 'px-4 pt-6 pb-5'"
    >
      <div class="relative group mb-3">
        <!-- Glow behind the logo (stronger in dark mode) -->
        <div class="absolute -inset-2 rounded-full bg-amber-300 opacity-25 dark:opacity-40 blur-lg group-hover:opacity-45 dark:group-hover:opacity-60 transition duration-500"></div>
        <div
          class="relative flex items-center justify-center rounded-full bg-white dark:bg-slate-900 p-1 shadow-xl dark:shadow-amber-400/30 ring-2 ring-amber-400/80 dark:ring-amber-300 transition-all duration-300 group-hover:scale-105"
          :class="isCollapsed ? 'h-12 w-12' : 'h-[76px] w-[76px]'"
        >
          <img
            :src="brandingStore.logoUrl || defaultLogo"
            :alt="brandingStore.siteName"
            class="h-full w-full rounded-full object-contain"
          />
        </div>
      </div>

      <div v-if="!isCollapsed" class="flex flex-col items-center leading-tight">
        <span class="text-[17px] font-black tracking-wider text-white">
          {{ brandingStore.siteName }}
          <span class="text-amber-300">{{ brandingStore.siteNameAccent }}</span>
        </span>
        <div class="my-2 h-[2px] w-10 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        <span class="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-100 backdrop-blur-sm dark:border-amber-400/40 dark:bg-slate-900/60">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300"></span>
          {{ brandingStore.siteTagline }}
        </span>
      </div>
    </div>

    <!-- Gold divider -->
    <div class="h-px flex-shrink-0 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>

    <!-- Navigation -->
    <nav class="sidebar-scroll relative flex-1 space-y-6 overflow-y-auto px-3 py-5">
      <div v-for="section in visibleSections" :key="section.key">
        <!-- Section heading -->
        <div v-if="section.label && !isCollapsed" class="mb-2 flex items-center gap-2 px-2">
          <span class="h-1 w-1 rounded-full bg-amber-400"></span>
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300/80">
            {{ section.label }}
          </p>
          <span class="h-px flex-1 bg-gradient-to-r from-amber-400/30 to-transparent"></span>
        </div>
        <div
          v-else-if="section.label"
          class="mx-3 mb-3 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
        ></div>

        <div class="space-y-1">
          <SidebarLink
            v-for="item in section.items"
            :key="item.path"
            :item="item"
            :isCollapsed="isCollapsed"
            :isActive="item.path === activePath"
          />
        </div>
      </div>
    </nav>

    <!-- Logout (keeps clear of the iPhone home indicator) -->
    <div
      class="relative flex-shrink-0 border-t border-white/10 bg-black/10 dark:bg-black/20 p-3"
      style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom));"
    >
      <button
        @click="handleLogout"
        :title="isCollapsed ? $t('sidebar.logout') : undefined"
        class="group flex w-full items-center gap-3 rounded-xl py-1.5 transition-colors hover:bg-rose-500/15 cursor-pointer"
        :class="isCollapsed ? 'justify-center px-0' : 'pl-1.5 pr-3'"
      >
        <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300 transition-all group-hover:bg-rose-500 group-hover:text-white">
          <ArrowRightOnRectangleIcon class="h-[19px] w-[19px] transition-transform group-hover:-translate-x-0.5" />
        </span>
        <span v-if="!isCollapsed" class="text-[14.5px] font-medium leading-[1.7] text-rose-200 group-hover:text-white">
          {{ $t('sidebar.logout') }}
        </span>
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
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import SidebarLink from './SidebarLink.vue'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import { isDemoHiddenPath } from '@/middleware/demo'
import defaultLogo from '@/assets/images/logoh6.jpg' // fallback when no custom logo is set

defineProps({
  isCollapsed: Boolean,
  closable: { type: Boolean, default: false }, // true only inside the phone drawer
})
defineEmits(['close'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const { t } = useI18n()

// Dashboard link (admin and librarian only)
const dashboardMenus = computed(() => [
  { name: t('sidebar.dashboard'), path: '/dashboard', icon: ChartPieIcon, color: 'amber', permission: ['admin', 'librarian'] },
])

// Main management menu; `permission` lists the roles that can see each item
const coreMenus = computed(() => [
  { name: t('sidebar.menu.books'),          path: '/books',           icon: BookOpenIcon,            color: 'blue',    permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.myProfile'),      path: '/my-profile',      icon: UserCircleIcon,          color: 'violet',  permission: ['member'] },
  { name: t('sidebar.menu.members'),        path: '/members',         icon: UsersIcon,               color: 'violet',  permission: ['admin'] },
  { name: t('sidebar.menu.librarians'),     path: '/staff',           icon: UserGroupIcon,           color: 'pink',    permission: ['admin'] },

  { name: t('sidebar.menu.borrow'),         path: '/borrow',          icon: ArrowsRightLeftIcon,     color: 'emerald', permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.myBorrows'),      path: '/my-borrows',      icon: ClockIcon,               color: 'emerald', permission: ['member'] },

  { name: t('sidebar.menu.return'),         path: '/return',          icon: ArrowUturnLeftIcon,      color: 'cyan',    permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.overdue'),        path: '/overdue',         icon: ExclamationTriangleIcon, color: 'red',     permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.borrowHistory'),  path: '/borrow-history',  icon: ClockIcon,               color: 'indigo',  permission: ['admin', 'librarian'] },

  { name: t('sidebar.menu.reservations'),   path: '/reservations',    icon: CalendarDaysIcon,        color: 'pink',    permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.myReservations'), path: '/my-reservations', icon: CalendarDaysIcon,        color: 'pink',    permission: ['member'] },

  { name: t('sidebar.menu.fines'),          path: '/fines',           icon: BanknotesIcon,           color: 'orange',  permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.myFines'),        path: '/my-fines',        icon: BanknotesIcon,           color: 'orange',  permission: ['member'] },
])

// Digital library and AI tools menu
const smartMenus = computed(() => [
  { name: t('sidebar.menu.digitalLibrary'),  path: '/digital-library',   icon: DocumentTextIcon, color: 'teal',    permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.aiChatbot'),       path: '/chatbot',           icon: CpuChipIcon,      color: 'cyan',    permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.recommendations'), path: '/ai-recommendation', icon: SparklesIcon,     color: 'amber',   permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.scanner'),         path: '/scanner',           icon: QrCodeIcon,       color: 'indigo',  permission: ['admin', 'librarian'] },
])

// Reports, notifications, backup and settings menu
const systemMenus = computed(() => [
  { name: t('sidebar.menu.reports'),         path: '/reports',                 icon: ChartBarIcon,            color: 'blue',    permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.notifications'),   path: '/notifications',           icon: BellIcon,                color: 'amber',   permission: ['admin', 'librarian', 'member'] },
  { name: t('sidebar.menu.cardApprovals'),   path: '/settings/card-approvals', icon: QrCodeIcon,              color: 'violet',  permission: ['admin', 'librarian'] },
  { name: t('sidebar.menu.backupRestore'),   path: '/settings/backup',         icon: ArchiveBoxArrowDownIcon, color: 'teal',    permission: ['admin'] },
  { name: t('sidebar.menu.settings'),        path: '/settings',                icon: Cog6ToothIcon,           color: 'indigo',  permission: ['admin', 'librarian', 'member'] },
])

// Keep only the menu items the current user's role is allowed to see.
// Demo accounts also lose the pages listed in DEMO_HIDDEN_PATHS.
const byRole = (items) =>
  items
    .filter((item) => item.permission.includes(authStore.role))
    .filter((item) => !(authStore.isDemo && isDemoHiddenPath(item.path)))

// Sidebar sections (empty ones are hidden)
const visibleSections = computed(() =>
  [
    { key: 'main',   label: '',                                items: byRole(dashboardMenus.value) },
    { key: 'core',   label: t('sidebar.sections.management'),  items: byRole(coreMenus.value) },
    { key: 'smart',  label: t('sidebar.sections.smartTools'),  items: byRole(smartMenus.value) },
    { key: 'system', label: t('sidebar.sections.system'),      items: byRole(systemMenus.value) },
  ].filter((section) => section.items.length)
)

// The menu path that matches the current route; the longest match wins,
// so /settings/backup highlights "Backup" and not "Settings"
const activePath = computed(() => {
  const paths = visibleSections.value.flatMap((s) => s.items.map((i) => i.path))
  const matches = paths.filter((p) => route.path === p || route.path.startsWith(p + '/'))
  if (!matches.length) return null
  return matches.reduce((a, b) => (b.length > a.length ? b : a))
})

// Log out, then go to the login page
async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}
.sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
}
.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(251, 191, 36, 0.5);
}
</style>
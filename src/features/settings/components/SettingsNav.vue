<template>
  <div class="w-full min-w-0">
    <!-- ============ Phone / tablet: one swipeable row of pills ============ -->
    <nav
      ref="tabsRef"
      class="lg:hidden flex gap-2 overflow-x-auto -mx-1 px-1 pb-1
             [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <router-link
        v-for="item in flatItems" :key="item.to"
        :to="item.to"
        :data-active="isActive(item.to)"
        class="flex items-center gap-2 h-10 px-3.5 rounded-full border text-xs font-bold whitespace-nowrap flex-shrink-0 transition-colors"
        :class="isActive(item.to)
          ? 'bg-green-700 border-green-700 text-white shadow-sm dark:bg-emerald-600 dark:border-emerald-600'
          : 'bg-white border-gray-200 text-gray-600 dark:bg-slate-800/60 dark:border-white/10 dark:text-slate-300'"
      >
        <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
        {{ $t(item.labelKey) }}
      </router-link>
    </nav>

    <!-- ============ lg+: original sidebar nav ============ -->
    <nav class="hidden lg:block w-64 flex-shrink-0 bg-white dark:bg-slate-800/50 rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/10 p-4 space-y-7 h-fit">
      <div v-for="section in sections" :key="section.titleKey" v-show="section.visible">
        <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 px-3 mb-2.5">{{ $t(section.titleKey) }}</p>
        <div class="space-y-1.5">
          <router-link
            v-for="item in section.items" :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
            :class="isActive(item.to)
              ? 'bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md shadow-green-700/25 dark:shadow-none'
              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'"
          >
            <span
              class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              :class="isActive(item.to)
                ? 'bg-white/20'
                : 'bg-gray-100 dark:bg-slate-700/60 group-hover:bg-green-50 dark:group-hover:bg-emerald-500/15'"
            >
              <component
                :is="item.icon"
                class="w-4 h-4"
                :class="isActive(item.to)
                  ? 'text-white'
                  : 'text-gray-400 dark:text-slate-400 group-hover:text-green-700 dark:group-hover:text-emerald-300'"
              />
            </span>
            <span class="flex-1">{{ $t(item.labelKey) }}</span>
            <ChevronRightIcon
              class="w-4 h-4 transition-all"
              :class="isActive(item.to)
                ? 'text-white/80 translate-x-0'
                : 'text-gray-300 dark:text-slate-600 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'"
            />
          </router-link>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  UserCircleIcon, IdentificationIcon, ShieldCheckIcon,
  AdjustmentsHorizontalIcon, Cog6ToothIcon, ArchiveBoxArrowDownIcon,
  RectangleStackIcon, ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'

const route = useRoute()
const authStore = useAuthStore()

const isActive = (path) => route.path === path

const personalItems = [
  { to: '/settings/profile', icon: UserCircleIcon, labelKey: 'settings.nav.profile' },
  { to: '/settings/account', icon: IdentificationIcon, labelKey: 'settings.nav.account' },
  { to: '/settings/security', icon: ShieldCheckIcon, labelKey: 'settings.nav.security' },
  { to: '/settings/preferences', icon: AdjustmentsHorizontalIcon, labelKey: 'settings.nav.preferences' },
]

const systemItems = computed(() => {
  const items = [{ to: '/settings/system', icon: Cog6ToothIcon, labelKey: 'settings.nav.systemSettings' }]
  if (authStore.role === 'admin') {
    items.push(
      { to: '/settings/membership-types', icon: RectangleStackIcon, labelKey: 'settings.nav.membershipTypes' },
      { to: '/settings/backup', icon: ArchiveBoxArrowDownIcon, labelKey: 'settings.nav.backupRestore' },
    )
  }
  return items
})

const sections = computed(() => [
  { titleKey: 'settings.nav.personal', items: personalItems, visible: true },
  { titleKey: 'settings.nav.system', items: systemItems.value, visible: ['admin', 'librarian'].includes(authStore.role) },
])

// Phone tabs: the same visible items as one flat list
const flatItems = computed(() => sections.value.filter((s) => s.visible).flatMap((s) => s.items))

// Keep the active tab in view when the row is scrolled
const tabsRef = ref(null)
async function scrollActiveIntoView() {
  await nextTick()
  tabsRef.value?.querySelector('[data-active="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' })
}
onMounted(scrollActiveIntoView)
watch(() => route.path, scrollActiveIntoView)
</script>
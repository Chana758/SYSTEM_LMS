<template>
  <div class="flex h-dvh bg-gray-50 dark:bg-slate-900">
    <!-- Desktop sidebar (hidden on phones) -->
    <div class="hidden lg:block h-full flex-shrink-0">
      <Sidebar :is-collapsed="isSidebarCollapsed" />
    </div>

    <!-- Mobile drawer backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        @click="drawerOpen = false"
      ></div>
    </Transition>

    <!-- Mobile drawer (with X close button) -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] transition-transform duration-300 ease-out lg:hidden"
      :class="drawerOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <Sidebar :is-collapsed="false" closable @close="drawerOpen = false" />
    </div>

    <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
      <!-- Shared top bar: working theme toggle, language switch, notifications, profile -->
      <Navbar @toggle-sidebar="onToggleSidebar" />

      <!-- Extra bottom padding on phones so the bottom nav never covers content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 lg:pb-6">
        <router-view />
      </main>
    </div>

    <!-- Bottom navigation (phones only) -->
    <MobileBottomNav @more="drawerOpen = true" />
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import MobileBottomNav from '@/components/layout/MobileBottomNav.vue'

const route = useRoute()

// Desktop: collapsed sidebar (icons only). Phone: drawer open/closed.
const isSidebarCollapsed = ref(false)
const drawerOpen = ref(false)

function onToggleSidebar() {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  } else {
    drawerOpen.value = !drawerOpen.value
  }
}

// Close the drawer after navigating
watch(() => route.fullPath, () => { drawerOpen.value = false })

// Lock page scroll while the drawer is open
watch(drawerOpen, (open) => document.body.classList.toggle('overflow-hidden', open))
onBeforeUnmount(() => document.body.classList.remove('overflow-hidden'))
</script>
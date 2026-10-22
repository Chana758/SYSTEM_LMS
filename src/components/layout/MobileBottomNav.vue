<template>
  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 dark:border-white/10
           bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    style="padding-bottom: env(safe-area-inset-bottom);"
  >
    <div class="grid grid-cols-5 h-16">
      <router-link
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="relative flex flex-col items-center justify-center gap-0.5 transition-colors"
        :class="isActive(item.path)
          ? 'text-green-800 dark:text-amber-300'
          : 'text-slate-400 dark:text-slate-500'"
      >
        <span
          v-if="isActive(item.path)"
          class="absolute top-0 h-0.5 w-8 rounded-b-full bg-amber-400"
        ></span>
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-[10px] font-bold leading-none truncate max-w-full px-1">{{ item.name }}</span>
      </router-link>

      <button
        type="button"
        class="flex flex-col items-center justify-center gap-0.5 text-slate-400 dark:text-slate-500 cursor-pointer"
        @click="$emit('more')"
      >
        <Bars3Icon class="w-6 h-6" />
        <span class="text-[10px] font-bold leading-none">{{ t('sidebar.more') }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  BookOpenIcon, ClockIcon, CalendarDaysIcon, UserCircleIcon, Bars3Icon,
} from '@heroicons/vue/24/outline'

defineEmits(['more'])

const { t } = useI18n()
const route = useRoute()

const items = computed(() => [
  { name: t('sidebar.menu.books'),          path: '/books',           icon: BookOpenIcon },
  { name: t('sidebar.menu.myBorrows'),      path: '/my-borrows',      icon: ClockIcon },
  { name: t('sidebar.menu.myReservations'), path: '/my-reservations', icon: CalendarDaysIcon },
  { name: t('sidebar.menu.myProfile'),      path: '/my-profile',      icon: UserCircleIcon },
])

const isActive = (p) => route.path === p || route.path.startsWith(p + '/')
</script>
<template>
  <div class="relative notification-bell-root">
    <!-- Phone: round glass button (matches theme/language buttons). sm and up: original look -->
    <button
      @click.stop="toggle"
      class="relative w-9 h-9 flex items-center justify-center rounded-full sm:rounded-lg border
             active:scale-95 sm:active:scale-100 transition cursor-pointer
             text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200
             dark:text-white dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/15
             sm:text-white sm:bg-transparent sm:border-transparent sm:hover:bg-white/15
             sm:dark:bg-transparent sm:dark:border-transparent sm:dark:hover:bg-white/15"
      :title="t('notifications.pageTitle')"
      :aria-expanded="open"
    >
      <BellIcon class="w-[18px] h-[18px]" :class="store.unreadCount > 0 ? 'animate-[wiggle_1s_ease-in-out_1]' : ''" />
      <span
        v-if="store.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 sm:top-[3px] sm:right-[3px] min-w-[15px] h-[15px] px-[3px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border-[1.5px] border-white sm:border-green-700 dark:border-slate-900"
      >
        {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
      </span>
    </button>

    <NotificationDropdown v-if="open" @close="open = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { BellIcon } from '@heroicons/vue/24/outline'
import { useNotificationStore } from '../store/notificationStore'
import NotificationDropdown from './NotificationDropdown.vue'

const { t } = useI18n()
const store = useNotificationStore()
const open = ref(false)
let pollInterval = null

const toggle = () => { open.value = !open.value }

const onClickOutside = (e) => {
  if (!e.target.closest('.notification-bell-root')) open.value = false
}
const onKey = (e) => { if (e.key === 'Escape') open.value = false }
const onVisible = () => { if (document.visibilityState === 'visible') store.poll() }

onMounted(() => {
  store.init()
  pollInterval = setInterval(() => store.poll(), 30000)
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKey)
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => {
  clearInterval(pollInterval)
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('visibilitychange', onVisible)
})
</script>
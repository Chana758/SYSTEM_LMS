<template>
  <div class="relative notification-bell-root">
    <button
      @click="toggle"
      class="relative w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/15 transition"
      title="Notifications"
    >
      <BellIcon class="w-[18px] h-[18px]" />
      <span
        v-if="store.unreadCount > 0"
        class="absolute top-[3px] right-[3px] min-w-[15px] h-[15px] px-[3px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border-[1.5px] border-green-700"
      >
        {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
      </span>
    </button>

    <NotificationDropdown v-if="open" @close="open = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import { useNotificationStore } from '../store/notificationStore'
import NotificationDropdown from './NotificationDropdown.vue'

const store = useNotificationStore()
const open = ref(false)
let pollInterval = null

function toggle() {
  open.value = !open.value
}

function handleClickOutside(e) {
  if (!e.target.closest('.notification-bell-root')) open.value = false
}

onMounted(() => {
  store.fetchUnreadCount()
  pollInterval = setInterval(() => store.fetchUnreadCount(), 30000)
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  clearInterval(pollInterval)
  document.removeEventListener('click', handleClickOutside)
})
</script>
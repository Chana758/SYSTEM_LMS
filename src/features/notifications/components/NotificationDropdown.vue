<template>
  <div
    class="absolute right-0 mt-2 w-80 max-h-[28rem] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col"
    @click.stop
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <h3 class="font-bold text-gray-800 text-sm">Notifications</h3>
      <button v-if="store.unreadCount > 0" @click="handleMarkAll" class="text-xs text-green-700 hover:underline font-medium">
        Mark all read
      </button>
    </div>

    <div class="overflow-y-auto flex-1">
      <NotificationList :items="store.notifications" :loading="store.loading" @item-click="handleItemClick" />
    </div>

    <router-link
      to="/notifications"
      @click="$emit('close')"
      class="block text-center text-xs font-medium text-green-700 py-2.5 border-t border-gray-100 hover:bg-gray-50"
    >
      View all notifications
    </router-link>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../store/notificationStore'
import NotificationList from './NotificationList.vue'

const emit = defineEmits(['close'])
const store = useNotificationStore()
const router = useRouter()

async function handleMarkAll() {
  await store.markAllRead()
}

async function handleItemClick(item) {
  if (!item.is_read) await store.markRead(item.id)
  emit('close')
  router.push(item.link || { name: 'notification-detail', params: { id: item.id } })
}

onMounted(() => store.fetchNotifications(1, { per_page: 8 }))
</script>
<template>
  <!--
    Phone: pinned to the screen (fixed, 12px from both edges, just under the 64px navbar)
    so it can never overflow, whatever is next to the bell.
    sm and up: original dropdown anchored under the bell.
  -->
  <div
    class="fixed inset-x-3 top-[4.25rem] max-h-[70dvh]
           sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96 sm:max-h-[28rem]
           bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-black/40 border border-gray-100 dark:border-white/10 overflow-hidden z-50 flex flex-col"
    @click.stop
  >
    <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/10">
      <h3 class="font-bold text-gray-800 dark:text-white text-sm">{{ t('notifications.pageTitle') }}</h3>
      <button
        v-if="store.unreadCount > 0"
        @click="handleMarkAll"
        class="text-xs text-green-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
      >
        {{ t('notifications.markAllRead', { count: store.unreadCount }) }}
      </button>
    </div>

    <div class="overflow-y-auto flex-1 overscroll-contain">
      <NotificationList :items="store.recent" :loading="store.recentLoading" @item-click="handleItemClick" />
    </div>

    <router-link
      to="/notifications"
      @click="$emit('close')"
      class="block text-center text-xs font-medium text-green-700 dark:text-emerald-400 py-3 sm:py-2.5 border-t border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
    >
      {{ t('notifications.viewAllNotifications') }}
    </router-link>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '../store/notificationStore'
import NotificationList from './NotificationList.vue'

const { t } = useI18n()
const emit = defineEmits(['close'])
const store = useNotificationStore()
const router = useRouter()

const handleMarkAll = () => store.markAllRead()

async function handleItemClick(item) {
  if (!item.is_read) await store.markRead(item.id)
  emit('close')
  router.push(item.link || { name: 'notification-detail', params: { id: item.id } })
}

onMounted(() => store.fetchRecent())
</script>
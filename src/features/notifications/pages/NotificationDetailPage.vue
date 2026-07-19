<template>
  <div v-if="notification">
    <router-link to="/notifications" class="text-gray-400 hover:text-gray-600 text-sm mb-6 inline-flex items-center gap-1">
      ← Notifications
    </router-link>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl relative overflow-hidden">
      <span class="absolute left-0 top-0 bottom-0 w-1.5" :class="spineClass"></span>

      <div class="flex items-center gap-2 mb-2">
        <span class="capitalize text-xs font-semibold px-2 py-0.5 rounded-full" :class="typeBadge">{{ notification.type }}</span>
        <span class="text-xs text-gray-400">{{ formatDate(notification.created_at) }}</span>
      </div>
      <h1 class="text-lg font-bold text-gray-900 mb-3">{{ notification.title }}</h1>
      <p class="text-gray-600 whitespace-pre-line leading-relaxed">{{ notification.message }}</p>

      <router-link
        v-if="notification.link"
        :to="notification.link"
        class="inline-block mt-4 text-sm text-green-700 hover:underline font-medium"
      >
        View related item →
      </router-link>

      <div class="mt-6 pt-4 border-t border-gray-100">
        <button @click="handleDelete" class="text-sm text-red-500 hover:underline">Delete Notification</button>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16 text-gray-400 text-sm">Loading...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../store/notificationStore'

const route = useRoute()
const router = useRouter()
const store = useNotificationStore()
const notification = ref(null)

const typeMap = {
  overdue: 'bg-red-50 text-red-600',
  reservation: 'bg-blue-50 text-blue-600',
  fine: 'bg-amber-50 text-amber-600',
  system: 'bg-gray-100 text-gray-600',
  announcement: 'bg-purple-50 text-purple-600',
}
const spineMap = {
  overdue: 'bg-red-400',
  reservation: 'bg-blue-400',
  fine: 'bg-amber-400',
  system: 'bg-gray-300',
  announcement: 'bg-purple-400',
}
const typeBadge = computed(() => typeMap[notification.value?.type] || 'bg-gray-100 text-gray-600')
const spineClass = computed(() => spineMap[notification.value?.type] || 'bg-gray-300')

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function handleDelete() {
  if (!confirm('Delete this notification?')) return
  await store.deleteNotification(route.params.id)
  router.push({ name: 'notification-list' })
}

onMounted(async () => {
  const result = await store.fetchNotification(route.params.id)
  if (result.success) notification.value = result.data
})
</script>
<template>
  <div v-if="notification" class="space-y-6 pb-12 max-w-3xl">
    <!-- Back Link with matching badge/card box style -->
    <div class="inline-block">
      <router-link
        to="/notifications"
        class="inline-flex items-center gap-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
      >
        <span>←</span> {{ t('notifications.detail.backToNotifications') }}
      </router-link>
    </div>

    <!-- Main Container matching Digital Library, Fines & Reservations Style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-6 relative overflow-hidden border-dashed">
      <!-- Left Spine Accent -->
      <span class="absolute left-0 top-0 bottom-0 w-2" :class="spineClass"></span>

      <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-2xs border-2" :class="typeBadge">
            {{ notification.type }}
          </span>
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ formatDate(notification.created_at) }}</span>
        </div>

        <div class="space-y-3">
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{{ notification.title }}</h1>
          <p class="text-xs font-bold text-slate-600 whitespace-pre-line leading-relaxed">{{ notification.message }}</p>
        </div>

        <div v-if="notification.link" class="pt-2">
          <router-link
            :to="notification.link"
            class="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-300 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs"
          >
            <span>{{ t('notifications.detail.viewRelatedItem') }}</span>
            <span>→</span>
          </router-link>
        </div>

        <div class="pt-6 border-t border-slate-200/80 flex justify-end">
          <button 
            @click="handleDelete" 
            class="inline-flex items-center gap-2 bg-white border-2 border-rose-200 hover:border-rose-300 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs"
          >
            <span>🗑️</span> {{ t('notifications.detail.deleteNotification') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="text-center py-24 text-slate-400 font-bold text-xs uppercase tracking-widest">
    {{ t('notifications.detail.loading') }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../store/notificationStore'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useNotificationStore()
const notification = ref(null)

const typeMap = {
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  reservation: 'bg-sky-50 text-sky-700 border-sky-200',
  fine: 'bg-amber-50 text-amber-700 border-amber-200',
  system: 'bg-slate-100 text-slate-700 border-slate-200',
  announcement: 'bg-purple-50 text-purple-700 border-purple-200',
}
const spineMap = {
  overdue: 'bg-rose-500',
  reservation: 'bg-sky-500',
  fine: 'bg-amber-500',
  system: 'bg-slate-400',
  announcement: 'bg-purple-500',
}
const typeBadge = computed(() => typeMap[notification.value?.type] || 'bg-slate-100 text-slate-700 border-slate-200')
const spineClass = computed(() => spineMap[notification.value?.type] || 'bg-slate-300')

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
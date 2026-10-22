<template>
  <div v-if="notification" class="space-y-4 sm:space-y-6 pb-12 max-w-3xl">
    <div class="inline-block">
      <router-link
        to="/notifications"
        class="inline-flex items-center gap-2 bg-white dark:bg-slate-700/60 border-2 border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md dark:shadow-none active:scale-95"
      >
        <span>←</span> {{ t('notifications.detail.backToNotifications') }}
      </router-link>
    </div>

    <!-- Outer card: tighter padding on phones so the content gets the width -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-3 pl-4 sm:p-6 md:p-8 shadow-lg dark:shadow-none space-y-6 relative overflow-hidden border-dashed">
      <span class="absolute left-0 top-0 bottom-0 w-1.5 sm:w-2" :class="m.spine"></span>

      <div class="bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border-2 border-slate-200 dark:border-white/10 p-4 sm:p-8 shadow-2xs space-y-5 sm:space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-2xs border-2" :class="m.badge">
            <component :is="m.icon" class="w-4 h-4 flex-shrink-0" />
            {{ typeLabel(notification.type) }}
          </span>
          <span class="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider sm:tracking-widest">{{ formatDate(notification.created_at) }}</span>
        </div>

        <div class="space-y-3">
          <h1 class="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight break-words leading-snug">{{ notification.title }}</h1>
          <p class="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed break-words">{{ notification.message }}</p>
        </div>

        <div v-if="notification.link" class="pt-2">
          <router-link
            :to="notification.link"
            class="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/30 hover:border-emerald-300 dark:hover:border-emerald-400/60 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs"
          >
            <span>{{ t('notifications.detail.viewRelatedItem') }}</span>
            <span>→</span>
          </router-link>
        </div>

        <div class="pt-5 sm:pt-6 border-t border-slate-200/80 dark:border-white/10 flex sm:justify-end">
          <button
            type="button"
            @click="handleDelete"
            class="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-white dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-400/30 hover:border-rose-300 dark:hover:border-rose-400/60 text-rose-600 dark:text-rose-300 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
          >
            <TrashIcon class="w-4 h-4" /> {{ t('notifications.detail.deleteNotification') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else-if="notFound" class="text-center py-24 space-y-4">
    <p class="text-sm font-black text-slate-800 dark:text-white">{{ t('notifications.detail.notFound') }}</p>
    <router-link to="/notifications" class="inline-block text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline">
      ← {{ t('notifications.detail.backToNotifications') }}
    </router-link>
  </div>

  <!-- Loading -->
  <div v-else class="text-center py-24 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">
    {{ t('notifications.detail.loading') }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useNotificationStore } from '../store/notificationStore'
import { useNotificationMeta } from '../composables/useNotificationMeta'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useNotificationStore()
const { meta, typeLabel, formatDate } = useNotificationMeta()

const notification = ref(null)
const notFound = ref(false)
const m = computed(() => meta(notification.value?.type))

async function load(id) {
  notification.value = null
  notFound.value = false
  const result = await store.fetchNotification(id) // also marks it read
  if (result.success) notification.value = result.data
  else notFound.value = true
}

async function handleDelete() {
  if (!confirm(t('notifications.confirmDelete'))) return
  await store.deleteNotification(route.params.id)
  router.push('/notifications')
}

onMounted(() => load(route.params.id))

// The component is reused when only :id changes (e.g. clicking another item in the bell dropdown)
watch(() => route.params.id, (id) => { if (id) load(id) })
</script>
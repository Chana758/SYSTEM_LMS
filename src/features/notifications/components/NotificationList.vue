<template>
  <div>
    <div
      v-if="loading && !items.length"
      class="text-center py-10 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest"
    >
      {{ t('notifications.loadingNotifications') }}
    </div>

    <div v-else-if="!loading && !items.length" class="text-center py-10 text-slate-400 dark:text-slate-500">
      <p class="text-xs font-bold uppercase tracking-wider">{{ t('notifications.noNotificationsFound') }}</p>
      <p class="text-[11px] mt-1">{{ t('notifications.allCaughtUp') }}</p>
    </div>

    <div v-else>
      <NotificationItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        @click="$emit('item-click', item)"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import NotificationItem from './NotificationItem.vue'

const { t } = useI18n()

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
defineEmits(['item-click'])
</script>
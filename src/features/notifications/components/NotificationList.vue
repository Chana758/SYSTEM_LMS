<template>
  <div>
    <!-- Loading State: show only on the very first load, before any items exist -->
    <div
      v-if="loading && !items.length"
      class="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-widest"
    >
      Loading notifications...
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && !items.length"
      class="text-center py-10 text-slate-400"
    >
      <p class="text-xs font-bold uppercase tracking-wider">No notifications yet</p>
      <p class="text-[11px] text-slate-400 mt-1">You're all caught up.</p>
    </div>

    <!-- List of notification items -->
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
import NotificationItem from './NotificationItem.vue'

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['item-click'])
</script>
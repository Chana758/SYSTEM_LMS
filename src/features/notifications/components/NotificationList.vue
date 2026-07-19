<template>
  <div>
    <div v-if="loading" class="text-center py-8 text-gray-400 text-sm">Loading...</div>
    <div v-else-if="!items.length" class="text-center py-8 text-gray-400 text-sm">No notifications</div>
    <template v-else>
      <NotificationItem
        v-for="item in items" :key="item.id"
        :item="item"
        @click="$emit('item-click', item)"
      />
    </template>
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
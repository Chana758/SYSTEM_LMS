<template>
  <button
    @click="$emit('click')"
    class="flex items-start gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition border-b border-gray-50 dark:border-white/5 last:border-0 cursor-pointer"
    :class="!item.is_read ? 'bg-green-50/50 dark:bg-emerald-500/10' : ''"
  >
    <span class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" :class="meta(item.type).dot"></span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <p
          class="text-sm truncate"
          :class="!item.is_read ? 'font-semibold text-gray-800 dark:text-white' : 'font-medium text-gray-600 dark:text-slate-400'"
        >
          {{ item.title }}
        </p>
        <span v-if="!item.is_read" class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-emerald-400 flex-shrink-0"></span>
      </div>
      <p class="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-0.5">{{ item.message }}</p>
      <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-1">{{ timeAgo(item.created_at) }}</p>
    </div>
  </button>
</template>

<script setup>
import { useNotificationMeta } from '../composables/useNotificationMeta'

defineProps({ item: { type: Object, required: true } })
defineEmits(['click'])

const { meta, timeAgo } = useNotificationMeta()
</script>
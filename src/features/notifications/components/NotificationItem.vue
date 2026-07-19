<template>
  <button
    @click="$emit('click')"
    class="flex items-start gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
    :class="!item.is_read ? 'bg-green-50/50' : ''"
  >
    <span class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" :class="typeColor"></span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm truncate" :class="!item.is_read ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'">
          {{ item.title }}
        </p>
        <span v-if="!item.is_read" class="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0"></span>
      </div>
      <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">{{ item.message }}</p>
      <p class="text-[11px] text-gray-400 mt-1">{{ timeAgo }}</p>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ item: { type: Object, required: true } })
defineEmits(['click'])

const typeMap = {
  overdue: 'bg-red-500',
  reservation: 'bg-blue-500',
  fine: 'bg-amber-500',
  system: 'bg-gray-400',
  announcement: 'bg-purple-500',
}
const typeColor = computed(() => typeMap[props.item.type] || 'bg-gray-400')

const timeAgo = computed(() => {
  const date = new Date(props.item.created_at)
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-GB')
})
</script>
<template>
  <div
    class="bg-white rounded-xl border p-4 flex items-start gap-3 cursor-pointer transition hover:shadow-md"
    :class="notification.is_read ? 'border-gray-200' : 'border-green-200 bg-green-50/40'"
    @click="$emit('click')"
  >
    <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" :class="iconBg">
      <component :is="icon" class="w-4 h-4 text-white" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <p class="font-semibold text-gray-800 text-sm">{{ notification.title }}</p>
        <span v-if="!notification.is_read" class="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">NEW</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
      <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
        <span class="capitalize px-1.5 py-0.5 rounded bg-gray-100">{{ notification.type }}</span>
        <span>{{ formatDate(notification.created_at) }}</span>
      </div>
    </div>

    <button @click.stop="$emit('delete')" class="text-gray-300 hover:text-red-500 transition p-1">
      <XMarkIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  ExclamationTriangleIcon, CalendarDaysIcon, BanknotesIcon,
  Cog6ToothIcon, MegaphoneIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({ notification: { type: Object, required: true } })
defineEmits(['click', 'delete'])

const iconMap = {
  overdue: { icon: ExclamationTriangleIcon, bg: 'bg-red-500' },
  reservation: { icon: CalendarDaysIcon, bg: 'bg-blue-500' },
  fine: { icon: BanknotesIcon, bg: 'bg-amber-500' },
  system: { icon: Cog6ToothIcon, bg: 'bg-gray-400' },
  announcement: { icon: MegaphoneIcon, bg: 'bg-purple-500' },
}
const icon = computed(() => (iconMap[props.notification.type] || iconMap.system).icon)
const iconBg = computed(() => (iconMap[props.notification.type] || iconMap.system).bg)

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
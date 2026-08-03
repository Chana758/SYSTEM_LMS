<template>
  <div
    class="relative bg-white rounded-2xl border overflow-hidden flex items-start gap-3 p-4 pl-5 cursor-pointer transition-all hover:shadow-md"
    :class="notification.is_read ? 'border-slate-200' : 'border-slate-300 shadow-sm'"
    @click="$emit('click')"
  >
    <!-- Left spine accent, colored by type (matches NotificationDetailPage) -->
    <span class="absolute left-0 top-0 bottom-0 w-1.5" :class="spineClass"></span>

    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" :class="iconBg">
      <component :is="icon" class="w-5 h-5 text-white" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <p class="font-bold text-slate-900 text-sm truncate">{{ notification.title }}</p>
        <span
          v-if="!notification.is_read"
          class="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wider"
        >
          New
        </span>
      </div>
      <p class="text-xs text-slate-600 font-medium mt-1 line-clamp-2">{{ notification.message }}</p>
      <div class="flex items-center gap-2 mt-2">
        <span class="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full" :class="typeBadge">
          {{ notification.type }}
        </span>
        <span class="text-[11px] text-slate-400 font-medium">{{ formatDate(notification.created_at) }}</span>
      </div>
    </div>

    <button
      @click.stop="$emit('delete')"
      class="text-slate-300 hover:text-rose-500 transition p-1 flex-shrink-0 cursor-pointer"
      title="Delete notification"
    >
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

// Colors aligned with NotificationDetailPage.vue's typeMap/spineMap so the
// list and detail views read as the same system (overdue=rose,
// reservation=sky, fine=amber, system=slate, announcement=purple).
const iconMap = {
  overdue: { icon: ExclamationTriangleIcon, bg: 'bg-rose-500', spine: 'bg-rose-500', badge: 'bg-rose-100 text-rose-600' },
  reservation: { icon: CalendarDaysIcon, bg: 'bg-sky-500', spine: 'bg-sky-500', badge: 'bg-sky-100 text-sky-600' },
  fine: { icon: BanknotesIcon, bg: 'bg-amber-500', spine: 'bg-amber-500', badge: 'bg-amber-100 text-amber-600' },
  system: { icon: Cog6ToothIcon, bg: 'bg-slate-400', spine: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
  announcement: { icon: MegaphoneIcon, bg: 'bg-purple-500', spine: 'bg-purple-500', badge: 'bg-purple-100 text-purple-600' },
}

const config = computed(() => iconMap[props.notification.type] || iconMap.system)
const icon = computed(() => config.value.icon)
const iconBg = computed(() => config.value.bg)
const spineClass = computed(() => config.value.spine)
const typeBadge = computed(() => config.value.badge)

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
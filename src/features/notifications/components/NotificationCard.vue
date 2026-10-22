<template>
  <div
    role="link"
    tabindex="0"
    class="group relative bg-white dark:bg-slate-800/60 rounded-2xl border overflow-hidden flex items-start gap-3 p-3 pl-4 sm:p-4 sm:pl-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-400 dark:hover:shadow-none dark:hover:border-emerald-400/50 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
    :class="notification.is_read
      ? 'border-slate-200 dark:border-white/5'
      : 'border-slate-300 shadow-sm dark:border-white/15 dark:shadow-none'"
    @click="$emit('click')"
    @keydown.enter.self="$emit('click')"
    @keydown.space.self.prevent="$emit('click')"
  >
    <span class="absolute left-0 top-0 bottom-0 w-1.5" :class="m.spine"></span>

    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" :class="m.iconBg">
      <component :is="m.icon" class="w-5 h-5 text-white" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <p
          class="text-sm truncate transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
          :class="notification.is_read
            ? 'font-semibold text-slate-600 dark:text-slate-300'
            : 'font-bold text-slate-900 dark:text-white'"
        >
          {{ notification.title }}
        </p>
        <span
          v-if="!notification.is_read"
          class="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wider"
        >
          {{ t('notifications.new') }}
        </span>
      </div>

      <p class="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 line-clamp-2">{{ notification.message }}</p>

      <div class="flex items-center gap-2 mt-2 flex-wrap">
        <span class="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border" :class="m.badge">
          {{ typeLabel(notification.type) }}
        </span>
        <span class="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{{ formatDate(notification.created_at, false) }}</span>

        <!-- Hint: this card can be clicked to open the detail page -->
        <span class="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-300 opacity-70 group-hover:opacity-100 transition-opacity">
          {{ t('notifications.viewDetails') }}
          <ChevronRightIcon class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>

    <!-- Bigger tap targets on phones (p-2 = ~32px), original size on sm+ -->
    <div class="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0 -my-1 -mr-1 sm:my-0 sm:mr-0">
      <button
        v-if="!notification.is_read"
        type="button"
        @click.stop="$emit('read')"
        class="text-slate-300 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition p-2 sm:p-1 cursor-pointer"
        :title="t('notifications.markRead')"
      >
        <CheckIcon class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click.stop="$emit('delete')"
        class="text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition p-2 sm:p-1 cursor-pointer"
        :title="t('notifications.deleteNotification')"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useNotificationMeta } from '../composables/useNotificationMeta'

const { t } = useI18n()
const props = defineProps({ notification: { type: Object, required: true } })
defineEmits(['click', 'delete', 'read'])

const { meta, typeLabel, formatDate } = useNotificationMeta()
const m = computed(() => meta(props.notification.type))
</script>
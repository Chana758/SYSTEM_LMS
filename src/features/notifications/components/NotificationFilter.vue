<template>
  <div class="space-y-4">
    <!-- Row 1 · type pills: one swipeable row on phones, wrapped on sm+ -->
    <div
      class="flex flex-nowrap sm:flex-wrap items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/10
             overflow-x-auto sm:overflow-visible -mx-1 px-1 pt-0.5
             [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        v-for="opt in typeOptions" :key="opt.value"
        type="button"
        @click="update('type', opt.value)"
        class="h-8 px-4 rounded-full border text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0"
        :class="modelValue.type === opt.value
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/30'
          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Row 2 · search + read status + reset -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search -->
      <div :class="[boxClass, 'w-full sm:flex-1 sm:min-w-[240px]']">
        <MagnifyingGlassIcon class="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 mr-2" />
        <input
          v-model="query"
          type="text"
          :placeholder="t('notifications.filter.searchPlaceholder')"
          @input="onSearch"
          @keyup.enter="flushSearch"
          class="flex-1 min-w-0 h-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
        />
        <button
          v-if="query"
          type="button"
          @click="clearSearch"
          class="ml-2 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Read status -->
      <div :class="[boxClass, 'w-full sm:w-auto sm:min-w-[200px]']">
        <FunnelIcon class="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 mr-2" />
        <span :class="prefixClass">{{ t('notifications.filter.status') }}</span>
        <select
          :value="modelValue.is_read"
          @change="update('is_read', $event.target.value)"
          class="flex-1 min-w-0 h-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-100 focus:outline-none cursor-pointer dark:[color-scheme:dark]"
        >
          <option value="">{{ t('notifications.filter.all') }}</option>
          <option value="false">{{ t('notifications.unread') }}</option>
          <option value="true">{{ t('notifications.filter.read') }}</option>
        </select>
      </div>

      <!-- Reset -->
      <button
        v-if="hasFilter"
        type="button"
        @click="reset"
        class="group h-11 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 text-sm font-bold transition-all cursor-pointer"
      >
        <ArrowPathIcon class="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
        {{ t('notifications.filter.reset') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  MagnifyingGlassIcon, FunnelIcon, XMarkIcon, ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const props = defineProps({
  modelValue: { type: Object, default: () => ({ type: '', is_read: '', search: '' }) },
})
const emit = defineEmits(['update:modelValue', 'change'])

const query = ref(props.modelValue.search || '')
let timer = null

const typeOptions = computed(() => [
  { value: '', label: t('notifications.filter.all') },
  { value: 'overdue', label: t('notifications.typeOverdue') },
  { value: 'reservation', label: t('notifications.typeReservation') },
  { value: 'fine', label: t('notifications.typeFine') },
  { value: 'announcement', label: t('notifications.typeAnnouncement') },
  { value: 'system', label: t('notifications.typeSystem') },
])

// Same "field box" as ReportFilter: h-11, label inside.
const boxClass =
  'h-11 inline-flex items-center px-3.5 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 transition-colors ' +
  'focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/15 focus-within:bg-white dark:focus-within:bg-slate-800'

const prefixClass =
  'shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 whitespace-nowrap'

const hasFilter = computed(() =>
  !!(props.modelValue.type || props.modelValue.is_read || props.modelValue.search || query.value),
)

function update(key, value) {
  const next = { ...props.modelValue, [key]: value }
  emit('update:modelValue', next)
  emit('change', next)
}

function onSearch() {
  clearTimeout(timer)
  timer = setTimeout(() => update('search', query.value.trim()), 350)
}

function flushSearch() {
  clearTimeout(timer)
  update('search', query.value.trim())
}

function clearSearch() {
  query.value = ''
  flushSearch()
}

function reset() {
  clearTimeout(timer)
  query.value = ''
  const next = { type: '', is_read: '', search: '' }
  emit('update:modelValue', next)
  emit('change', next)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>
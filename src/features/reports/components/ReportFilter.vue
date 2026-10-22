<template>
  <div
    class="rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-3 sm:p-4 md:p-5 shadow-sm dark:shadow-none"
  >
    <!-- Presets -->
    <div v-if="showPresets" class="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-white/10">
      <button
        v-for="p in presets"
        :key="p.key"
        type="button"
        @click="setPreset(p.key)"
        class="h-8 px-3 sm:px-4 rounded-full border text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
        :class="active === p.key
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/30'
          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'"
      >
        {{ t(p.labelKey) }}
      </button>
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Date range: stacked on mobile, inline from sm -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <div :class="[boxClass, 'w-full sm:w-auto']">
          <CalendarDaysIcon class="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 mr-2" />
          <span :class="prefixClass">{{ t('reports.filter.from') }}</span>
          <input v-model="local.date_from" type="date" @change="onManualDate" :class="dateInputClass" />
        </div>

        <ArrowLongRightIcon class="hidden sm:block w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600" />

        <div :class="[boxClass, 'w-full sm:w-auto']">
          <CalendarDaysIcon class="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 mr-2" />
          <span :class="prefixClass">{{ t('reports.filter.to') }}</span>
          <input v-model="local.date_to" type="date" @change="onManualDate" :class="dateInputClass" />
        </div>
      </div>

      <!-- Status -->
      <div v-if="statusOptions.length" :class="[boxClass, 'w-full sm:w-auto sm:min-w-[200px]']">
        <FunnelIcon class="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 mr-2" />
        <span :class="prefixClass">{{ statusLabel }}</span>
        <select v-model="local.status" class="flex-1 min-w-0 h-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-100 focus:outline-none cursor-pointer dark:[color-scheme:dark]">
          <option value="">{{ t('reports.filter.all') }}</option>
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <!-- Search -->
      <div v-if="showSearch" :class="[boxClass, 'w-full sm:flex-1 sm:min-w-[220px]']">
        <MagnifyingGlassIcon class="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 mr-2" />
        <input
          v-model="local.search"
          type="text"
          :placeholder="t('reports.filter.searchPlaceholder')"
          class="flex-1 min-w-0 h-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          @keyup.enter="apply"
        />
      </div>

      <!-- Page-specific extras (e.g. "low stock only") -->
      <slot name="extra" />

      <!-- Actions -->
      <div class="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
        <button
          type="button"
          @click="reset"
          class="group h-11 flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 text-sm font-bold whitespace-nowrap transition-all cursor-pointer"
        >
          <ArrowPathIcon class="w-4 h-4 shrink-0 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          <span class="truncate">{{ t('reports.filter.reset') }}</span>
        </button>

        <button
          type="button"
          @click="apply"
          class="group h-11 flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-600 hover:border-emerald-500 text-white text-sm font-bold whitespace-nowrap shadow-sm shadow-emerald-500/25 transition-all cursor-pointer"
        >
          <CheckIcon class="w-4 h-4 shrink-0 stroke-[2.5] group-hover:scale-110 transition-transform" />
          <span class="truncate">{{ t('reports.filter.apply') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CalendarDaysIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLongRightIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const { t } = useI18n()

const props = defineProps({
  statusOptions: { type: Array, default: () => [] }, // [{value, label}] — label already translated by the caller
  statusLabel:   { type: String, default: '' },
  showSearch:    { type: Boolean, default: true },
  showPresets:   { type: Boolean, default: true },
  // today | 7d | 30d | month | year | all
  defaultPreset: { type: String, default: 'all' },
  // e.g. { status: 'overdue' } coming from a clicked KPI card
  initial:       { type: Object, default: () => ({}) },
})

// 'reset' fires BEFORE the new 'apply', so pages can clear their own extra filters.
const emit = defineEmits(['apply', 'reset'])

const presets = [
  { key: 'today', labelKey: 'reports.filter.presets.today' },
  { key: '7d',    labelKey: 'reports.filter.presets.days7' },
  { key: '30d',   labelKey: 'reports.filter.presets.days30' },
  { key: 'month', labelKey: 'reports.filter.presets.thisMonth' },
  { key: 'year',  labelKey: 'reports.filter.presets.thisYear' },
  { key: 'all',   labelKey: 'reports.filter.presets.all' },
]

// Shared "field box": every control is h-11 with its label inside.
const boxClass =
  'h-11 inline-flex items-center px-3 sm:px-3.5 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 transition-colors ' +
  'focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/15 focus-within:bg-white dark:focus-within:bg-slate-800'

const prefixClass =
  'shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 whitespace-nowrap'

const dateInputClass =
  'h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-100 focus:outline-none cursor-pointer dark:[color-scheme:dark]'

const defaults = () => ({ date_from: '', date_to: '', status: '', search: '', all_time: false })
const local = reactive(defaults())
const active = ref(props.defaultPreset)

const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const setPreset = (key, autoApply = true) => {
  const now = new Date()
  const daysAgo = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d }
  active.value = key
  local.all_time = false
  local.date_to = fmt(now)

  if (key === 'today')      local.date_from = fmt(now)
  else if (key === '7d')    local.date_from = fmt(daysAgo(6))
  else if (key === '30d')   local.date_from = fmt(daysAgo(29))
  else if (key === 'month') local.date_from = fmt(new Date(now.getFullYear(), now.getMonth(), 1))
  else if (key === 'year')  local.date_from = fmt(new Date(now.getFullYear(), 0, 1))
  else { // all
    local.date_from = ''
    local.date_to = ''
    local.all_time = true
  }
  if (autoApply) apply()
}

const onManualDate = () => {
  active.value = 'custom'
  local.all_time = false
}

const apply = () => emit('apply', { ...local })

const reset = () => {
  local.status = ''
  local.search = ''
  emit('reset')
  setPreset(props.defaultPreset)
}

// Load the first page as soon as the parent is listening.
onMounted(() => {
  if (props.initial.status) local.status = props.initial.status
  setPreset(props.initial.preset ?? props.defaultPreset, false)
  apply()
})
</script>
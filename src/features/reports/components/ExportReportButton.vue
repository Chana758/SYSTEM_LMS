<template>
  <div v-if="authStore.role === 'admin'" ref="root" class="relative">
    <button
      type="button"
      @click="open = !open"
      :disabled="exporting"
      class="px-4 py-2.5 bg-[#1c2e35] dark:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#28414a] dark:hover:bg-emerald-500 transition-colors disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
    >
      <svg v-if="exporting" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      {{ exporting ? t('reports.export.generating') : t('reports.export.export') }}
    </button>

    <div
      v-if="open && !exporting"
      class="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-white/10 shadow-xl z-20 overflow-hidden"
    >
      <button
        v-for="fmt in formats"
        :key="fmt.value"
        type="button"
        @click="handleExport(fmt.value)"
        class="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        {{ t(fmt.labelKey) }}
      </button>
    </div>

    <div
      v-if="errorMsg"
      class="absolute right-0 mt-2 w-64 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/30 text-red-600 dark:text-red-300 text-xs font-semibold rounded-xl px-3.5 py-2.5 z-20 shadow-lg"
    >
      {{ errorMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useReportStore } from '../store'

const { t } = useI18n()

const props = defineProps({
  type: { type: String, required: true },
  filters: { type: Object, default: () => ({}) },
  // Page-specific filters, e.g. { low_stock: true, dead_stock: true } or { search: 'abc', role: 'admin' }
  extra: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['exported'])

const authStore = useAuthStore()
const store = useReportStore()
const root = ref(null)
const open = ref(false)
const exporting = ref(false)
const errorMsg = ref('')
let errorTimer = null

const formats = [
  { value: 'pdf', labelKey: 'reports.export.pdf' },
  { value: 'excel', labelKey: 'reports.export.excel' },
  { value: 'csv', labelKey: 'reports.export.csv' },
]

// Close the dropdown when clicking / tapping anywhere outside it.
const onOutside = (e) => {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('pointerdown', onOutside))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutside)
  clearTimeout(errorTimer)
})

// Drop empty / false values so the backend only gets filters that are really on.
const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false))

const handleExport = async (format) => {
  open.value = false
  exporting.value = true
  errorMsg.value = ''
  try {
    const result = await store.generateExport({
      type: props.type,
      format,
      ...clean({
        date_from: props.filters.date_from,
        date_to: props.filters.date_to,
        status: props.filters.status,
        search: props.filters.search,
        all_time: props.filters.all_time ? 1 : undefined, // "All" preset
        ...props.extra,
      }),
    })
    if (result?.download_url) {
      window.open(result.download_url, '_blank')
    } else {
      errorMsg.value = t('reports.export.noFileUrl')
    }
    emit('exported', result)
  } catch (e) {
    console.error('Export failed:', e)
    errorMsg.value = e.response?.data?.message || t('reports.export.failed')
  } finally {
    exporting.value = false
    clearTimeout(errorTimer)
    errorTimer = setTimeout(() => { errorMsg.value = '' }, 5000)
  }
}
</script>
<template>
  <div v-if="authStore.role === 'admin'" class="relative">
    <button
      type="button"
      @click="open = !open"
      :disabled="exporting"
      class="px-4 py-2.5 bg-[#1c2e35] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#28414a] transition-colors disabled:opacity-40 flex items-center gap-2"
    >
      <svg v-if="exporting" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      {{ exporting ? t('reports.export.generating') : t('reports.export.export') }}
    </button>

    <div
      v-if="open && !exporting"
      class="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden"
      @click.stop
    >
      <button
        v-for="fmt in formats"
        :key="fmt.value"
        type="button"
        @click="handleExport(fmt.value)"
        class="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {{ t(fmt.labelKey) }}
      </button>
    </div>

    <!-- Shows the error to the user instead of failing silently to console.error -->
    <div
      v-if="errorMsg"
      class="absolute right-0 mt-2 w-64 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-3.5 py-2.5 z-20 shadow-lg"
    >
      {{ errorMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useReportStore } from '../store'

const { t } = useI18n()

const props = defineProps({
  type: { type: String, required: true },
  filters: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['exported'])

const authStore = useAuthStore()
const store = useReportStore()
const open = ref(false)
const exporting = ref(false)
const errorMsg = ref('')

const formats = [
  { value: 'pdf', labelKey: 'reports.export.pdf' },
  { value: 'excel', labelKey: 'reports.export.excel' },
  { value: 'csv', labelKey: 'reports.export.csv' },
]

const handleExport = async (format) => {
  open.value = false
  exporting.value = true
  errorMsg.value = ''
  try {
    const result = await store.generateExport({
      type: props.type,
      format,
      date_from: props.filters.date_from || undefined,
      date_to: props.filters.date_to || undefined,
      status: props.filters.status || undefined,
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
    setTimeout(() => { errorMsg.value = '' }, 5000)
  }
}
</script>
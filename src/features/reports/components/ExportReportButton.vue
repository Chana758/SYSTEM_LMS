<template>
  <div class="relative">
    <button
      @click="open = !open"
      :disabled="exporting"
      class="px-4 py-2.5 bg-[#1c2e35] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#28414a] transition-colors disabled:opacity-40 flex items-center gap-2"
    >
      <svg v-if="exporting" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      {{ exporting ? 'Generating…' : 'Export' }}
    </button>

    <div
      v-if="open && !exporting"
      class="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden"
      @click.stop
    >
      <button
        v-for="fmt in formats"
        :key="fmt.value"
        @click="handleExport(fmt.value)"
        class="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {{ fmt.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReportStore } from '../store'

const props = defineProps({
  type: { type: String, required: true },   // 'borrow' | 'fine' | 'user' | 'revenue' | 'stock'
  filters: { type: Object, default: () => ({}) }, // { date_from, date_to, status }
})

const emit = defineEmits(['exported'])

const store = useReportStore()
const open = ref(false)
const exporting = ref(false)

const formats = [
  { value: 'pdf', label: '📄 PDF' },
  { value: 'excel', label: '📊 Excel' },
  { value: 'csv', label: '🗒️ CSV' },
]

const handleExport = async (format) => {
  open.value = false
  exporting.value = true
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
    }
    emit('exported', result)
  } catch (e) {
    // surface however this project shows errors elsewhere (toast plugin is
    // already registered globally as `app.use(toast)` in main.js)
    console.error('Export failed:', e)
  } finally {
    exporting.value = false
  }
}
</script>
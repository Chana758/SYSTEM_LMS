<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-4 sm:p-6 transition-colors">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="accentBg">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" :class="accentText" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5v3m0-3h3m-3 0 3.75 3.75M20.25 4.5v3m0-3h-3m3 0-3.75 3.75M3.75 19.5v-3m0 3h3m-3 0 3.75-3.75M20.25 19.5v-3m0 3h-3m3 0-3.75-3.75M9 8.25v7.5M12 8.25v7.5M15 8.25v7.5" />
        </svg>
      </div>
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-white">{{ t('scanner.barcodeInput.title') }}</h3>
        <p class="text-xs text-gray-400 dark:text-slate-400">{{ t('scanner.barcodeInput.subtitle') }}</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="flex gap-2">
      <input
        ref="inputRef"
        v-model="barcode"
        type="text"
        :placeholder="t('scanner.barcodeInput.placeholder')"
        class="flex-1 min-w-0 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3 sm:px-4 py-3 text-sm font-mono tracking-wide outline-none transition"
        :class="focusRing"
      />
      <button
        type="submit"
        :disabled="!barcode.trim() || isLoading"
        class="flex-shrink-0 px-4 sm:px-6 py-3 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        :class="buttonBg"
      >
        <svg v-if="isLoading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        {{ isLoading ? t('scanner.barcodeInput.scanning') : t('scanner.barcodeInput.scan') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isLoading: { type: Boolean, default: false },
  accent: { type: String, default: 'green' },
})

const emit = defineEmits(['scan'])

const barcode = ref('')
const inputRef = ref(null)

// Touch devices (phones/tablets): don't auto-focus, or the on-screen keyboard pops up.
// Desktop (USB scanner): keep auto-focus so scans land in the input.
const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const focusInput = () => {
  if (!isTouch) inputRef.value?.focus()
}

// Full class names so Tailwind can generate them.
const accentMap = {
  green: {
    bg: 'bg-green-50 dark:bg-emerald-500/15',
    text: 'text-green-700 dark:text-emerald-300',
    ring: 'focus:ring-2 focus:ring-green-600/30 focus:border-green-600 dark:focus:border-emerald-400',
    button: 'bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-300',
    ring: 'focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400',
    button: 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-violet-500/15',
    text: 'text-purple-600 dark:text-violet-300',
    ring: 'focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-violet-400',
    button: 'bg-purple-600 hover:bg-purple-700 dark:bg-violet-600 dark:hover:bg-violet-500',
  },
}
const accentBg = computed(() => accentMap[props.accent]?.bg ?? accentMap.green.bg)
const accentText = computed(() => accentMap[props.accent]?.text ?? accentMap.green.text)
const focusRing = computed(() => accentMap[props.accent]?.ring ?? accentMap.green.ring)
const buttonBg = computed(() => accentMap[props.accent]?.button ?? accentMap.green.button)

const handleSubmit = () => {
  const value = barcode.value.trim()
  if (!value) return
  emit('scan', value)
  barcode.value = ''
  // Only re-focus after an actual scan submission, not on every blur,
  // so the user can still type into other fields (e.g. "Assign to Member").
  nextTick(focusInput)
}

// Re-focus once a loading cycle finishes so a USB scanner is ready for the next scan.
watch(
  () => props.isLoading,
  (loading, wasLoading) => {
    if (wasLoading && !loading) nextTick(focusInput)
  },
)

onMounted(focusInput)
</script>
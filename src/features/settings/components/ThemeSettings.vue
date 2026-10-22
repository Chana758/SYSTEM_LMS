<template>
  <div>
    <p class="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">{{ t('settings.theme.title') }}</p>

    <div class="grid grid-cols-3 gap-2 max-w-sm">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        @click="select(opt.value)"
        class="flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer"
        :class="modelValue === opt.value
          ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
          : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'"
      >
        <component :is="opt.icon" class="w-5 h-5" />
        {{ t(opt.labelKey) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: String, default: 'system' },
})
const emit = defineEmits(['update:modelValue'])

// markRaw: icon components must never be made reactive
const options = [
  { value: 'light', labelKey: 'settings.theme.light', icon: markRaw(SunIcon) },
  { value: 'dark', labelKey: 'settings.theme.dark', icon: markRaw(MoonIcon) },
  { value: 'system', labelKey: 'settings.theme.system', icon: markRaw(ComputerDesktopIcon) },
]

// Only emit when the choice really changes
function select(value) {
  if (value !== props.modelValue) emit('update:modelValue', value)
}
</script>
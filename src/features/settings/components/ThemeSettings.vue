<template>
  <div>
    <p class="text-sm font-semibold text-gray-800 mb-1">{{ $t('settings.theme.title') }}</p>
    <p class="text-xs text-gray-400 mb-3"></p>

    <div class="grid grid-cols-3 gap-2 max-w-sm">
      <button
        v-for="opt in options" :key="opt.value" type="button"
        @click="$emit('update:modelValue', opt.value)"
        class="flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors"
        :class="modelValue === opt.value ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
      >
        <component :is="opt.icon" class="w-5 h-5" />
        {{ $t(opt.labelKey) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'

defineProps({ modelValue: { type: String, default: 'system' } })
defineEmits(['update:modelValue'])

const options = [
  { value: 'light', labelKey: 'settings.theme.light', icon: SunIcon },
  { value: 'dark', labelKey: 'settings.theme.dark', icon: MoonIcon },
  { value: 'system', labelKey: 'settings.theme.system', icon: ComputerDesktopIcon },
]
</script>
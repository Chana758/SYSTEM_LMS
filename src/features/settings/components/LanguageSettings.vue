<template>
  <div>
    <p class="text-sm font-semibold text-gray-800 mb-1">Language</p>
    <p class="text-xs text-gray-400 mb-3">Interface display language.</p>

    <div class="grid grid-cols-2 gap-2 max-w-sm">
      <button
        v-for="opt in options" :key="opt.value" type="button"
        @click="$emit('update:modelValue', opt.value)"
        class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors"
        :class="modelValue === opt.value ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
      >
        <span class="text-base">{{ opt.flag }}</span>
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, default: 'en' } })
defineEmits(['update:modelValue'])

const options = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'km', label: 'ខ្មែរ', flag: '🇰🇭' },
]
</script>
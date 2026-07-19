<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="accentBg">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" :class="accentText" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5v3m0-3h3m-3 0 3.75 3.75M20.25 4.5v3m0-3h-3m3 0-3.75 3.75M3.75 19.5v-3m0 3h3m-3 0 3.75-3.75M20.25 19.5v-3m0 3h-3m3 0-3.75-3.75M9 8.25v7.5M12 8.25v7.5M15 8.25v7.5" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-800">Scan or Type Barcode</h3>
        <p class="text-xs text-gray-400">USB/Bluetooth scanners type directly into the field below</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="flex gap-2">
      <input
        ref="inputRef"
        v-model="barcode"
        type="text"
        autofocus
        placeholder="Scan barcode or type manually..."
        class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono tracking-wide outline-none transition"
        :class="focusRing"
        @blur="refocus"
      />
      <button
        type="submit"
        :disabled="!barcode.trim() || isLoading"
        class="px-6 py-3 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        :class="buttonBg"
      >
        <svg v-if="isLoading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        {{ isLoading ? 'Scanning' : 'Scan' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  isLoading: { type: Boolean, default: false },
  accent: { type: String, default: 'green' },
})

const emit = defineEmits(['scan'])

const barcode = ref('')
const inputRef = ref(null)

const accentMap = {
  green: { bg: 'bg-green-50', text: 'text-green-700', ring: 'focus:ring-2 focus:ring-green-600/30 focus:border-green-600', button: 'bg-green-700 hover:bg-green-800' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500', button: 'bg-blue-600 hover:bg-blue-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500', button: 'bg-purple-600 hover:bg-purple-700' },
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
}

const refocus = () => {
  nextTick(() => inputRef.value?.focus())
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>
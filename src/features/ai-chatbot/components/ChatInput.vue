<template>
  <form @submit.prevent="handleSubmit" class="flex items-center gap-2 px-4 py-3 border-t border-stone-100">
    <input
      v-model="text"
      type="text"
      :disabled="loading"
      :placeholder="t('chatbot.inputPlaceholder')"
      class="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition disabled:bg-stone-50"
    />
    <button
      type="submit"
      :disabled="!text.trim() || loading"
      class="w-10 h-10 rounded-xl bg-green-800 hover:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition"
    >
      <PaperAirplaneIcon class="w-4 h-4 text-amber-400" />
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'

defineProps({
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['send'])
const { t } = useI18n()

const text = ref('')

function handleSubmit() {
  const value = text.value.trim()
  if (!value) return
  emit('send', value)
  text.value = ''
}

// Exposed so the parent page can programmatically fill+send from a suggestion chip.
defineExpose({ text })
</script>
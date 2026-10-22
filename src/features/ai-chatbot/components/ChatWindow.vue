<template>
  <div ref="scrollRef" class="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-3 min-h-[50dvh] max-h-[60dvh] sm:min-h-[480px] sm:max-h-[640px]">
    <div v-if="!messages.length" class="h-full flex flex-col items-center justify-center text-center py-6">
      <div class="w-14 h-14 rounded-2xl bg-green-50 dark:bg-emerald-500/15 dark:border dark:border-emerald-400/25 flex items-center justify-center mb-3">
        <ChatBubbleLeftRightIcon class="w-7 h-7 text-green-700 dark:text-emerald-300" />
      </div>
      <p class="text-sm font-semibold text-stone-600 dark:text-slate-200">{{ t('chatbot.empty.title') }}</p>
      <p class="text-xs text-stone-400 dark:text-slate-400 mt-1 mb-4 max-w-xs">{{ t('chatbot.empty.description') }}</p>
      <QuickSuggestions @pick="$emit('suggest', $event)" />
    </div>

    <ChatMessage
      v-for="(m, i) in messages"
      :key="i"
      :role="m.role"
      :text="m.text"
      :timestamp="m.timestamp"
    />

    <TypingIndicator v-if="loading" />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
import ChatMessage from './ChatMessage.vue'
import TypingIndicator from './TypingIndicator.vue'
import QuickSuggestions from './QuickSuggestions.vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
defineEmits(['suggest'])

const { t } = useI18n()
const scrollRef = ref(null)

function scrollToBottom() {
  if (scrollRef.value) {
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
}

watch(
  () => [props.messages.length, props.loading],
  () => nextTick(scrollToBottom)
)
</script>
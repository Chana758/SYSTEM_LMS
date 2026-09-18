<template>
  <div class="flex gap-2" :class="isUser ? 'justify-end' : 'justify-start'">
    <div
      v-if="!isUser"
      class="w-7 h-7 rounded-lg bg-green-800 flex items-center justify-center flex-shrink-0 self-end"
    >
      <CpuChipIcon class="w-4 h-4 text-amber-400" />
    </div>

    <div
      class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed"
      :class="isUser
        ? 'bg-green-800 text-white rounded-br-sm'
        : 'bg-stone-100 text-stone-800 rounded-bl-sm'"
    >
      {{ text }}
      <p class="text-[10px] mt-1 opacity-60" :class="isUser ? 'text-green-100' : 'text-stone-400'">
        {{ formattedTime }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CpuChipIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  role: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: [String, Date], default: () => new Date() },
})

const { locale } = useI18n()

const isUser = computed(() => props.role === 'user')

const formattedTime = computed(() =>
  new Date(props.timestamp).toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
)
</script>
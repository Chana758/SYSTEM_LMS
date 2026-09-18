<template>
  <div class="min-h-full bg-stone-50 p-6 lg:p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Page heading -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-11 h-11 rounded-2xl bg-green-800 flex items-center justify-center flex-shrink-0">
          <CpuChipIcon class="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-stone-800">{{ t('chatbot.title') }}</h1>
          <p class="text-sm text-stone-400">{{ t('chatbot.subtitle') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
        <!-- Chat card -->
        <div class="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
          <ChatHeader @clear="handleClear" />
          <ChatWindow :messages="messages" :loading="loading" @suggest="handleSend" />
          <ChatInput :loading="loading" @send="handleSend" />
          <p v-if="error" class="text-xs text-red-600 px-4 pb-3">{{ error }}</p>
        </div>

        <!-- Side panel — fills the empty space with real, useful info -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-stone-200 p-4">
            <p class="text-xs font-bold text-stone-800 mb-3">{{ t('chatbot.sidebar.tipsTitle') }}</p>
            <ul class="space-y-2.5">
              <li v-for="tip in tips" :key="tip" class="flex items-start gap-2 text-xs text-stone-500 leading-relaxed">
                <SparklesIcon class="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                {{ tip }}
              </li>
            </ul>
          </div>

          <div class="bg-green-800 rounded-2xl p-4 text-white">
            <p class="text-xs font-bold mb-1.5">{{ t('chatbot.sidebar.noteTitle') }}</p>
            <p class="text-xs text-green-100 leading-relaxed">
              {{ t('chatbot.sidebar.noteBody') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { CpuChipIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import ChatHeader from '../components/ChatHeader.vue'
import ChatWindow from '../components/ChatWindow.vue'
import ChatInput from '../components/ChatInput.vue'
import { chatbotService } from '../services/chatbotService'

const { t } = useI18n()

const messages = ref([])
const loading = ref(false)
const error = ref('')

const tips = computed(() => [
  t('chatbot.sidebar.tips.dueDate'),
  t('chatbot.sidebar.tips.search'),
  t('chatbot.sidebar.tips.hours'),
  t('chatbot.sidebar.tips.general'),
])

async function handleSend(text) {
  error.value = ''
  messages.value.push({ role: 'user', text, timestamp: new Date() })
  loading.value = true
  try {
    const { data } = await chatbotService.sendMessage(text)
    messages.value.push({ role: 'bot', text: data.data.response, timestamp: data.data.created_at })
  } catch (e) {
    error.value = e.response?.data?.message || t('chatbot.sendError')
  } finally {
    loading.value = false
  }
}

async function handleClear() {
  if (!confirm(t('chatbot.clearConfirm'))) return
  try {
    await chatbotService.clearHistory()
    messages.value = []
  } catch (e) {
    error.value = t('chatbot.clearError')
  }
}

async function loadHistory() {
  try {
    const { data } = await chatbotService.getHistory({ per_page: 20 })
    const items = (data.data ?? []).slice().reverse()
    messages.value = items.flatMap((h) => [
      { role: 'user', text: h.message, timestamp: h.created_at },
      { role: 'bot', text: h.response, timestamp: h.created_at },
    ])
  } catch (e) {
    // fail soft — chat still works even if history can't load
  }
}

onMounted(loadHistory)
</script>
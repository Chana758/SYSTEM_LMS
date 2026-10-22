<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <!-- Page heading -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-black/30 flex items-center gap-3 sm:gap-4 transition-colors">
        <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-green-800 dark:bg-gradient-to-br dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center flex-shrink-0">
          <CpuChipIcon class="w-6 h-6 text-amber-400 dark:text-white" />
        </div>
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black text-stone-800 dark:text-white tracking-tight">{{ t('chatbot.title') }}</h1>
          <p class="text-xs font-bold text-stone-400 dark:text-slate-400 mt-0.5">{{ t('chatbot.subtitle') }}</p>
        </div>
      </div>

      <!-- Phone/tablet: tips live in a collapsible bar ABOVE the chat (so nothing is stuck under it). Hidden on lg+ -->
      <div class="lg:hidden bg-white dark:bg-slate-800/50 rounded-2xl border border-stone-200 dark:border-white/10 overflow-hidden transition-colors">
        <button
          type="button"
          @click="showTips = !showTips"
          :aria-expanded="showTips"
          class="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer"
        >
          <span class="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-white">
            <LightBulbIcon class="w-4 h-4 text-amber-500 dark:text-amber-300" />
            {{ t('chatbot.sidebar.tipsTitle') }}
          </span>
          <ChevronDownIcon
            class="w-4 h-4 text-stone-400 dark:text-slate-400 transition-transform duration-200"
            :class="showTips ? 'rotate-180' : ''"
          />
        </button>
        <ul v-show="showTips" class="space-y-2.5 px-4 pb-4 pt-1 border-t border-stone-100 dark:border-white/10">
          <li v-for="tip in tips" :key="tip" class="flex items-start gap-2 text-xs text-stone-500 dark:text-slate-300 leading-relaxed first:mt-3">
            <SparklesIcon class="w-3.5 h-3.5 text-amber-500 dark:text-amber-300 flex-shrink-0 mt-0.5" />
            {{ tip }}
          </li>
        </ul>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
        <!-- Chat card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-white/10 shadow-sm dark:shadow-black/30 flex flex-col overflow-hidden transition-colors">
          <ChatHeader @clear="handleClear" />
          <ChatWindow :messages="messages" :loading="loading" @suggest="handleSend" />
          <ChatInput :loading="loading" @send="handleSend" />
          <p v-if="error" class="text-xs text-red-600 dark:text-rose-400 px-4 pb-3">{{ error }}</p>

          <!-- Phone/tablet: AI disclaimer as a small line under the input. Hidden on lg+ (the green note is in the side panel) -->
          <p class="lg:hidden flex items-start gap-1.5 px-4 pb-3 text-[11px] leading-snug text-stone-400 dark:text-slate-500">
            <InformationCircleIcon class="w-3.5 h-3.5 flex-shrink-0 mt-px" />
            <span>{{ t('chatbot.sidebar.noteBody') }}</span>
          </p>
        </div>

        <!-- Side panel: desktop only -->
        <div class="hidden lg:block space-y-4">
          <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-stone-200 dark:border-white/10 p-4 transition-colors">
            <p class="text-xs font-bold text-stone-800 dark:text-white mb-3">{{ t('chatbot.sidebar.tipsTitle') }}</p>
            <ul class="space-y-2.5">
              <li v-for="tip in tips" :key="tip" class="flex items-start gap-2 text-xs text-stone-500 dark:text-slate-300 leading-relaxed">
                <SparklesIcon class="w-3.5 h-3.5 text-amber-500 dark:text-amber-300 flex-shrink-0 mt-0.5" />
                {{ tip }}
              </li>
            </ul>
          </div>

          <div class="bg-green-800 dark:bg-gradient-to-br dark:from-emerald-600 dark:via-emerald-700 dark:to-emerald-900 dark:border dark:border-emerald-300/30 rounded-2xl p-4 text-white">
            <p class="text-xs font-bold mb-1.5">{{ t('chatbot.sidebar.noteTitle') }}</p>
            <p class="text-xs text-green-100 dark:text-emerald-100 leading-relaxed">
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
import {
  CpuChipIcon, SparklesIcon, LightBulbIcon, ChevronDownIcon, InformationCircleIcon,
} from '@heroicons/vue/24/outline'
import ChatHeader from '../components/ChatHeader.vue'
import ChatWindow from '../components/ChatWindow.vue'
import ChatInput from '../components/ChatInput.vue'
import { chatbotService } from '../services/chatbotService'

const { t } = useI18n()

const messages = ref([])
const loading = ref(false)
const error = ref('')
const showTips = ref(false) // phone/tablet: tips bar collapsed by default

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
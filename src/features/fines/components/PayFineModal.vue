<template>
  <Teleport to="body">
    <!-- Bottom sheet on phones, centered dialog from sm up -->
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs sm:p-4"
      @click.self="emit('cancel')"
    >
      <div class="w-full sm:max-w-sm max-h-[92dvh] overflow-y-auto overscroll-contain space-y-5 rounded-t-3xl sm:rounded-2xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-8 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] sm:pb-6 md:pb-8 shadow-xl dark:shadow-black/50">
        <!-- Header: who + what -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 flex-shrink-0 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl flex items-center justify-center shadow-2xs">
            <BanknotesIcon class="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div class="min-w-0">
            <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ t('fines.confirmPayment') }}</h2>
            <p class="truncate text-xs font-bold text-slate-500 dark:text-slate-400">
              {{ memberName || '—' }}<span v-if="bookTitle"> · {{ bookTitle }}</span>
            </p>
          </div>
        </div>

        <!-- Big amount -->
        <div class="rounded-xl border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 p-4 text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ t('fines.amountDue') }}</p>
          <p class="mt-1 text-4xl font-black leading-none text-slate-900 dark:text-white">${{ amount }}</p>
        </div>

        <!-- Payment method: tap to choose (Cash is preselected) -->
        <div class="space-y-1.5">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ t('fines.paymentMethod') }}</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="m in methods"
              :key="m.value"
              type="button"
              @click="method = m.value"
              class="rounded-xl border-2 px-3 py-3 sm:py-2.5 text-xs font-extrabold transition-colors cursor-pointer"
              :class="method === m.value
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-white/5'"
            >
              {{ t(m.key) }}
            </button>
          </div>
        </div>

        <!-- Server error (e.g. already paid) -->
        <p v-if="error" class="text-xs font-bold text-rose-500 dark:text-rose-400">{{ error }}</p>

        <div class="flex gap-3 pt-1">
          <button
            type="button"
            :disabled="processing"
            @click="emit('cancel')"
            class="flex-1 border-2 border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 py-3 sm:py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs disabled:opacity-50"
          >
            {{ t('fines.cancel') }}
          </button>
          <button
            type="button"
            :disabled="processing"
            @click="emit('confirm', method)"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white py-3 sm:py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-sm"
          >
            {{ processing ? t('fines.processing') : t('fines.confirmPaymentBtn') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { BanknotesIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

const props = defineProps({
  fine: { type: Object, required: true },
  processing: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
const emit = defineEmits(['confirm', 'cancel'])

const methods = [
  { value: 'cash', key: 'fines.methodCash' },
  { value: 'card', key: 'fines.methodCard' },
  { value: 'bank_transfer', key: 'fines.methodBankTransfer' },
  { value: 'other', key: 'fines.methodOther' },
]

const method = ref('cash')

const amount = computed(() => Number(props.fine.amount || 0).toFixed(2))
const memberName = computed(() => props.fine.borrow?.member?.user?.name || '')
const bookTitle = computed(() => props.fine.borrow?.book_copy?.book?.title || '')

// Esc closes the dialog.
function onKey(e) {
  if (e.key === 'Escape' && !props.processing) emit('cancel')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
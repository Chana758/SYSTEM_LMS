<template>
  <!-- B4.3 (Sam): who is borrowing. Scan the member card first (or type the member / student number). -->
  <div class="rounded-2xl border shadow-2xs transition-colors"
    :class="member ? (refusal ? 'border-rose-300 dark:border-rose-400/40 bg-rose-50/60 dark:bg-rose-500/10' : 'border-emerald-300 dark:border-emerald-400/30 bg-emerald-50/60 dark:bg-emerald-500/10') : 'border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-800/50'">

    <!-- No member yet -->
    <div v-if="!member" class="p-4 sm:p-5 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <IdentificationIcon class="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
        </div>
        <div>
          <p class="text-sm font-black text-slate-900 dark:text-white">{{ t('scanner.desk.step1') }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('scanner.desk.step1Hint') }}</p>
        </div>
      </div>
      <div class="relative">
        <input v-model.trim="search" @input="onSearch" @keyup.enter="submitTyped" :placeholder="t('scanner.desk.searchPlaceholder')"
          class="w-full h-11 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 text-sm outline-none focus:border-emerald-600" />
        <ul v-if="options.length" class="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 shadow-lg">
          <li v-for="m in options" :key="m.id">
            <button type="button" @click="pick(m)" class="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer">
              <span class="font-semibold text-slate-900 dark:text-white">{{ m.user?.name }}</span>
              <span class="ml-2 text-xs text-slate-400">{{ m.membership_no }}</span>
            </button>
          </li>
        </ul>
      </div>
      <p v-if="error" class="text-xs font-bold text-rose-600 dark:text-rose-300">{{ error }}</p>
    </div>

    <!-- Member loaded -->
    <div v-else class="p-4 sm:p-5 space-y-3">
      <div class="flex items-start gap-3">
        <img v-if="member.avatar" :src="member.avatar" alt="" class="w-12 h-12 rounded-xl object-cover bg-white" />
        <div v-else class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-lg font-black text-emerald-700">{{ (member.name || '?').slice(0, 1) }}</div>
        <div class="flex-1 min-w-0">
          <p class="text-base font-black text-slate-900 dark:text-white truncate">{{ member.name }}<span v-if="member.name_en" class="ml-2 text-sm font-semibold text-slate-500">{{ member.name_en }}</span></p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ member.membership_no }}<span v-if="member.class_name"> · {{ member.class_name }}</span><span v-if="member.membership_type"> · {{ member.membership_type }}</span>
          </p>
        </div>
        <button type="button" @click="$emit('clear')" class="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline cursor-pointer">{{ t('scanner.desk.change') }}</button>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 py-2">
          <p class="text-[11px] text-slate-500">{{ t('scanner.desk.loans') }}</p>
          <p class="text-lg font-black tabular-nums" :class="loans.active_loans >= loans.max_books ? 'text-rose-600' : 'text-slate-900 dark:text-white'">{{ loans.active_loans }}/{{ loans.max_books }}</p>
        </div>
        <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 py-2">
          <p class="text-[11px] text-slate-500">{{ t('scanner.desk.overdue') }}</p>
          <p class="text-lg font-black tabular-nums" :class="loans.overdue ? 'text-amber-600' : 'text-slate-900 dark:text-white'">{{ loans.overdue }}</p>
        </div>
        <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 py-2">
          <p class="text-[11px] text-slate-500">{{ t('scanner.desk.fines') }}</p>
          <p class="text-lg font-black tabular-nums" :class="loans.unpaid_fines_khr ? 'text-rose-600' : 'text-slate-900 dark:text-white'">{{ formatMoney(loans.unpaid_fines_khr || 0) }}</p>
        </div>
      </div>

      <p v-if="refusal" class="text-sm font-bold text-rose-700 dark:text-rose-200 bg-white/70 dark:bg-rose-500/10 rounded-xl px-3 py-2">{{ refusal.message }}</p>
      <p v-else class="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{{ t('scanner.desk.step2', { n: remaining }) }}</p>

      <details v-if="current.length" class="text-xs text-slate-600 dark:text-slate-300">
        <summary class="cursor-pointer font-bold">{{ t('scanner.desk.currentLoans', { n: current.length }) }}</summary>
        <ul class="mt-2 space-y-1">
          <li v-for="c in current" :key="c.id" class="flex justify-between gap-2">
            <span class="truncate">{{ c.book_copy?.book?.title }}</span>
            <span class="tabular-nums whitespace-nowrap" :class="isLate(c) ? 'text-rose-600 font-bold' : ''">{{ day(c.due_date) }}</span>
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IdentificationIcon } from '@heroicons/vue/24/outline'
import { scannerService } from '../services'
import { formatMoney } from '@/utils/currencyHelper'

const props = defineProps({
  data: { type: Object, default: null }, // response of POST /scan/member
  error: { type: String, default: '' },
})
const emit = defineEmits(['lookup', 'clear'])
const { t } = useI18n()

const member = computed(() => props.data?.member || null)
const loans = computed(() => props.data?.loans || {})
const current = computed(() => props.data?.current || [])
const refusal = computed(() => loans.value.refusal || null)
const remaining = computed(() => Math.max(0, (loans.value.max_books || 0) - (loans.value.active_loans || 0)))

const day = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
const isLate = (c) => c.status === 'overdue' || new Date(c.due_date) < new Date()

// Typing a name: suggest members. Enter on a number: look it up as membership / student number.
const search = ref('')
const options = ref([])
let timer = null
function onSearch() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (search.value.length < 2) return (options.value = [])
    try {
      const { data } = await scannerService.searchMembers(search.value)
      options.value = (data.data ?? data).slice(0, 8)
    } catch {
      options.value = []
    }
  }, 300)
}
function pick(m) {
  options.value = []
  search.value = ''
  emit('lookup', m.membership_no)
}
function submitTyped() {
  if (!search.value) return
  options.value = []
  emit('lookup', search.value)
  search.value = ''
}
</script>

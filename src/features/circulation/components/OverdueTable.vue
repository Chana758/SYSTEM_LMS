<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 overflow-hidden shadow-2xs">

    <!--  Phone: loading / empty / cards -->
    <div class="md:hidden">
      <div v-if="loading" class="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">
        <div class="w-7 h-7 border-3 border-rose-600 dark:border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('circulation.overduePage.table.loading') }}</p>
      </div>

      <p v-else-if="!items.length" class="text-center py-12 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
        {{ t('circulation.overduePage.table.empty') }}
      </p>

      <div v-else class="divide-y divide-slate-200 dark:divide-white/5">
        <div v-for="b in items" :key="b.id" class="p-4 space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-900 dark:text-white leading-snug break-words">{{ b.book_copy?.book?.title }}</p>
              <p class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{{ b.member?.user?.name }}</p>
              <p class="text-[11px] font-mono text-slate-400 dark:text-slate-500">{{ b.member?.membership_no }}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-200 dark:border-rose-500/20 flex-shrink-0">
              {{ t('circulation.overduePage.table.days', daysLate(b.due_date)) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-x-4 text-xs">
            <div>
              <p :class="lbl">{{ t('circulation.overduePage.table.dueDate') }}</p>
              <p class="font-bold text-rose-600 dark:text-rose-400">{{ formatDate(b.due_date) }}</p>
            </div>
            <div>
              <p :class="lbl">{{ t('circulation.overduePage.table.estFine') }}</p>
              <p class="font-black font-mono text-rose-600 dark:text-rose-400">{{ estimatedFine(b.due_date).toLocaleString() }}៛</p>
            </div>
          </div>

          <div class="flex gap-2 pt-1">
            <button
              @click="$emit('remind', b)"
              class="flex-1 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold text-xs transition-colors border border-blue-200 dark:border-blue-500/20 cursor-pointer"
            >
              {{ t('circulation.overduePage.table.sendReminder') }}
            </button>
            <button
              @click="$emit('return', b)"
              class="flex-1 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-bold text-xs transition-colors border border-emerald-200 dark:border-emerald-500/20 cursor-pointer"
            >
              {{ t('circulation.overduePage.table.returnBook') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ Tablet/desktop: table ============ -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-300 dark:border-white/10">
          <tr>
            <th class="px-5 py-3.5">{{ t('circulation.overduePage.table.book') }}</th>
            <th class="px-5 py-3.5">{{ t('circulation.overduePage.table.member') }}</th>
            <th class="px-5 py-3.5">{{ t('circulation.overduePage.table.dueDate') }}</th>
            <th class="px-5 py-3.5">{{ t('circulation.overduePage.table.daysLate') }}</th>
            <th class="px-5 py-3.5">{{ t('circulation.overduePage.table.estFine') }}</th>
            <th class="px-5 py-3.5 text-right">{{ t('circulation.overduePage.table.action') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">
              <div class="w-7 h-7 border-3 border-rose-600 dark:border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('circulation.overduePage.table.loading') }}</p>
            </td>
          </tr>
          <tr v-else-if="!items.length">
            <td colspan="6" class="text-center py-12 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              {{ t('circulation.overduePage.table.empty') }}
            </td>
          </tr>
          <!-- Rows only render when not loading and there is data -->
          <template v-else>
            <tr
              v-for="b in items"
              :key="b.id"
              class="hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-colors"
            >
              <!-- Book Title -->
              <td class="px-5 py-4 font-bold text-slate-900 dark:text-white leading-snug">
                {{ b.book_copy?.book?.title }}
              </td>

              <!-- Member Info -->
              <td class="px-5 py-4">
                <p class="font-bold text-slate-800 dark:text-slate-200">{{ b.member?.user?.name }}</p>
                <p class="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{{ b.member?.membership_no }}</p>
              </td>

              <!-- Due Date -->
              <td class="px-5 py-4 font-bold text-rose-600 dark:text-rose-400">
                {{ formatDate(b.due_date) }}
              </td>

              <!-- Days Late Badge -->
              <td class="px-5 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-200 dark:border-rose-500/20 shadow-2xs">
                  {{ t('circulation.overduePage.table.days', daysLate(b.due_date)) }}
                </span>
              </td>

              <!-- Estimated Fine -->
              <td class="px-5 py-4 text-rose-600 dark:text-rose-400 font-black font-mono">
                {{ estimatedFine(b.due_date).toLocaleString() }}៛
              </td>

              <!-- Actions -->
              <td class="px-5 py-4 text-right whitespace-nowrap">
                <div class="inline-flex items-center gap-2 justify-end">
                  <button
                    @click="$emit('remind', b)"
                    class="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold text-[11px] transition-colors border border-blue-200 dark:border-blue-500/20 cursor-pointer shadow-2xs"
                  >
                    {{ t('circulation.overduePage.table.sendReminder') }}
                  </button>
                  <button
                    @click="$emit('return', b)"
                    class="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-bold text-[11px] transition-colors border border-emerald-200 dark:border-emerald-500/20 cursor-pointer shadow-2xs"
                  >
                    {{ t('circulation.overduePage.table.returnBook') }}
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
defineEmits(['return', 'remind'])

const { t, locale } = useI18n()

const lbl = 'text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5'

// Estimated fine per late day in Riel (display only; the backend decides the real fine)
const FINE_PER_DAY = 500

// Date format that follows the selected language (Khmer or English)
const dateLocale = computed(() => (locale.value === 'km' ? 'km-KH' : 'en-US'))

// Format a due date for display in the current language
function formatDate(date) {
  return new Date(date).toLocaleDateString(dateLocale.value)
}

// Whole days between the due date and now (never below 0)
function daysLate(dueDate) {
  const diff = Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

// Estimated fine for one borrow: days late multiplied by the daily rate
function estimatedFine(dueDate) {
  return daysLate(dueDate) * FINE_PER_DAY
}
</script>
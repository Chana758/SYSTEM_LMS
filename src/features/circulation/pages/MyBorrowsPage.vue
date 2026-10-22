<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

      <!-- Header Banner -->
      <div class="flex items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 sm:gap-5 min-w-0">
          <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <BookOpenIcon class="w-6 h-6 sm:w-7 sm:h-7 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('circulation.myBorrows.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{{ $t('circulation.myBorrows.subtitle') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/20 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('circulation.myBorrows.myLoans') }}
        </span>
      </div>

      <!-- Content Area -->
      <div class="space-y-4">
        <!-- Empty State -->
        <div v-if="store.myBorrows.length === 0" class="text-center py-12 sm:py-16">
          <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <BookOpenIcon class="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('circulation.myBorrows.noHistory') }}</p>
        </div>

        <!-- Loans Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div
            v-for="b in store.myBorrows"
            :key="b.id"
            class="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 rounded-xl p-3.5 sm:p-4 text-sm hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div class="flex justify-between items-start gap-3">
                <div class="min-w-0">
                  <p class="font-extrabold text-slate-900 dark:text-white leading-snug break-words">{{ b.book_copy?.book?.title }}</p>
                  <p class="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">
                    {{ $t('circulation.category') }}: <span class="text-slate-700 dark:text-slate-300">{{ b.book_copy?.book?.category?.name || '—' }}</span>
                  </p>
                </div>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex-shrink-0 shadow-2xs"
                  :class="badgeClass(b)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="b.status === 'returned' ? 'bg-slate-400' : (isOverdue(b.due_date) ? 'bg-rose-500' : 'bg-emerald-500')"></span>
                  {{ statusLabel(b) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <p>{{ $t('circulation.borrowed') }}: <span class="text-slate-800 dark:text-slate-200 font-bold">{{ formatDate(b.borrow_date) }}</span></p>
                <p>{{ $t('circulation.dueDate') }}: <span class="text-slate-800 dark:text-slate-200 font-bold">{{ formatDate(b.due_date) }}</span></p>
                <p>{{ $t('circulation.renewals') }}: <span class="text-slate-800 dark:text-slate-200 font-bold">{{ b.renewed_count }} / 2</span></p>
                <p v-if="b.fines?.length">
                  {{ $t('circulation.myBorrows.fines') }}: <span class="text-rose-600 dark:text-rose-400 font-black font-mono">{{ totalFine(b) }}៛</span>
                </p>
              </div>
            </div>

            <!-- Renew Action Footer -->
            <div v-if="b.status === 'borrowed'" class="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <button
                v-if="b.renewed_count < 2 && !isOverdue(b.due_date)"
                @click="handleRenew(b)"
                class="w-full sm:w-auto text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-3.5 py-2.5 sm:py-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs cursor-pointer"
              >
                {{ $t('circulation.myBorrows.renewBook') }}
              </button>
              <span v-else-if="isOverdue(b.due_date)" class="text-xs font-bold text-rose-600 dark:text-rose-400">
                {{ $t('circulation.myBorrows.overdueMsg') }}
              </span>
              <span v-else class="text-xs font-bold text-slate-400 dark:text-slate-500">{{ $t('circulation.myBorrows.maxRenewals') }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { useCirculationStore } from '../store/circulationStore'

const store = useCirculationStore()
const { t } = useI18n()

async function handleRenew(b) {
  const result = await store.renew(b.id, true)
  alert(result.message)
  if (result.success) store.fetchMyBorrows()
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString('en-US') : '—'
}
function isOverdue(dueDate) {
  return new Date(dueDate) < new Date()
}
function statusLabel(b) {
  if (b.status === 'returned') return t('circulation.returnedStatus')
  return isOverdue(b.due_date) ? t('circulation.overdue') : t('circulation.active')
}
function badgeClass(b) {
  if (b.status === 'returned') return 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  return isOverdue(b.due_date)
    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/20'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20'
}
function totalFine(b) {
  return b.fines.reduce((sum, f) => sum + Number(f.amount), 0)
}

onMounted(() => store.fetchMyBorrows())
</script>
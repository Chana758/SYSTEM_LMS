<template>
  <div class="space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-6">
      
      <!-- Header Banner -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <BookOpenIcon class="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('circulation.myBorrows.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 mt-1">{{ $t('circulation.myBorrows.subtitle') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('circulation.myBorrows.myLoans') }}
        </span>
      </div>

      <!-- Content Area -->
      <div class="space-y-4">
        <div v-if="store.myBorrows.length === 0" class="text-center py-16">
          <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <BookOpenIcon class="w-6 h-6 text-slate-400" />
          </div>
          <p class="text-xs font-bold text-slate-500">{{ $t('circulation.myBorrows.noHistory') }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="b in store.myBorrows" :key="b.id" class="border border-slate-200 bg-white rounded-xl p-4 text-sm hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start gap-3">
                <div>
                  <p class="font-extrabold text-slate-900 leading-snug">{{ b.book_copy?.book?.title }}</p>
                  <p class="text-slate-500 text-xs font-medium mt-0.5">
                    {{ $t('circulation.category') }}: <span class="text-slate-700">{{ b.book_copy?.book?.category?.name || '—' }}</span>
                  </p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex-shrink-0"
                  :class="badgeClass(b)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="b.status === 'returned' ? 'bg-slate-400' : (isOverdue(b.due_date) ? 'bg-rose-500' : 'bg-emerald-500')"></span>
                  {{ statusLabel(b) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <p>{{ $t('circulation.borrowed') }}: <span class="text-slate-800 font-bold">{{ formatDate(b.borrow_date) }}</span></p>
                <p>{{ $t('circulation.dueDate') }}: <span class="text-slate-800 font-bold">{{ formatDate(b.due_date) }}</span></p>
                <p>{{ $t('circulation.renewals') }}: <span class="text-slate-800 font-bold">{{ b.renewed_count }} / 2</span></p>
                <p v-if="b.fines?.length">
                  {{ $t('circulation.myBorrows.fines') }}: <span class="text-rose-600 font-bold">{{ totalFine(b) }}៛</span>
                </p>
              </div>
            </div>

            <div v-if="b.status === 'borrowed'" class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                v-if="b.renewed_count < 2 && !isOverdue(b.due_date)"
                @click="handleRenew(b)"
                class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-1.5 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                {{ $t('circulation.myBorrows.renewBook') }}
              </button>
              <span v-else-if="isOverdue(b.due_date)" class="text-xs font-bold text-rose-600">
                {{ $t('circulation.myBorrows.overdueMsg') }}
              </span>
              <span v-else class="text-xs font-bold text-slate-400">{{ $t('circulation.myBorrows.maxRenewals') }}</span>
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
  if (b.status === 'returned') return 'bg-slate-100 text-slate-600 border-slate-200'
  return isOverdue(b.due_date) ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
}
function totalFine(b) {
  return b.fines.reduce((sum, f) => sum + Number(f.amount), 0)
}

onMounted(() => store.fetchMyBorrows())
</script>
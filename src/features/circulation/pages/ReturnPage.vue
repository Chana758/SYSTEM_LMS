<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

      <!-- Header Banner -->
      <div class="flex items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 sm:gap-5 min-w-0">
          <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ArrowUturnLeftIcon class="w-6 h-6 sm:w-7 sm:h-7 text-blue-700 dark:text-blue-300" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('circulation.returnPage.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{{ $t('circulation.returnPage.subtitle') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-500/20 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('circulation.returnPage.title') }}
        </span>
      </div>

      <!-- Search Toolbar -->
      <div class="bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-white/10 p-3 sm:p-4">
        <div class="relative">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="store.filters.search"
            @input="debouncedSearch"
            type="text"
            :placeholder="$t('circulation.returnPage.searchPlaceholder')"
            class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 transition-shadow shadow-2xs"
          />
        </div>
      </div>

      <!-- Data -->
      <div class="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-2xs">

        <!-- Phone: loading / empty / cards  -->
        <div class="md:hidden">
          <div v-if="store.loading" class="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">
            <div class="w-7 h-7 border-3 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ $t('circulation.returnPage.loadingCheckouts') }}</p>
          </div>

          <div v-else-if="!store.borrows.length" class="py-14 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <ArrowUturnLeftIcon class="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('circulation.noActiveCheckouts') }}</p>
          </div>

          <div v-else class="divide-y divide-slate-200 dark:divide-white/5">
            <div v-for="b in store.borrows" :key="b.id" class="p-4 space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-900 dark:text-white leading-snug break-words">{{ b.book_copy?.book?.title }}</p>
                  <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {{ b.book_copy?.book?.category?.name || '—' }}
                    <span class="mx-1">·</span>
                    <span class="font-mono">{{ b.book_copy?.barcode || '—' }}</span>
                  </p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex-shrink-0"
                  :class="isOverdue(b.due_date) ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="isOverdue(b.due_date) ? 'bg-rose-500' : 'bg-emerald-500'"></span>
                  {{ isOverdue(b.due_date) ? $t('circulation.overdue') : $t('circulation.active') }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div>
                  <p :class="lbl">{{ $t('circulation.member') }}</p>
                  <p class="font-bold text-slate-800 dark:text-slate-200">{{ b.member?.user?.name }}</p>
                </div>
                <div>
                  <p :class="lbl">{{ $t('circulation.librarian') }}</p>
                  <p class="font-semibold text-slate-700 dark:text-slate-300">{{ b.librarian?.user?.name || '—' }}</p>
                </div>
                <div>
                  <p :class="lbl">{{ $t('circulation.returnPage.borrowDate') }}</p>
                  <p class="font-semibold text-slate-700 dark:text-slate-300">{{ formatDate(b.borrow_date) }}</p>
                </div>
                <div>
                  <p :class="lbl">{{ $t('circulation.dueDate') }}</p>
                  <p :class="isOverdue(b.due_date) ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-semibold'">{{ formatDate(b.due_date) }}</p>
                </div>
              </div>

              <button
                @click="returningBorrow = b"
                class="w-full text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 rounded-xl py-2.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
              >
                {{ $t('circulation.returnBook') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tablet/desktop: table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-300 dark:border-white/10">
              <tr>
                <th class="px-5 py-3.5">{{ $t('circulation.returnPage.book') }}</th>
                <th class="px-4 py-3.5">{{ $t('circulation.category') }}</th>
                <th class="px-4 py-3.5">{{ $t('circulation.barcode') }}</th>
                <th class="px-4 py-3.5">{{ $t('circulation.member') }}</th>
                <th class="px-4 py-3.5">{{ $t('circulation.librarian') }}</th>
                <th class="px-4 py-3.5">{{ $t('circulation.returnPage.borrowDate') }}</th>
                <th class="px-4 py-3.5">{{ $t('circulation.dueDate') }}</th>
                <th class="px-4 py-3.5">{{ $t('common.table.status') }}</th>
                <th class="px-5 py-3.5 text-right">{{ $t('common.table.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <tr v-if="store.loading">
                <td colspan="9" class="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">
                  <div class="w-7 h-7 border-3 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ $t('circulation.returnPage.loadingCheckouts') }}</p>
                </td>
              </tr>
              <tr v-else-if="!store.borrows.length">
                <td colspan="9" class="py-16 text-center">
                  <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <ArrowUturnLeftIcon class="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('circulation.noActiveCheckouts') }}</p>
                </td>
              </tr>
              <tr v-for="b in store.borrows" :key="b.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-5 py-4 font-bold text-slate-900 dark:text-white leading-snug">{{ b.book_copy?.book?.title }}</td>
                <td class="px-4 py-4 text-slate-600 dark:text-slate-400">{{ b.book_copy?.book?.category?.name || '—' }}</td>
                <td class="px-4 py-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{{ b.book_copy?.barcode || '—' }}</td>
                <td class="px-4 py-4 text-slate-800 dark:text-slate-200 font-bold">{{ b.member?.user?.name }}</td>
                <td class="px-4 py-4 text-slate-600 dark:text-slate-400">{{ b.librarian?.user?.name || '—' }}</td>
                <td class="px-4 py-4 text-slate-600 dark:text-slate-400 font-medium">{{ formatDate(b.borrow_date) }}</td>
                <td class="px-4 py-4 font-medium" :class="isOverdue(b.due_date) ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400'">{{ formatDate(b.due_date) }}</td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs"
                    :class="isOverdue(b.due_date) ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="isOverdue(b.due_date) ? 'bg-rose-500' : 'bg-emerald-500'"></span>
                    {{ isOverdue(b.due_date) ? $t('circulation.overdue') : $t('circulation.active') }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <button
                    @click="returningBorrow = b"
                    class="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 rounded-xl px-3.5 py-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                  >
                    {{ $t('circulation.returnBook') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex flex-wrap justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
        <button
          v-for="p in store.pagination.last_page" :key="p"
          @click="store.fetchList(p)"
          class="w-9 h-9 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          :class="p === store.pagination.current_page
            ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30'"
        >
          {{ p }}
        </button>
      </div>

    </div>

    <!-- Return Modal Form -->
    <ReturnForm
      v-if="returningBorrow"
      :borrow="returningBorrow"
      :loading="store.loading"
      :error-message="returnError"
      @submit="handleReturnSubmit"
      @cancel="returningBorrow = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowUturnLeftIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useCirculationStore } from '../store/circulationStore'
import ReturnForm from '../components/ReturnForm.vue'

const store = useCirculationStore()
const returningBorrow = ref(null)
const returnError = ref('')
store.filters.status = 'borrowed'

const lbl = 'text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5'

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => store.fetchList(), 400)
}

async function handleReturnSubmit(payload) {
  returnError.value = ''
  const result = await store.returnBook(returningBorrow.value.id, payload.condition, payload)
  if (result.success) {
    alert(result.message)
    returningBorrow.value = null
    store.fetchList(store.pagination.current_page)
  } else {
    returnError.value = result.message
  }
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString('en-US') : '—'
}
function isOverdue(dueDate) {
  return new Date(dueDate) < new Date()
}

onMounted(() => store.fetchList())
</script>
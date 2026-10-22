<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!--  MAIN CONTAINER WRAPPER = -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">

      <!-- Header banner -->
      <div class="flex items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 sm:gap-5 min-w-0">
          <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ArrowsRightLeftIcon class="w-6 h-6 sm:w-7 sm:h-7 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('circulation.bookCheckout') }}</h1>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{{ $t('circulation.checkoutSubtitle') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/20 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('sidebar.menu.borrow') }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Create New Checkout Form -->
        <div class="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-6 space-y-5 sm:space-y-6">
          <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight pb-4 border-b border-slate-200 dark:border-white/10">{{ $t('circulation.createNewCheckout') }}</h2>
          <BorrowForm :loading="store.loading" :errors="store.errors" @submit="handleBorrow" />
        </div>

        <!-- Currently Borrowed Section -->
        <div class="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
            <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ $t('circulation.currentlyBorrowed') }} ({{ store.pagination.total }})</h2>
          </div>

          <!-- Toolbar / Filters -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 p-3 sm:p-4 shadow-2xs">
            <div class="flex gap-2 sm:gap-3">
              <div class="relative flex-1 min-w-0">
                <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="store.filters.search"
                  @input="debouncedFetch"
                  :placeholder="$t('circulation.searchMemberBook')"
                  class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl pl-9 pr-3 py-2.5 sm:py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-600 transition-shadow shadow-2xs"
                />
              </div>
              <select
                v-model="store.filters.status"
                @change="store.fetchList()"
                class="max-w-[40%] sm:max-w-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 sm:py-2 text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none focus:border-emerald-600 shadow-2xs cursor-pointer dark:[color-scheme:dark]"
              >
                <option value="" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.allStatus') }}</option>
                <option value="borrowed" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.statusBorrowed') }}</option>
                <option value="returned" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.statusReturned') }}</option>
              </select>
            </div>
          </div>

          <!-- Borrowed Items List (inner scroll only on desktop; on phones the page itself scrolls) -->
          <div class="space-y-3 lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1">
            <div v-if="store.borrows.length === 0" class="text-center py-12">
              <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <ArrowsRightLeftIcon class="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('circulation.noActiveCheckouts') }}</p>
            </div>

            <div v-for="b in store.borrows" :key="b.id" class="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 rounded-xl p-3.5 sm:p-4 text-sm hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-2xs">
              <div class="flex justify-between items-start gap-3">
                <div class="min-w-0">
                  <p class="font-extrabold text-slate-900 dark:text-white leading-snug break-words">{{ b.book_copy?.book?.title }}</p>
                  <p class="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">
                    {{ $t('circulation.category') }}: <span class="text-slate-700 dark:text-slate-300">{{ b.book_copy?.book?.category?.name || '—' }}</span> ·
                    {{ $t('circulation.barcode') }}: <span class="font-mono text-slate-700 dark:text-slate-300">{{ b.book_copy?.barcode || '—' }}</span>
                  </p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex-shrink-0"
                  :class="isOverdue(b.due_date) && b.status === 'borrowed' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="isOverdue(b.due_date) && b.status === 'borrowed' ? 'bg-rose-500' : 'bg-emerald-500'"></span>
                  {{ b.status === 'returned' ? $t('circulation.returnedStatus') : (isOverdue(b.due_date) ? $t('circulation.overdue') : $t('circulation.active')) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <p class="min-w-0 break-words">{{ $t('circulation.member') }}: <span class="text-slate-800 dark:text-slate-200 font-bold">{{ b.member?.user?.name }}</span></p>
                <p class="min-w-0 break-words">{{ $t('circulation.librarian') }}: <span class="text-slate-800 dark:text-slate-200 font-bold">{{ b.librarian?.user?.name || '—' }}</span></p>
                <p>{{ $t('circulation.borrowed') }}: <span class="text-slate-800 dark:text-slate-200 font-bold">{{ formatDate(b.borrow_date) }}</span></p>
                <p>{{ $t('circulation.dueDate') }}: <span class="text-slate-800 dark:text-slate-200 font-bold">{{ formatDate(b.due_date) }}</span></p>
                <p class="col-span-2">{{ $t('circulation.renewals') }}: <span class="text-slate-800 dark:text-slate-200 font-bold">{{ b.renewed_count }} / 2</span></p>
              </div>

              <div v-if="b.status === 'borrowed'" class="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  v-if="b.renewed_count < 2 && !isOverdue(b.due_date)"
                  @click="handleRenew(b)"
                  class="flex-1 sm:flex-none text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-3.5 py-2.5 sm:py-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs cursor-pointer"
                >
                  {{ $t('circulation.renew') }}
                </button>
                <button
                  @click="returningBorrow = b"
                  class="flex-1 sm:flex-none text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 rounded-xl px-3.5 py-2.5 sm:py-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-2xs cursor-pointer"
                >
                  {{ $t('circulation.return') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex flex-wrap justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
            <button
              v-for="p in store.pagination.last_page" :key="p"
              @click="store.fetchList(p)"
              class="w-9 h-9 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              :class="p === store.pagination.current_page
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
            >
              {{ p }}
            </button>
          </div>
        </div>
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
import debounce from 'lodash/debounce'
import { ArrowsRightLeftIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useCirculationStore } from '../store/circulationStore'
import BorrowForm from '../components/BorrowForm.vue'
import ReturnForm from '../components/ReturnForm.vue'

const store = useCirculationStore()
store.filters.status = 'borrowed'

const returningBorrow = ref(null)
const returnError = ref('')

const debouncedFetch = debounce(() => store.fetchList(), 400)

async function handleBorrow(payload) {
  const result = await store.borrow(payload)
  alert(result.message)
  if (result.success) store.fetchList()
}

async function handleRenew(b) {
  const result = await store.renew(b.id, false)
  alert(result.message)
  if (result.success) store.fetchList()
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
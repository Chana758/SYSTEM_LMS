<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

      <!-- Header Banner -->
      <div class="flex items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 sm:gap-5 min-w-0">
          <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ClockIcon class="w-6 h-6 sm:w-7 sm:h-7 text-purple-700 dark:text-purple-300" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('circulation.borrowHistory.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{{ store.pagination.total }} {{ $t('circulation.borrowHistory.recordsTotal') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-500/20 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('circulation.borrowHistory.title') }}
        </span>
      </div>

      <!-- Filter Bar -->
      <div class="bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-white/10 p-3 sm:p-4">
        <div class="flex flex-wrap gap-3 items-center">
          <div class="relative w-full sm:flex-1 sm:min-w-[240px]">
            <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="store.filters.search"
              @input="debouncedFetch"
              type="text"
              :placeholder="$t('circulation.borrowHistory.searchPlaceholder')"
              class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl pl-9 pr-3 py-2.5 sm:py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-purple-600 transition-shadow shadow-2xs"
            />
          </div>

          <select
            v-model="store.filters.status"
            @change="store.fetchList(1)"
            class="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 sm:py-2 text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer dark:[color-scheme:dark]"
          >
            <option value="" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.allStatus') }}</option>
            <option value="borrowed" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.statusBorrowed') }}</option>
            <option value="returned" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.statusReturned') }}</option>
          </select>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input
              v-model="store.filters.from"
              @change="store.fetchList(1)"
              type="date"
              class="flex-1 min-w-0 sm:flex-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 sm:py-2 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-purple-600 shadow-2xs dark:[color-scheme:dark]"
            />
            <span class="text-slate-400 dark:text-slate-500 text-xs font-bold">{{ $t('circulation.borrowHistory.to') }}</span>
            <input
              v-model="store.filters.to"
              @change="store.fetchList(1)"
              type="date"
              class="flex-1 min-w-0 sm:flex-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 sm:py-2 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-purple-600 shadow-2xs dark:[color-scheme:dark]"
            />
          </div>

          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-2 transition-colors sm:ml-auto cursor-pointer"
          >
            {{ $t('circulation.borrowHistory.clearFilters') }}
          </button>
        </div>
      </div>

      <!-- Loading / Table Container -->
      <div v-if="store.loading" class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 p-10 sm:p-14 text-center text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider shadow-2xs">
        <div class="w-7 h-7 border-3 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        {{ $t('circulation.borrowHistory.loadingRecords') }}
      </div>

      <div v-else class="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-2xs">
        <BorrowTable
          :items="store.borrows"
          role="admin"
          @renew="handleRenew"
          @return="returningBorrow = $event"
        />
      </div>

      <!-- Pagination -->
      <div class="flex flex-wrap justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
        <button
          v-for="p in store.pagination.last_page" :key="p"
          @click="store.fetchList(p)"
          class="w-9 h-9 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          :class="p === store.pagination.current_page
            ? 'bg-purple-600 dark:bg-purple-500 text-white'
            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/30'"
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
import { ref, computed, onMounted } from 'vue'
import debounce from 'lodash/debounce'
import { MagnifyingGlassIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { useCirculationStore } from '../store/circulationStore'
import BorrowTable from '../components/BorrowTable.vue'
import ReturnForm from '../components/ReturnForm.vue'

const store = useCirculationStore()
const returningBorrow = ref(null)
const returnError = ref('')

const debouncedFetch = debounce(() => store.fetchList(1), 400)

const hasActiveFilters = computed(() =>
  store.filters.search || store.filters.status || store.filters.from || store.filters.to
)

function clearFilters() {
  store.filters.search = ''
  store.filters.status = ''
  store.filters.from = ''
  store.filters.to = ''
  store.fetchList(1)
}

async function handleRenew(item) {
  const result = await store.renew(item.id, false)
  alert(result.message)
  if (result.success) store.fetchList(store.pagination.current_page)
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

onMounted(() => {
  store.filters.status = ''
  store.filters.search = ''
  store.filters.from = ''
  store.filters.to = ''
  store.fetchList()
})
</script>
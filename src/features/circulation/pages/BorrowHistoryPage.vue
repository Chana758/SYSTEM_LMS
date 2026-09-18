<template>
  <div class="space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-6">
      
      <!-- Header Banner -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ClockIcon class="w-7 h-7 text-purple-700" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('circulation.borrowHistory.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 mt-1">{{ store.pagination.total }} {{ $t('circulation.borrowHistory.recordsTotal') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('circulation.borrowHistory.title') }}
        </span>
      </div>

      <!-- Filter Bar -->
      <div class="bg-slate-50/70 rounded-xl border border-slate-200 p-4">
        <div class="flex flex-wrap gap-3 items-center">
          <div class="relative flex-1 min-w-[240px]">
            <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="store.filters.search"
              @input="debouncedFetch"
              type="text"
              :placeholder="$t('circulation.borrowHistory.searchPlaceholder')"
              class="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-shadow shadow-2xs"
            />
          </div>

          <select
            v-model="store.filters.status"
            @change="store.fetchList(1)"
            class="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 shadow-2xs"
          >
            <option value="">{{ $t('circulation.allStatus') }}</option>
            <option value="borrowed">{{ $t('circulation.statusBorrowed') }}</option>
            <option value="returned">{{ $t('circulation.statusReturned') }}</option>
          </select>

          <div class="flex items-center gap-2">
            <input
              v-model="store.filters.from"
              @change="store.fetchList(1)"
              type="date"
              class="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 shadow-2xs"
            />
            <span class="text-slate-400 text-xs font-bold">{{ $t('circulation.borrowHistory.to') }}</span>
            <input
              v-model="store.filters.to"
              @change="store.fetchList(1)"
              type="date"
              class="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 shadow-2xs"
            />
          </div>

          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-2 transition-colors ml-auto"
          >
            {{ $t('circulation.borrowHistory.clearFilters') }}
          </button>
        </div>
      </div>

      <!-- Loading / Table Container -->
      <div v-if="store.loading" class="bg-white rounded-2xl border border-slate-200 p-14 text-center text-slate-400 text-sm font-semibold shadow-2xs">
        {{ $t('circulation.borrowHistory.loadingRecords') }}
      </div>

      <div v-else class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <BorrowTable
          :items="store.borrows"
          role="admin"
          @renew="handleRenew"
          @return="returningBorrow = $event"
        />
      </div>

      <!-- Pagination -->
      <div class="flex justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
        <button
          v-for="p in store.pagination.last_page" :key="p"
          @click="store.fetchList(p)"
          class="w-8 h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          :class="p === store.pagination.current_page ? 'bg-purple-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-purple-50'"
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
import { debounce } from 'lodash'
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
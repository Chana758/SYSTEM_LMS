<template>
  <div>
    <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 mb-6">
      <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
        <ClockIcon class="w-6 h-6 text-purple-600" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-800">Borrow History</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ store.pagination.total }} record(s) total</p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
      <div class="flex flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="store.filters.search"
            @input="debouncedFetch"
            type="text"
            placeholder="Search member or book title..."
            class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <select
          v-model="store.filters.status"
          @change="store.fetchList(1)"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="">All Status</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
        </select>

        <div class="flex items-center gap-2">
          <input
            v-model="store.filters.from"
            @change="store.fetchList(1)"
            type="date"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <span class="text-gray-400 text-sm">to</span>
          <input
            v-model="store.filters.to"
            @change="store.fetchList(1)"
            type="date"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="text-xs font-medium text-gray-500 hover:text-red-500 px-3 py-2 transition-colors"
        >
          Clear filters
        </button>
      </div>
    </div>

    <div v-if="store.loading" class="bg-white rounded-2xl border border-gray-200 p-14 text-center text-gray-400 text-sm">
      Loading records...
    </div>

    <BorrowTable
      v-else
      :items="store.borrows"
      role="admin"
      @renew="handleRenew"
      @return="returningBorrow = $event"
    />

    <div class="flex justify-center gap-2 mt-6" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page" :key="p"
        @click="store.fetchList(p)"
        class="w-8 h-8 rounded-lg text-sm transition-colors"
        :class="p === store.pagination.current_page ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-purple-50'"
      >
        {{ p }}
      </button>
    </div>

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
<template>
  <div class="space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-6">
      
      <!-- Header Banner -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ArrowUturnLeftIcon class="w-7 h-7 text-blue-700" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('circulation.returnPage.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 mt-1">{{ $t('circulation.returnPage.subtitle') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('circulation.returnPage.title') }}
        </span>
      </div>

      <!-- Search Toolbar -->
      <div class="bg-slate-50/70 rounded-xl border border-slate-200 p-4">
        <div class="relative">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="store.filters.search"
            @input="debouncedSearch"
            type="text"
            :placeholder="$t('circulation.returnPage.searchPlaceholder')"
            class="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-shadow shadow-2xs"
          />
        </div>
      </div>

      <!-- Data Table -->
      <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="text-left px-5 py-3.5">{{ $t('circulation.returnPage.book') }}</th>
                <th class="text-left px-4 py-3.5">{{ $t('circulation.category') }}</th>
                <th class="text-left px-4 py-3.5">{{ $t('circulation.barcode') }}</th>
                <th class="text-left px-4 py-3.5">{{ $t('circulation.member') }}</th>
                <th class="text-left px-4 py-3.5">{{ $t('circulation.librarian') }}</th>
                <th class="text-left px-4 py-3.5">{{ $t('circulation.returnPage.borrowDate') }}</th>
                <th class="text-left px-4 py-3.5">{{ $t('circulation.dueDate') }}</th>
                <th class="text-left px-4 py-3.5">{{ $t('common.table.status') }}</th>
                <th class="text-right px-5 py-3.5">{{ $t('common.table.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-medium">
              <tr v-if="store.loading">
                <td colspan="9" class="text-center py-12 text-slate-400 font-semibold">{{ $t('circulation.returnPage.loadingCheckouts') }}</td>
              </tr>
              <tr v-else-if="!store.borrows.length">
                <td colspan="9" class="py-16 text-center">
                  <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <ArrowUturnLeftIcon class="w-6 h-6 text-slate-400" />
                  </div>
                  <p class="text-xs font-bold text-slate-500">{{ $t('circulation.noActiveCheckouts') }}</p>
                </td>
              </tr>
              <tr v-for="b in store.borrows" :key="b.id" class="hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-4 font-extrabold text-slate-900">{{ b.book_copy?.book?.title }}</td>
                <td class="px-4 py-4 text-slate-600">{{ b.book_copy?.book?.category?.name || '—' }}</td>
                <td class="px-4 py-4 text-slate-600 font-mono text-[11px]">{{ b.book_copy?.barcode || '—' }}</td>
                <td class="px-4 py-4 text-slate-800 font-bold">{{ b.member?.user?.name }}</td>
                <td class="px-4 py-4 text-slate-600">{{ b.librarian?.user?.name || '—' }}</td>
                <td class="px-4 py-4 text-slate-600">{{ formatDate(b.borrow_date) }}</td>
                <td class="px-4 py-4 text-slate-600">{{ formatDate(b.due_date) }}</td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
                    :class="isOverdue(b.due_date) ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="isOverdue(b.due_date) ? 'bg-rose-500' : 'bg-emerald-500'"></span>
                    {{ isOverdue(b.due_date) ? $t('circulation.overdue') : $t('circulation.active') }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <button
                    @click="returningBorrow = b"
                    class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-1.5 hover:bg-blue-100 transition-colors shadow-2xs"
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
      <div class="flex justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
        <button
          v-for="p in store.pagination.last_page" :key="p"
          @click="store.fetchList(p)"
          class="w-8 h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          :class="p === store.pagination.current_page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-blue-50'"
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
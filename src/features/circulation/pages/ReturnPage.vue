<template>
  <div>
    <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 mb-6">
      <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
        <ArrowUturnLeftIcon class="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-800">Return Book</h1>
        <p class="text-sm text-gray-400 mt-0.5">Search for an active checkout to process a return.</p>
      </div>
    </div>

    <div class="relative mb-4">
      <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        v-model="store.filters.search"
        @input="debouncedSearch"
        type="text"
        placeholder="Search by member name or book title..."
        class="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
      />
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th class="text-left px-4 py-3">Book</th>
            <th class="text-left px-4 py-3">Category</th>
            <th class="text-left px-4 py-3">Barcode</th>
            <th class="text-left px-4 py-3">Member</th>
            <th class="text-left px-4 py-3">Librarian</th>
            <th class="text-left px-4 py-3">Borrow Date</th>
            <th class="text-left px-4 py-3">Due Date</th>
            <th class="text-left px-4 py-3">Status</th>
            <th class="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.loading"><td colspan="9" class="text-center py-10 text-gray-400">Loading...</td></tr>
          <tr v-else-if="!store.borrows.length">
            <td colspan="9" class="py-14 text-center">
              <div class="flex flex-col items-center gap-2 text-gray-400">
                <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-1">
                  <ArrowUturnLeftIcon class="w-6 h-6 text-gray-300" />
                </div>
                <p class="text-sm font-medium text-gray-500">No active checkouts found</p>
              </div>
            </td>
          </tr>
          <tr v-for="b in store.borrows" :key="b.id" class="border-t border-gray-100 hover:bg-gray-50/70 transition">
            <td class="px-4 py-3.5 font-medium text-gray-700">{{ b.book_copy?.book?.title }}</td>
            <td class="px-4 py-3.5 text-gray-500">{{ b.book_copy?.book?.category?.name || '—' }}</td>
            <td class="px-4 py-3.5 text-gray-500 font-mono text-xs">{{ b.book_copy?.barcode || '—' }}</td>
            <td class="px-4 py-3.5">{{ b.member?.user?.name }}</td>
            <td class="px-4 py-3.5 text-gray-500">{{ b.librarian?.user?.name || '—' }}</td>
            <td class="px-4 py-3.5">{{ formatDate(b.borrow_date) }}</td>
            <td class="px-4 py-3.5">{{ formatDate(b.due_date) }}</td>
            <td class="px-4 py-3.5">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="isOverdue(b.due_date) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'">
                {{ isOverdue(b.due_date) ? 'Overdue' : 'Active' }}
              </span>
            </td>
            <td class="px-4 py-3.5 text-right">
              <button @click="returningBorrow = b" class="text-blue-600 hover:text-blue-700 font-medium hover:underline">Return Book</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-center gap-2 mt-6" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page" :key="p"
        @click="store.fetchList(p)"
        class="w-8 h-8 rounded-lg text-sm transition-colors"
        :class="p === store.pagination.current_page ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-blue-50'"
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
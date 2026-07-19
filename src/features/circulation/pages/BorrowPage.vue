<template>
  <div>
    <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 mb-6">
      <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
        <ArrowsRightLeftIcon class="w-6 h-6 text-green-700" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-800">Book Checkout</h1>
        <p class="text-sm text-gray-400 mt-0.5">Create a new checkout and manage currently borrowed books.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="font-bold text-gray-800 mb-4">Create New Checkout</h2>
        <BorrowForm :loading="store.loading" :errors="store.errors" @submit="handleBorrow" />
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-800">Currently Borrowed ({{ store.pagination.total }})</h2>
        </div>

        <div class="flex gap-2 mb-3">
          <input
            v-model="store.filters.search"
            @input="debouncedFetch"
            placeholder="Search member or book title..."
            class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
          />
          <select
            v-model="store.filters.status"
            @change="store.fetchList()"
            class="text-sm border border-gray-200 rounded-lg px-2"
          >
            <option value="">All Status</option>
            <option value="borrowed">Borrowed</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        <div class="space-y-3 max-h-[32rem] overflow-y-auto">
          <div v-if="store.borrows.length === 0" class="text-center py-10">
            <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <ArrowsRightLeftIcon class="w-6 h-6 text-gray-300" />
            </div>
            <p class="text-sm font-medium text-gray-500">No active checkouts found</p>
          </div>

          <div v-for="b in store.borrows" :key="b.id" class="border border-gray-100 rounded-xl p-3 text-sm hover:border-gray-200 transition">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-800">{{ b.book_copy?.book?.title }}</p>
                <p class="text-gray-400 text-xs">
                  Category: {{ b.book_copy?.book?.category?.name || '—' }} ·
                  Barcode: {{ b.book_copy?.barcode || '—' }}
                </p>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                :class="isOverdue(b.due_date) && b.status === 'borrowed' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'">
                {{ b.status === 'returned' ? 'Returned' : (isOverdue(b.due_date) ? 'Overdue' : 'Active') }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
              <p>Member: <span class="text-gray-700">{{ b.member?.user?.name }}</span></p>
              <p>Librarian: <span class="text-gray-700">{{ b.librarian?.user?.name || '—' }}</span></p>
              <p>Borrowed: <span class="text-gray-700">{{ formatDate(b.borrow_date) }}</span></p>
              <p>Due Date: <span class="text-gray-700">{{ formatDate(b.due_date) }}</span></p>
              <p>Renewals: <span class="text-gray-700">{{ b.renewed_count }} / 2</span></p>
            </div>

            <div v-if="b.status === 'borrowed'" class="flex gap-2 mt-3">
              <button
                v-if="b.renewed_count < 2 && !isOverdue(b.due_date)"
                @click="handleRenew(b)"
                class="text-xs font-medium text-green-700 border border-green-200 rounded-lg px-3 py-1 hover:bg-green-50 transition"
              >
                Renew
              </button>
              <button
                @click="returningBorrow = b"
                class="text-xs font-medium text-blue-700 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50 transition"
              >
                Return
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-2 mt-4" v-if="store.pagination.last_page > 1">
          <button
            v-for="p in store.pagination.last_page" :key="p"
            @click="store.fetchList(p)"
            class="w-7 h-7 rounded-lg text-xs transition-colors"
            :class="p === store.pagination.current_page ? 'bg-green-700 text-white' : 'bg-white border text-gray-600 hover:bg-green-50'"
          >
            {{ p }}
          </button>
        </div>
      </div>
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
import { debounce } from 'lodash'
import { ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'
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
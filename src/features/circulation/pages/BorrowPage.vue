<template>
  <div class="space-y-6 pb-12">
    <!-- ============ MAIN CONTAINER WRAPPER ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-8">
      
      <!-- Header banner styled cleanly inside the wrapper -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ArrowsRightLeftIcon class="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Book Checkout</h1>
            <p class="text-xs font-bold text-slate-500 mt-1">Create a new checkout and manage currently borrowed books.</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          Circulation
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Create New Checkout Form -->
        <div class="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 space-y-6">
          <h2 class="text-lg font-black text-slate-900 tracking-tight pb-4 border-b border-slate-200">Create New Checkout</h2>
          <BorrowForm :loading="store.loading" :errors="store.errors" @submit="handleBorrow" />
        </div>

        <!-- Currently Borrowed Section -->
        <div class="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-200">
            <h2 class="text-lg font-black text-slate-900 tracking-tight">Currently Borrowed ({{ store.pagination.total }})</h2>
          </div>

          <!-- Toolbar / Filters -->
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div class="flex gap-3">
              <div class="relative flex-1">
                <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="store.filters.search"
                  @input="debouncedFetch"
                  placeholder="Search member or book title..."
                  class="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-shadow shadow-2xs"
                />
              </div>
              <select
                v-model="store.filters.status"
                @change="store.fetchList()"
                class="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 shadow-2xs"
              >
                <option value="">All Status</option>
                <option value="borrowed">Borrowed</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>

          <!-- Borrowed Items List -->
          <div class="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
            <div v-if="store.borrows.length === 0" class="text-center py-12">
              <div class="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <ArrowsRightLeftIcon class="w-6 h-6 text-slate-400" />
              </div>
              <p class="text-xs font-bold text-slate-500">No active checkouts found</p>
            </div>

            <div v-for="b in store.borrows" :key="b.id" class="border border-slate-200 bg-white rounded-xl p-4 text-sm hover:border-slate-300 transition-colors shadow-2xs">
              <div class="flex justify-between items-start gap-3">
                <div>
                  <p class="font-extrabold text-slate-900 leading-snug">{{ b.book_copy?.book?.title }}</p>
                  <p class="text-slate-500 text-xs font-medium mt-0.5">
                    Category: <span class="text-slate-700">{{ b.book_copy?.book?.category?.name || '—' }}</span> ·
                    Barcode: <span class="font-mono text-slate-700">{{ b.book_copy?.barcode || '—' }}</span>
                  </p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex-shrink-0"
                  :class="isOverdue(b.due_date) && b.status === 'borrowed' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="isOverdue(b.due_date) && b.status === 'borrowed' ? 'bg-rose-500' : 'bg-emerald-500'"></span>
                  {{ b.status === 'returned' ? 'Returned' : (isOverdue(b.due_date) ? 'Overdue' : 'Active') }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <p>Member: <span class="text-slate-800 font-bold">{{ b.member?.user?.name }}</span></p>
                <p>Librarian: <span class="text-slate-800 font-bold">{{ b.librarian?.user?.name || '—' }}</span></p>
                <p>Borrowed: <span class="text-slate-800 font-bold">{{ formatDate(b.borrow_date) }}</span></p>
                <p>Due Date: <span class="text-slate-800 font-bold">{{ formatDate(b.due_date) }}</span></p>
                <p class="col-span-2">Renewals: <span class="text-slate-800 font-bold">{{ b.renewed_count }} / 2</span></p>
              </div>

              <div v-if="b.status === 'borrowed'" class="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  v-if="b.renewed_count < 2 && !isOverdue(b.due_date)"
                  @click="handleRenew(b)"
                  class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-1.5 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  Renew
                </button>
                <button
                  @click="returningBorrow = b"
                  class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-1.5 hover:bg-blue-100 transition-colors shadow-2xs"
                >
                  Return
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
            <button
              v-for="p in store.pagination.last_page" :key="p"
              @click="store.fetchList(p)"
              class="w-8 h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs"
              :class="p === store.pagination.current_page ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'"
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
import { debounce } from 'lodash'
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
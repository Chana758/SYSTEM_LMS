<template>
  <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 w-full max-w-md shadow-xl space-y-5">
      
      <!-- Header -->
      <div class="space-y-1">
        <h2 class="text-xl font-black text-slate-900 tracking-tight">Reserve a Book</h2>
        <p class="text-xs font-bold text-slate-500">Search for a book that is currently out of stock.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="relative space-y-1.5">
          <label class="block text-xs font-black text-slate-700 uppercase tracking-wider">Book (Title or ISBN)</label>
          
          <input
            v-model="bookQuery"
            type="text"
            placeholder="Search book..."
            class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors shadow-2xs"
            @input="debouncedSearch"
            @focus="showResults = true"
          />

          <!-- Availability Hint -->
          <p v-if="selectedBook" class="text-xs font-extrabold mt-1.5 p-2.5 rounded-xl border-2" :class="selectedBook.available_qty > 0 ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-emerald-800 bg-emerald-50 border-emerald-200'">
            ✓ {{ selectedBook.title }}
            <span v-if="selectedBook.available_qty > 0" class="block font-bold text-[11px] mt-0.5">— សៀវភៅនេះមានទំនេរ សូមខ្ចីដោយផ្ទាល់ជំនួសការកក់</span>
          </p>

          <!-- Search Results Dropdown -->
          <div v-if="showResults && bookResults.length" class="absolute z-10 mt-1 w-full bg-white border-2 border-slate-300 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
            <button
              v-for="b in bookResults" :key="b.id" type="button"
              @click="selectBook(b)"
              class="flex items-center justify-between w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-emerald-50/70 transition-colors"
            >
              <span class="text-slate-900 truncate pr-2">{{ b.title }} <span class="text-slate-400 font-semibold">— {{ b.author }}</span></span>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-lg border flex-shrink-0" :class="b.available_qty > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'">
                {{ b.available_qty }}/{{ b.total_qty }}
              </span>
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <p v-if="errorMessage" class="text-xs font-extrabold text-rose-600 bg-rose-50 border-2 border-rose-200 rounded-xl p-3 shadow-2xs">{{ errorMessage }}</p>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button 
            type="button" 
            @click="$emit('cancel')" 
            class="flex-1 border-2 border-slate-300 bg-white text-slate-700 py-2.5 rounded-xl text-xs font-extrabold hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!selectedBook || loading"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-sm"
          >
            {{ loading ? 'Reserving...' : 'Confirm Reservation' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '@/api/axios'
import { useReservationStore } from '../store/reservationStore'

const emit = defineEmits(['created', 'cancel'])

const store = useReservationStore()
const loading = ref(false)
const errorMessage = ref('')

const bookQuery = ref('')
const bookResults = ref([])
const selectedBook = ref(null)
const showResults = ref(false)

let searchTimeout = null
function debouncedSearch() {
  selectedBook.value = null
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchBooks, 350)
}
async function searchBooks() {
  if (!bookQuery.value.trim()) { bookResults.value = []; return }
  const { data } = await apiClient.get('/books', { params: { search: bookQuery.value, per_page: 5 } })
  bookResults.value = data.data ?? data
  showResults.value = true
}
function selectBook(b) {
  selectedBook.value = b
  bookQuery.value = b.title
  showResults.value = false
}

async function handleSubmit() {
  if (!selectedBook.value) return
  errorMessage.value = ''
  loading.value = true

  // member_id is resolved server-side from the authenticated user —
  // we only need to send book_id here.
  const result = await store.createReservation({ book_id: selectedBook.value.id })

  loading.value = false
  if (result.success) {
    emit('created')
  } else {
    errorMessage.value = result.message
  }
}
</script>
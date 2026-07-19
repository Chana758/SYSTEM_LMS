<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md">
      <h2 class="text-lg font-bold text-gray-800 mb-1">Reserve a Book</h2>
      <p class="text-sm text-gray-500 mb-4">Search for a book that is currently out of stock.</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Book (Title or ISBN)</label>
          <input
            v-model="bookQuery"
            type="text"
            placeholder="Search book..."
            class="w-full border rounded-lg px-3 py-2"
            @input="debouncedSearch"
            @focus="showResults = true"
          />
          <p v-if="selectedBook" class="text-xs mt-1" :class="selectedBook.available_qty > 0 ? 'text-amber-600' : 'text-green-600'">
            ✓ {{ selectedBook.title }}
            <span v-if="selectedBook.available_qty > 0"> — សៀវភៅនេះមានទំនេរ សូមខ្ចីដោយផ្ទាល់ជំនួសការកក់</span>
          </p>
          <div v-if="showResults && bookResults.length" class="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            <button
              v-for="b in bookResults" :key="b.id" type="button"
              @click="selectBook(b)"
              class="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-green-50"
            >
              <span>{{ b.title }} <span class="text-gray-400">— {{ b.author }}</span></span>
              <span class="text-xs font-semibold" :class="b.available_qty > 0 ? 'text-green-600' : 'text-red-500'">
                {{ b.available_qty }}/{{ b.total_qty }}
              </span>
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

        <div class="flex gap-2 pt-2">
          <button type="button" @click="$emit('cancel')" class="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!selectedBook || loading"
            class="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
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
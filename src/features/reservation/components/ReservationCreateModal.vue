<template>
  <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 w-full max-w-md shadow-xl space-y-5">
      
      <!-- Header -->
      <div class="space-y-1">
        <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ $t('reservation.createModal.title') }}</h2>
        <p class="text-xs font-bold text-slate-500">{{ $t('reservation.createModal.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="relative space-y-1.5">
          <label class="block text-xs font-black text-slate-700 uppercase tracking-wider">{{ $t('reservation.createModal.bookLabel') }}</label>
          
          <input
            v-model="bookQuery"
            type="text"
            :placeholder="$t('reservation.createModal.bookPlaceholder')"
            class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors shadow-2xs"
            @input="debouncedSearch"
            @focus="showResults = true"
          />

          <!-- Single Dynamic Status Hint -->
          <div v-if="selectedBook" class="mt-1.5">
            <p 
              class="text-xs font-extrabold p-2.5 rounded-xl border-2 transition-all" 
              :class="isDirectBorrowable ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-emerald-800 bg-emerald-50 border-emerald-200'"
            >
              ✓ {{ selectedBook.title }}
              <span class="block font-bold text-[11px] mt-0.5">
                <template v-if="isDirectBorrowable">
                  {{ $t('reservation.createModal.availableHint') }}
                </template>
                <template v-else-if="queueCount > 0">
                  មានអ្នកកំពុងតម្រង់ជួរ {{ queueCount }} នាក់ (អ្នកនឹងទទួលបាន Priority #{{ queueCount + 1 }})
                </template>
                <template v-else>
                  សៀវភៅនេះអស់ពីស្តុកហើយ — អ្នកអាចធ្វើការកក់បាន
                </template>
              </span>
            </p>
          </div>

          <!-- Search Dropdown Results -->
          <div v-if="showResults && bookResults.length" class="absolute z-10 mt-1 w-full bg-white border-2 border-slate-300 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
            <button
              v-for="b in bookResults" 
              :key="b.id" 
              type="button"
              @click="selectBook(b)"
              class="flex items-center justify-between w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-emerald-50/70 transition-colors"
            >
              <span class="text-slate-900 truncate pr-2">
                {{ b.title }} <span class="text-slate-400 font-semibold">— {{ b.author }}</span>
              </span>
              <span 
                class="text-[10px] font-black px-2 py-0.5 rounded-lg border flex-shrink-0" 
                :class="(b.available_qty > 0 && !b.active_reservations_count) ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'"
              >
                {{ b.available_qty }}/{{ b.total_qty }}
                <template v-if="b.active_reservations_count > 0"> (Q: {{ b.active_reservations_count }})</template>
              </span>
            </button>
          </div>
        </div>

        <!-- Real Server API Error Message -->
        <p v-if="errorMessage" class="text-xs font-extrabold text-rose-600 bg-rose-50 border-2 border-rose-200 rounded-xl p-3 shadow-2xs">
          {{ errorMessage }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button 
            type="button" 
            @click="$emit('cancel')" 
            class="flex-1 border-2 border-slate-300 bg-white text-slate-700 py-2.5 rounded-xl text-xs font-extrabold hover:bg-slate-100 transition-colors shadow-2xs"
          >
            {{ $t('common.actions.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="!selectedBook || isDirectBorrowable || loading"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {{ loading ? $t('reservation.createModal.reserving') : $t('reservation.createModal.confirmReservation') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

// ទាញយកចំនួន Queue សរុបចេញពី active_reservations_count របស់ backend
const queueCount = computed(() => selectedBook.value?.active_reservations_count ?? 0)

// អាចខ្ចីផ្ទាល់បាន លុះត្រាតែមានស្តុក AND គ្មានអ្នករង់ចាំ Queue
const isDirectBorrowable = computed(() => {
  if (!selectedBook.value) return false
  return selectedBook.value.available_qty > 0 && queueCount.value === 0
})

function debouncedSearch() {
  selectedBook.value = null
  errorMessage.value = ''
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchBooks, 350)
}

async function searchBooks() {
  if (!bookQuery.value.trim()) { 
    bookResults.value = []
    showResults.value = false
    return 
  }
  try {
    const { data } = await apiClient.get('/books', { params: { search: bookQuery.value, per_page: 5 } })
    bookResults.value = data.data ?? data
    showResults.value = true
  } catch (err) {
    bookResults.value = []
  }
}

function selectBook(b) {
  selectedBook.value = b
  bookQuery.value = b.title
  showResults.value = false
  errorMessage.value = ''
}

async function handleSubmit() {
  if (!selectedBook.value || isDirectBorrowable.value) return

  errorMessage.value = ''
  loading.value = true

  const result = await store.createReservation({ book_id: selectedBook.value.id })

  loading.value = false
  if (result.success) {
    emit('created')
  } else {
    errorMessage.value = result.message
  }
}
</script>
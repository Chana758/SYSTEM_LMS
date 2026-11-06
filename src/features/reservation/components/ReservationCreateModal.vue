<template>
  <!-- mousedown.self (not click) so dragging a text selection out of an input doesn't close the modal -->
  <div
    class="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 sm:p-4"
    @mousedown.self="$emit('cancel')"
  >
    <!-- Bottom sheet on phones, centered card from sm up -->
    <div
      role="dialog"
      aria-modal="true"
      class="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl border-2 border-slate-300 dark:border-white/10 p-5 sm:p-8 w-full sm:max-w-md max-h-[92vh] overflow-y-auto shadow-xl dark:shadow-black/50 space-y-5"
    >

      <!-- Header -->
      <div class="space-y-1">
        <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('reservation.createModal.title') }}</h2>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('reservation.createModal.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div ref="pickerRoot" class="relative space-y-1.5">
          <label class="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ $t('reservation.createModal.bookLabel') }}</label>

          <input
            v-model="bookQuery"
            type="text"
            :placeholder="$t('reservation.createModal.bookPlaceholder')"
            class="w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-600 dark:focus:border-emerald-400 focus:outline-hidden transition-colors shadow-2xs"
            @input="debouncedSearch"
            @focus="showResults = true"
          />

          <!-- Single dynamic status hint -->
          <div v-if="selectedBook" class="mt-1.5">
            <p
              class="text-xs font-extrabold p-2.5 rounded-xl border-2 transition-all"
              :class="directBorrowable
                ? 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-400/25'
                : 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-400/25'"
            >
              ✓ {{ selectedBook.title }}
              <span class="block font-bold text-[11px] mt-0.5">
                <template v-if="directBorrowable">
                  {{ $t('reservation.createModal.availableHint') }}
                </template>
                <template v-else-if="queueCount > 0">
                  {{ $t('reservation.hint.queue', { count: queueCount, priority: queueCount + 1 }) }}
                </template>
                <template v-else>
                  {{ $t('reservation.hint.outOfStock') }}
                </template>
              </span>
            </p>
          </div>

          <!-- Search dropdown -->
          <div
            v-if="showResults && (bookResults.length || (searched && !searching))"
            class="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-white/15 rounded-xl shadow-lg dark:shadow-black/50 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-white/10"
          >
            <p v-if="!bookResults.length" class="px-3.5 py-3 text-xs font-bold text-slate-400 dark:text-slate-500">
              {{ $t('reservation.hint.noResults') }}
            </p>

            <button
              v-for="b in bookResults"
              :key="b.id"
              type="button"
              @click="selectBook(b)"
              class="flex items-center justify-between gap-2 w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-emerald-50/70 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span class="text-slate-900 dark:text-slate-100 truncate">
                {{ b.title }} <span class="text-slate-400 dark:text-slate-500 font-semibold">— {{ b.author }}</span>
              </span>
              <span
                class="text-[10px] font-black px-2 py-0.5 rounded-lg border flex-shrink-0"
                :class="canBorrowDirectly(b)
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-400/25'
                  : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/15 dark:border-amber-400/25'"
              >
                {{ b.available_qty }}/{{ b.total_qty }}
                <template v-if="queueCountOf(b) > 0"> ({{ $t('reservation.hint.queueShort', { count: queueCountOf(b) }) }})</template>
              </span>
            </button>
          </div>
        </div>

        <!-- Real server error message -->
        <p v-if="errorMessage" class="text-xs font-extrabold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-400/25 rounded-xl p-3 shadow-2xs">
          {{ errorMessage }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="flex-1 border-2 border-slate-300 dark:border-white/15 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shadow-2xs cursor-pointer"
          >
            {{ $t('reservation.createModal.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="!selectedBook || directBorrowable || loading"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          >
            {{ loading ? $t('reservation.createModal.reserving') : $t('reservation.createModal.confirmReservation') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import apiClient from '@/api/axios'
import { useReservationStore } from '../store/reservationStore'
import { canBorrowDirectly, queueCountOf } from '@/utils/reservationRules'

const emit = defineEmits(['created', 'cancel'])

const store = useReservationStore()
const loading = ref(false)
const errorMessage = ref('')

const bookQuery = ref('')
const bookResults = ref([])
const selectedBook = ref(null)
const showResults = ref(false)
const searching = ref(false)
const searched = ref(false)
const pickerRoot = ref(null)

let searchTimeout = null
let searchSeq = 0 // ignore responses that arrive out of order

const queueCount = computed(() => queueCountOf(selectedBook.value))
const directBorrowable = computed(() => canBorrowDirectly(selectedBook.value))

function debouncedSearch() {
  selectedBook.value = null
  errorMessage.value = ''
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchBooks, 350)
}

async function searchBooks() {
  const q = bookQuery.value.trim()
  const seq = ++searchSeq

  if (!q) {
    bookResults.value = []
    showResults.value = false
    searched.value = false
    return
  }

  searching.value = true
  try {
    const { data } = await apiClient.get('/books', { params: { search: q, per_page: 5 } })
    if (seq !== searchSeq) return
    bookResults.value = data.data ?? data
    searched.value = true
    showResults.value = true
  } catch {
    if (seq === searchSeq) bookResults.value = []
  } finally {
    if (seq === searchSeq) searching.value = false
  }
}

function selectBook(b) {
  searchSeq++ // cancel any in-flight search so it can't reopen the dropdown
  selectedBook.value = b
  bookQuery.value = b.title
  showResults.value = false
  errorMessage.value = ''
}

async function handleSubmit() {
  if (!selectedBook.value || directBorrowable.value) return

  errorMessage.value = ''
  loading.value = true
  const result = await store.createReservation({ book_id: selectedBook.value.id })
  loading.value = false

  if (result.success) emit('created')
  else errorMessage.value = result.message
}

// ---- close helpers: Esc key, click outside dropdown, lock page scroll ----
const onKeydown = (e) => { if (e.key === 'Escape') emit('cancel') }
const onDocMouseDown = (e) => {
  if (pickerRoot.value && !pickerRoot.value.contains(e.target)) showResults.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('mousedown', onDocMouseDown)
  document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousedown', onDocMouseDown)
  document.body.style.overflow = ''
  clearTimeout(searchTimeout)
})
</script>
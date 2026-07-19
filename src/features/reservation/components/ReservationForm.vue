<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="relative">
      <label class="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Member</label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">👤</span>
        <input
          v-model="memberQuery"
          type="text"
          placeholder="Search by name or membership no."
          class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
          @input="debouncedMemberSearch"
          @focus="showMemberResults = true"
        />
      </div>
      <p v-if="selectedMember" class="text-xs text-emerald-600 mt-1.5 inline-flex items-center gap-1">
        <span>✓</span> {{ selectedMember.user?.name }} <span class="text-gray-400">({{ selectedMember.membership_no }})</span>
      </p>
      <div v-if="showMemberResults && memberResults.length" class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
        <button
          v-for="m in memberResults" :key="m.id" type="button"
          @click="selectMember(m)"
          class="block w-full text-left px-3 py-2.5 text-sm hover:bg-green-50 transition-colors"
        >
          {{ m.user?.name }} <span class="text-gray-400">({{ m.membership_no }})</span>
        </button>
      </div>
      <p v-if="errors.member_id" class="text-red-500 text-xs mt-1">{{ errors.member_id[0] }}</p>
    </div>

    <div class="relative">
      <label class="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Book</label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">📖</span>
        <input
          v-model="bookQuery"
          type="text"
          placeholder="Search by title or ISBN"
          class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
          @input="debouncedBookSearch"
          @focus="showBookResults = true"
        />
      </div>
      <p v-if="selectedBook" class="text-xs mt-1.5" :class="selectedBook.available_qty > 0 ? 'text-amber-600' : 'text-emerald-600'">
        <span class="inline-flex items-center gap-1"><span>✓</span> {{ selectedBook.title }}</span>
        <span v-if="selectedBook.available_qty > 0" class="block text-gray-400 mt-0.5">This copy is available now — you can borrow it directly instead of reserving.</span>
      </p>
      <div v-if="showBookResults && bookResults.length" class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
        <button
          v-for="b in bookResults" :key="b.id" type="button"
          @click="selectBook(b)"
          class="flex items-center justify-between w-full text-left px-3 py-2.5 text-sm hover:bg-green-50 transition-colors"
        >
          <span>{{ b.title }} <span class="text-gray-400">— {{ b.author }}</span></span>
          <span class="text-xs font-semibold px-1.5 py-0.5 rounded" :class="b.available_qty > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'">
            {{ b.available_qty }}/{{ b.total_qty }}
          </span>
        </button>
      </div>
      <p v-if="errors.book_id" class="text-red-500 text-xs mt-1">{{ errors.book_id[0] }}</p>
    </div>

    <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

    <button
      type="submit"
      :disabled="!selectedMember || !selectedBook || loading"
      class="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-green-700/20"
    >
      {{ loading ? 'Reserving…' : 'Reserve Book' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '@/api/axios'

defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit'])

const memberQuery = ref('')
const memberResults = ref([])
const selectedMember = ref(null)
const showMemberResults = ref(false)

const bookQuery = ref('')
const bookResults = ref([])
const selectedBook = ref(null)
const showBookResults = ref(false)

let memberTimeout = null
function debouncedMemberSearch() {
  selectedMember.value = null
  clearTimeout(memberTimeout)
  memberTimeout = setTimeout(searchMembers, 350)
}
async function searchMembers() {
  if (!memberQuery.value.trim()) { memberResults.value = []; return }
  const { data } = await apiClient.get('/members', { params: { search: memberQuery.value, per_page: 5 } })
  memberResults.value = data.data ?? data
  showMemberResults.value = true
}
function selectMember(m) {
  selectedMember.value = m
  memberQuery.value = m.user?.name || ''
  showMemberResults.value = false
}

let bookTimeout = null
function debouncedBookSearch() {
  selectedBook.value = null
  clearTimeout(bookTimeout)
  bookTimeout = setTimeout(searchBooks, 350)
}
async function searchBooks() {
  if (!bookQuery.value.trim()) { bookResults.value = []; return }
  const { data } = await apiClient.get('/books', { params: { search: bookQuery.value, per_page: 5 } })
  bookResults.value = data.data ?? data
  showBookResults.value = true
}
function selectBook(b) {
  selectedBook.value = b
  bookQuery.value = b.title
  showBookResults.value = false
}

function handleSubmit() {
  if (!selectedMember.value || !selectedBook.value) return
  emit('submit', {
    member_id: selectedMember.value.id,
    book_id: selectedBook.value.id,
  })
}
</script>
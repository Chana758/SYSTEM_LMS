<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Member Field Section -->
    <div class="relative space-y-1.5">
      <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">Member</label>
      <div class="relative">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
        <input
          v-model="memberQuery"
          type="text"
          placeholder="Search by name or membership no."
          class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors shadow-2xs"
          @input="debouncedMemberSearch"
          @focus="showMemberResults = true"
        />
      </div>

      <!-- Selected Member Pill -->
      <p v-if="selectedMember" class="text-xs font-extrabold text-emerald-800 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-2.5 mt-2 inline-flex items-center gap-1.5 shadow-2xs w-full">
        <span class="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">✓</span> 
        {{ selectedMember.user?.name }} <span class="text-slate-500 font-bold">({{ selectedMember.membership_no }})</span>
      </p>

      <!-- Member Dropdown Results -->
      <div v-if="showMemberResults && memberResults.length" class="absolute z-10 mt-1 w-full bg-white border-2 border-slate-300 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
        <button
          v-for="m in memberResults" :key="m.id" type="button"
          @click="selectMember(m)"
          class="block w-full text-left px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-emerald-50/70 transition-colors"
        >
          {{ m.user?.name }} <span class="text-slate-400 font-semibold">({{ m.membership_no }})</span>
        </button>
      </div>
      <p v-if="errors.member_id" class="text-xs font-extrabold text-rose-600 bg-rose-50 border-2 border-rose-200 rounded-xl p-2.5 mt-2 shadow-2xs">{{ errors.member_id[0] }}</p>
    </div>

    <!-- Book Field Section -->
    <div class="relative space-y-1.5">
      <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">Book</label>
      <div class="relative">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📖</span>
        <input
          v-model="bookQuery"
          type="text"
          placeholder="Search by title or ISBN"
          class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors shadow-2xs"
          @input="debouncedBookSearch"
          @focus="showBookResults = true"
        />
      </div>

      <!-- Selected Book Pill / Availability Warning -->
      <p v-if="selectedBook" class="text-xs font-extrabold mt-2 p-2.5 rounded-xl border-2 shadow-2xs" :class="selectedBook.available_qty > 0 ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-emerald-800 bg-emerald-50 border-emerald-200'">
        <span class="inline-flex items-center gap-1.5"><span class="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">✓</span> {{ selectedBook.title }}</span>
        <span v-if="selectedBook.available_qty > 0" class="block font-bold text-slate-600 text-[11px] mt-1">— This copy is available now — you can borrow it directly instead of reserving.</span>
      </p>

      <!-- Book Dropdown Results -->
      <div v-if="showBookResults && bookResults.length" class="absolute z-10 mt-1 w-full bg-white border-2 border-slate-300 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
        <button
          v-for="b in bookResults" :key="b.id" type="button"
          @click="selectBook(b)"
          class="flex items-center justify-between w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-emerald-50/70 transition-colors"
        >
          <span class="text-slate-900 truncate pr-2">{{ b.title }} <span class="text-slate-400 font-semibold">— {{ b.author }}</span></span>
          <span class="text-[10px] font-black px-2 py-0.5 rounded-lg border flex-shrink-0" :class="b.available_qty > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'">
            {{ b.available_qty }}/{{ b.total_qty }}
          </span>
        </button>
      </div>
      <p v-if="errors.book_id" class="text-xs font-extrabold text-rose-600 bg-rose-50 border-2 border-rose-200 rounded-xl p-2.5 mt-2 shadow-2xs">{{ errors.book_id[0] }}</p>
    </div>

    <!-- General Error Message -->
    <p v-if="errors.general" class="text-xs font-extrabold text-rose-600 bg-rose-50 border-2 border-rose-200 rounded-xl p-3 shadow-2xs">{{ errors.general }}</p>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="!selectedMember || !selectedBook || loading"
      class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-emerald-600/20"
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
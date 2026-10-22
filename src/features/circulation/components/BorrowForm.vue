<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Member search -->
    <div>
      <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{{ $t('circulation.borrowForm.memberLabel') }}</label>
      <input 
        v-model="memberSearch" 
        @input="searchMembers" 
        type="text" 
        :placeholder="$t('circulation.borrowForm.memberPlaceholder')" 
        class="w-full border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-600 transition" 
      />
      <div v-if="memberResults.length" class="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-md z-20">
        <div v-for="m in memberResults" :key="m.id" @click="selectMember(m)" class="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs text-slate-800 dark:text-slate-200 transition-colors">
          {{ m.user?.name }} — {{ m.membership_no }}
        </div>
      </div>
      <p v-if="selectedMember" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">✓ {{ selectedMember.user?.name }} ({{ selectedMember.membership_no }})</p>
    </div>

    <!-- Book search -->
    <div>
      <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{{ $t('circulation.borrowForm.bookLabel') }}</label>
      <input 
        v-model="bookSearch" 
        @input="searchBooks" 
        type="text" 
        :placeholder="$t('circulation.borrowForm.bookPlaceholder')" 
        class="w-full border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-600 transition" 
      />
      <div v-if="bookResults.length" class="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-md z-20">
        <div v-for="b in bookResults" :key="b.id" @click="selectBook(b)" class="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs flex justify-between items-center text-slate-800 dark:text-slate-200 transition-colors">
          <span>{{ b.title }}</span>
          <span class="text-[10px] font-bold" :class="b.available_qty > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'">{{ b.available_qty }} {{ $t('circulation.borrowForm.left') }}</span>
        </div>
      </div>
      <p v-if="selectedBook" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">✓ {{ selectedBook.title }}</p>
    </div>

    <p v-if="errors.general" class="text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5">
      {{ errors.general }}
    </p>

    <button
      type="submit"
      :disabled="loading || !selectedMember || !selectedBook"
      class="w-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer shadow-md"
    >
      {{ loading ? $t('circulation.processing') : $t('circulation.borrowForm.confirmCheckout') }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '@/api/axios'

const props = defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit'])

const memberSearch = ref('')
const memberResults = ref([])
const selectedMember = ref(null)

const bookSearch = ref('')
const bookResults = ref([])
const selectedBook = ref(null)

// Debounced member search (starts at 2 characters)
let memberTimeout = null
function searchMembers() {
  clearTimeout(memberTimeout)
  memberTimeout = setTimeout(async () => {
    if (memberSearch.value.length < 2) { memberResults.value = []; return }
    const { data } = await apiClient.get('/members', { params: { search: memberSearch.value, per_page: 5 } })
    memberResults.value = data.data
  }, 300)
}
function selectMember(m) {
  selectedMember.value = m
  memberSearch.value = m.user?.name
  memberResults.value = []
}

// Debounced book search (starts at 2 characters)
let bookTimeout = null
function searchBooks() {
  clearTimeout(bookTimeout)
  bookTimeout = setTimeout(async () => {
    if (bookSearch.value.length < 2) { bookResults.value = []; return }
    const { data } = await apiClient.get('/books', { params: { search: bookSearch.value, per_page: 5 } })
    bookResults.value = data.data
  }, 300)
}
function selectBook(b) {
  selectedBook.value = b
  bookSearch.value = b.title
  bookResults.value = []
}

function handleSubmit() {
  emit('submit', { member_id: selectedMember.value.id, book_id: selectedBook.value.id })
}
</script>
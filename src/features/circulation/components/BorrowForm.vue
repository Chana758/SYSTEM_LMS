<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Member (Membership No. or Name)</label>
      <input v-model="memberSearch" @input="searchMembers" type="text" placeholder="Search for a member..." class="w-full border rounded-lg px-3 py-2" />
      <div v-if="memberResults.length" class="border rounded-lg mt-1 max-h-40 overflow-y-auto">
        <div v-for="m in memberResults" :key="m.id" @click="selectMember(m)" class="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
          {{ m.user?.name }} — {{ m.membership_no }}
        </div>
      </div>
      <p v-if="selectedMember" class="text-sm text-green-700 mt-1">✓ {{ selectedMember.user?.name }} ({{ selectedMember.membership_no }})</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Book (Title or ISBN)</label>
      <input v-model="bookSearch" @input="searchBooks" type="text" placeholder="Search for a book..." class="w-full border rounded-lg px-3 py-2" />
      <div v-if="bookResults.length" class="border rounded-lg mt-1 max-h-40 overflow-y-auto">
        <div v-for="b in bookResults" :key="b.id" @click="selectBook(b)" class="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm flex justify-between">
          <span>{{ b.title }}</span>
          <span class="text-xs" :class="b.available_qty > 0 ? 'text-green-600' : 'text-red-500'">{{ b.available_qty }} left</span>
        </div>
      </div>
      <p v-if="selectedBook" class="text-sm text-green-700 mt-1">✓ {{ selectedBook.title }}</p>
    </div>

    <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

    <button
      type="submit"
      :disabled="loading || !selectedMember || !selectedBook"
      class="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
    >
      {{ loading ? 'Processing...' : 'Confirm Checkout' }}
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
<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-lg">
      <h2 class="text-lg font-bold text-gray-800 mb-1">{{ isEdit ? 'Edit E-book' : 'Add E-book' }}</h2>
      <p class="text-sm text-gray-500 mb-4">Attach a digital file to an existing book title.</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!isEdit" class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Book</label>
          <input
            v-model="bookQuery"
            type="text"
            placeholder="Search for a book..."
            class="w-full border rounded-lg px-3 py-2 text-sm"
            @input="debouncedSearch"
            @focus="showResults = true"
          />
          <p v-if="selectedBook" class="text-xs text-green-600 mt-1">✓ {{ selectedBook.title }}</p>
          <div v-if="showResults && bookResults.length" class="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
            <button
              v-for="b in bookResults" :key="b.id" type="button"
              @click="selectBook(b)"
              class="block w-full text-left px-3 py-2 text-sm hover:bg-green-50"
            >
              {{ b.title }} <span class="text-gray-400">— {{ b.author }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">File ({{ isEdit ? 'leave empty to keep current' : 'PDF/EPUB/MOBI, max 50MB' }})</label>
          <input
            type="file"
            accept=".pdf,.epub,.mobi"
            @change="handleFileChange"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select v-model="form.format" class="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="pdf">PDF</option>
              <option value="epub">EPUB</option>
              <option value="mobi">MOBI</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Access</label>
            <select v-model="form.access_type" class="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="member_only">Members Only</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" v-model="form.is_downloadable" />
          Allow download
        </label>

        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

        <div class="flex gap-2 pt-2">
          <button type="button" @click="$emit('cancel')" class="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
            {{ loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add E-book') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import apiClient from '@/api/axios'
import { useLibraryStore } from '../store/libraryStore'

const props = defineProps({
  ebook: { type: Object, default: null }, // pass for edit mode
})
const emit = defineEmits(['saved', 'cancel'])

const store = useLibraryStore()
const isEdit = computed(() => !!props.ebook)
const loading = ref(false)
const errorMessage = ref('')

const bookQuery = ref('')
const bookResults = ref([])
const selectedBook = ref(null)
const showResults = ref(false)

const form = ref({
  format: props.ebook?.format || 'pdf',
  access_type: props.ebook?.access_type || 'member_only',
  is_downloadable: props.ebook?.is_downloadable ?? true,
})
const selectedFile = ref(null)

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

function handleFileChange(e) {
  selectedFile.value = e.target.files[0] || null
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!isEdit.value && !selectedBook.value) {
    errorMessage.value = 'Please select a book.'
    return
  }
  if (!isEdit.value && !selectedFile.value) {
    errorMessage.value = 'Please choose a file.'
    return
  }

  const fd = new FormData()
  if (!isEdit.value) fd.append('book_id', selectedBook.value.id)
  if (selectedFile.value) fd.append('file', selectedFile.value)
  fd.append('format', form.value.format)
  fd.append('access_type', form.value.access_type)
  fd.append('is_downloadable', form.value.is_downloadable ? 1 : 0)

  loading.value = true
  const result = isEdit.value
    ? await store.updateEbook(props.ebook.id, fd)
    : await store.createEbook(fd)
  loading.value = false

  if (result.success) {
    emit('saved')
  } else {
    errorMessage.value = result.message
  }
}
</script>
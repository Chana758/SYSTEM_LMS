<template>
  <div class="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 sm:p-4">
    <div
      class="bg-white dark:bg-slate-900 border border-transparent dark:border-white/10 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[92dvh] overflow-y-auto shadow-xl dark:shadow-black/50"
      style="padding-bottom: max(1.25rem, env(safe-area-inset-bottom));"
    >
      <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ isEdit ? t('digitalLibrary.formModal.editTitle') : t('digitalLibrary.formModal.addTitle') }}</h2>
      <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">{{ t('digitalLibrary.formModal.subtitle') }}</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!isEdit" class="relative">
          <label :class="labelClass">{{ t('digitalLibrary.formModal.bookLabel') }}</label>
          <input
            v-model="bookQuery"
            type="text"
            :placeholder="t('digitalLibrary.formModal.searchBookPlaceholder')"
            :class="inputClass"
            @input="debouncedSearch"
            @focus="showResults = true"
          />
          <p v-if="selectedBook" class="text-xs text-green-600 dark:text-emerald-400 mt-1">✓ {{ selectedBook.title }}</p>
          <div v-if="showResults && bookResults.length" class="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg dark:shadow-black/40 max-h-40 overflow-y-auto">
            <button
              v-for="b in bookResults" :key="b.id" type="button"
              @click="selectBook(b)"
              class="block w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-white/5"
            >
              {{ b.title }} <span class="text-gray-400 dark:text-slate-500">— {{ b.author }}</span>
            </button>
          </div>
        </div>

        <div>
          <label :class="labelClass">
            {{ t('digitalLibrary.formModal.fileLabel') }} ({{ isEdit ? t('digitalLibrary.formModal.fileKeepHint') : t('digitalLibrary.formModal.fileNewHint') }})
          </label>
          <input
            type="file"
            accept=".pdf,.epub,.mobi"
            @change="handleFileChange"
            :class="[inputClass, 'file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white']"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label :class="labelClass">{{ t('digitalLibrary.formModal.format') }}</label>
            <select v-model="form.format" :class="[inputClass, 'dark:[color-scheme:dark]']">
              <option value="pdf">PDF</option>
              <option value="epub">EPUB</option>
              <option value="mobi">MOBI</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">{{ t('digitalLibrary.formModal.accessType') }}</label>
            <select v-model="form.access_type" :class="[inputClass, 'dark:[color-scheme:dark]']">
              <option value="member_only">{{ t('digitalLibrary.detail.accessMembersOnly') }}</option>
              <option value="public">{{ t('digitalLibrary.detail.accessPublic') }}</option>
            </select>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
          <input type="checkbox" v-model="form.is_downloadable" class="accent-emerald-600 w-4 h-4" />
          {{ t('digitalLibrary.formModal.allowDownload') }}
        </label>

        <p v-if="errorMessage" class="text-red-500 dark:text-rose-400 text-sm">{{ errorMessage }}</p>

        <div class="flex gap-2 pt-2">
          <button type="button" @click="$emit('cancel')" class="flex-1 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-slate-300 py-3 sm:py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            {{ t('digitalLibrary.formModal.cancel') }}
          </button>
          <button type="submit" :disabled="loading" class="flex-1 bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-3 sm:py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors">
            {{ loading ? t('digitalLibrary.formModal.saving') : (isEdit ? t('digitalLibrary.formModal.saveChanges') : t('digitalLibrary.formModal.addEbook')) }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import apiClient from '@/api/axios'
import { useLibraryStore } from '../store/libraryStore'

const { t } = useI18n()

// Full class names so Tailwind can generate them.
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'
const inputClass = 'w-full border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors'

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
    errorMessage.value = t('digitalLibrary.formModal.selectBookError')
    return
  }
  if (!isEdit.value && !selectedFile.value) {
    errorMessage.value = t('digitalLibrary.formModal.chooseFileError')
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
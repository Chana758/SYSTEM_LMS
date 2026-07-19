<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
        <input v-model="form.title" type="text" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.title }" />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
        <div class="flex gap-2">
          <input v-model="form.isbn" type="text" class="flex-1 border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.isbn }" />
          <button
            type="button"
            @click="handleIsbnLookup"
            :disabled="!form.isbn || store.isbnLookupLoading"
            class="px-3 py-2 border border-green-700 text-green-700 rounded-lg text-sm whitespace-nowrap disabled:opacity-40 hover:bg-green-50"
          >
            {{ store.isbnLookupLoading ? '...' : 'Auto-fill' }}
          </button>
        </div>
        <p v-if="errors.isbn" class="text-red-500 text-sm mt-1">{{ errors.isbn }}</p>
        <p v-if="isbnLookupError" class="text-amber-600 text-xs mt-1">{{ isbnLookupError }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Author</label>
        <input v-model="form.author" type="text" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.author }" />
        <p v-if="errors.author" class="text-red-500 text-sm mt-1">{{ errors.author }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select v-model="form.category_id" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.category_id }">
          <option value="">-- Select Category --</option>
          <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p v-if="errors.category_id" class="text-red-500 text-sm mt-1">{{ errors.category_id }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
        <input
          v-model.number="form.total_qty"
          type="number" min="1"
          :disabled="isEdit"
          class="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
          :class="{ 'border-red-500': errors.total_qty }"
        />
        <p v-if="isEdit" class="text-xs text-gray-400 mt-1">Use "Add Copies" button to adjust stock</p>
        <p v-if="errors.total_qty" class="text-red-500 text-sm mt-1">{{ errors.total_qty }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
        <input v-model="form.publisher" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Publish Year</label>
        <input v-model.number="form.publish_year" type="number" class="w-full border rounded-lg px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
        <input v-model="form.language" type="text" placeholder="e.g., en / km" class="w-full border rounded-lg px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Shelf Location</label>
        <input v-model="form.shelf_location" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea v-model="form.description" rows="3" class="w-full border rounded-lg px-3 py-2"></textarea>
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
        <input type="file" accept="image/*" @change="handleFileChange" class="w-full border rounded-lg px-3 py-2" />
        <img v-if="coverPreviewUrl" :src="coverPreviewUrl" class="mt-2 h-24 rounded-lg object-cover" />
      </div>
    </div>

    <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

    <div class="flex justify-end gap-2 pt-2">
      <button type="button" @click="$emit('cancel')" class="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
      <button type="submit" :disabled="loading" class="px-4 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50">
        {{ loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Book' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { useCatalogStore } from '../store/catalogStore'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit', 'cancel'])

const store = useCatalogStore()
const isbnLookupError = ref('')
const coverPreviewUrl = ref(null)

const form = reactive({
  title: '', isbn: '', author: '', publisher: '', category_id: '',
  language: 'en', publish_year: null, edition: '', pages: null,
  description: '', total_qty: 1, shelf_location: '', price: null,
})

let coverFile = null
function handleFileChange(e) {
  coverFile = e.target.files[0] || null
  coverPreviewUrl.value = coverFile ? URL.createObjectURL(coverFile) : null
}

async function handleIsbnLookup() {
  isbnLookupError.value = ''
  const result = await store.lookupIsbn(form.isbn)
  if (result.success) {
    const info = result.data
    if (info.title) form.title = info.title
    if (info.author) form.author = info.author
    if (info.publisher) form.publisher = info.publisher
    if (info.publish_year) form.publish_year = info.publish_year
    if (info.pages) form.pages = info.pages
    if (info.description) form.description = info.description
    if (info.language) form.language = info.language
  } else {
    isbnLookupError.value = result.message
  }
}

watch(() => props.initialData, (data) => {
  if (data && Object.keys(data).length) {
    Object.assign(form, {
      title: data.title || '', isbn: data.isbn || '', author: data.author || '',
      publisher: data.publisher || '', category_id: data.category_id || '',
      language: data.language || 'en', publish_year: data.publish_year || null,
      edition: data.edition || '', pages: data.pages || null,
      description: data.description || '', total_qty: data.total_qty || 1,
      shelf_location: data.shelf_location || '', price: data.price || null,
    })
  }
}, { immediate: true })

function handleSubmit() {
  const fd = new FormData()
  Object.entries(form).forEach(([key, value]) => {
    if (value !== null && value !== '' && !(props.isEdit && key === 'total_qty')) {
      fd.append(key, value)
    }
  })
  if (coverFile) fd.append('cover_image', coverFile)
  emit('submit', fd)
}

onMounted(() => {
  if (!store.categories.length) store.fetchCategories()
})
</script>
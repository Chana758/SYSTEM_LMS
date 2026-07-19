<template>
  <div v-if="store.currentBook">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-gray-800">Book Details</h1>
      <button @click="router.back()" class="text-sm text-gray-500 hover:underline">← Back</button>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex gap-6">
      <div class="w-32 h-44 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img v-if="store.currentBook.cover_image" :src="coverUrl(store.currentBook.cover_image)" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-4xl text-gray-300">📖</div>
      </div>
      <div>
        <h2 class="text-lg font-bold text-gray-800">{{ store.currentBook.title }}</h2>
        <p class="text-sm text-gray-500">{{ store.currentBook.author }}</p>
        <div class="flex items-center gap-2 mt-2">
          <StarRating :model-value="Math.round(store.currentBook.rating_avg)" readonly show-count :count="store.currentBook.rating_count" />
        </div>
        <p class="text-xs text-gray-400 mt-2">👁 {{ store.currentBook.views_count }} views</p>
      </div>
    </div>

    <!-- Admin/Librarian: full editable form -->
    <div v-if="canManage" class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <BookForm
        :initial-data="store.currentBook"
        :is-edit="true"
        :loading="store.loading"
        :errors="store.errors"
        @submit="handleUpdate"
        @cancel="router.back()"
      />
    </div>

    <!-- Member: read-only info block, no edit controls -->
    <div v-else class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <h2 class="font-bold text-gray-800 mb-4">Book Information</h2>
      <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <p class="text-gray-400 text-xs uppercase mb-0.5">ISBN</p>
          <p class="text-gray-700">{{ store.currentBook.isbn || '—' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs uppercase mb-0.5">Category</p>
          <p class="text-gray-700">{{ store.currentBook.category?.name || '—' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs uppercase mb-0.5">Publisher</p>
          <p class="text-gray-700">{{ store.currentBook.publisher || '—' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs uppercase mb-0.5">Publish Year</p>
          <p class="text-gray-700">{{ store.currentBook.publish_year || '—' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs uppercase mb-0.5">Language</p>
          <p class="text-gray-700">{{ store.currentBook.language || '—' }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-xs uppercase mb-0.5">Shelf Location</p>
          <p class="text-gray-700">{{ store.currentBook.shelf_location || '—' }}</p>
        </div>
        <div class="col-span-2">
          <p class="text-gray-400 text-xs uppercase mb-0.5">Description</p>
          <p class="text-gray-700 whitespace-pre-line">{{ store.currentBook.description || 'No description available.' }}</p>
        </div>
      </div>
    </div>

    <!-- Add Copies: admin/librarian only -->
    <div v-if="canManage" class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <h2 class="font-bold text-gray-800 mb-3">Add Copies</h2>
      <div class="flex gap-3">
        <input v-model.number="addQty" type="number" min="1" class="border rounded-lg px-3 py-2 w-32" />
        <button @click="handleAddCopies" :disabled="store.loading" class="bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          Add
        </button>
      </div>
      <p v-if="addCopiesMessage" class="text-sm mt-2" :class="addCopiesSuccess ? 'text-green-600' : 'text-red-500'">
        {{ addCopiesMessage }}
      </p>
    </div>

    <!-- Physical Copies: visible to everyone (member needs to know availability) -->
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
      <h2 class="font-bold text-gray-800 px-6 pt-4">Physical Copies ({{ store.currentBook.book_copies?.length || 0 }})</h2>
      <table class="w-full text-sm mt-3">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th class="text-left px-6 py-2">Barcode</th>
            <th class="text-left px-6 py-2">Status</th>
            <th class="text-left px-6 py-2">Condition</th>
            <th class="text-left px-6 py-2">Location</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="copy in store.currentBook.book_copies" :key="copy.id" class="border-t border-gray-100">
            <td class="px-6 py-2 font-mono">{{ copy.barcode }}</td>
            <td class="px-6 py-2">
              <span class="px-2 py-0.5 rounded-full text-xs" :class="copyStatusClass(copy.status)">
                {{ copy.status.charAt(0).toUpperCase() + copy.status.slice(1) }}
              </span>
            </td>
            <td class="px-6 py-2 capitalize">{{ copy.condition }}</td>
            <td class="px-6 py-2">{{ copy.shelf_location || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reviews: visible + writable by everyone -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 class="font-bold text-gray-800 mb-4">Reviews ({{ store.currentBook.rating_count || 0 }})</h2>

      <div class="border-b border-gray-100 pb-4 mb-4">
        <p class="text-sm text-gray-600 mb-2">Your rating</p>
        <StarRating v-model="myRating" />
        <textarea v-model="myComment" rows="2" placeholder="Write a comment (optional)..." class="w-full border rounded-lg px-3 py-2 text-sm mt-2"></textarea>
        <button @click="handleSubmitReview" :disabled="!myRating" class="mt-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          Submit Review
        </button>
        <p v-if="reviewMessage" class="text-sm mt-2" :class="reviewSuccess ? 'text-green-600' : 'text-red-500'">{{ reviewMessage }}</p>
      </div>

      <div v-if="!store.reviews.length" class="text-gray-400 text-sm text-center py-4">No reviews yet</div>
      <div v-for="r in store.reviews" :key="r.id" class="py-3 border-b border-gray-50 last:border-0">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">{{ r.member?.user?.name || 'Anonymous' }}</span>
          <StarRating :model-value="r.rating" readonly />
        </div>
        <p v-if="r.comment" class="text-sm text-gray-500 mt-1">{{ r.comment }}</p>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-10 text-gray-400">Loading...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogStore } from '../store/catalogStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import BookForm from '../components/BookForm.vue'
import StarRating from '../components/StarRating.vue'

const route = useRoute()
const router = useRouter()
const store = useCatalogStore()
const authStore = useAuthStore()
const addQty = ref(1)
const addCopiesMessage = ref('')
const addCopiesSuccess = ref(false)
const myRating = ref(0)
const myComment = ref('')
const reviewMessage = ref('')
const reviewSuccess = ref(false)

const canManage = computed(() => ['admin', 'librarian'].includes(authStore.role))

async function handleUpdate(formData) {
  const result = await store.updateBook(route.params.id, formData)
  if (result.success) store.fetchBook(route.params.id)
}

async function handleAddCopies() {
  const result = await store.addCopies(route.params.id, addQty.value)
  addCopiesSuccess.value = result.success
  addCopiesMessage.value = result.message
  if (result.success) {
    store.fetchBook(route.params.id)
    addQty.value = 1
  }
}

async function handleSubmitReview() {
  const result = await store.submitReview(route.params.id, { rating: myRating.value, comment: myComment.value })
  reviewSuccess.value = result.success
  reviewMessage.value = result.success ? result.message : result.message
  if (result.success) {
    store.fetchBook(route.params.id)
    myComment.value = ''
  }
}

function copyStatusClass(status) {
  return {
    available: 'bg-green-100 text-green-700',
    borrowed: 'bg-amber-100 text-amber-700',
    lost: 'bg-red-100 text-red-600',
    damaged: 'bg-gray-100 text-gray-600',
  }[status] || 'bg-gray-100 text-gray-600'
}

function coverUrl(path) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}

onMounted(() => {
  store.fetchCategories()
  store.fetchBook(route.params.id)
})
</script>
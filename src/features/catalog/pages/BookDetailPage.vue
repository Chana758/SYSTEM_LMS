<template>
  <div v-if="store.currentBook" class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="router.back()" class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-2xs cursor-pointer">
          ←
        </button>
        <div>
          <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">Book Details</h1>
          <p class="text-xs font-semibold text-slate-500 mt-0.5">Manage information, physical copies, and reader reviews.</p>
        </div>
      </div>
      <button @click="router.back()" class="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs transition-all cursor-pointer">
        Back to List
      </button>
    </div>

    <!-- ============ MAIN BOOK HERO CARD ============ -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs flex flex-col md:flex-row gap-6 items-start">
      <div class="w-32 h-44 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/60 shadow-inner">
        <img v-if="store.currentBook.cover_image" :src="coverUrl(store.currentBook.cover_image)" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-4xl text-slate-300">📖</div>
      </div>
      <div class="flex-1 space-y-3">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider mb-2">
            {{ store.currentBook.category?.name || 'General' }}
          </span>
          <h2 class="font-serif text-2xl font-black text-slate-900 tracking-tight">{{ store.currentBook.title }}</h2>
          <p class="text-sm font-bold text-slate-500 mt-0.5">{{ store.currentBook.author }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-4 pt-1">
          <div class="flex items-center gap-2">
            <StarRating :model-value="Math.round(store.currentBook.rating_avg || 0)" readonly show-count :count="store.currentBook.rating_count || 0" />
          </div>
          <span class="text-slate-300">•</span>
          <p class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <EyeIcon class="w-4 h-4 text-slate-400" />
            <span>{{ store.currentBook.views_count || 0 }} views</span>
          </p>
        </div>
      </div>
    </div>

    <!-- ============ ADMIN/LIBRARIAN: FULL EDITABLE FORM ============ -->
    <div v-if="canManage" class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 class="font-serif text-lg font-black text-slate-900">Edit Book Information</h2>
          <p class="text-xs text-slate-500 mt-0.5">Update catalog details, identifiers, and placement metadata.</p>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider">
          Admin Mode
        </span>
      </div>
      <BookForm
        :initial-data="store.currentBook"
        :is-edit="true"
        :loading="store.loading"
        :errors="store.errors"
        @submit="handleUpdate"
        @cancel="router.back()"
      />
    </div>

    <!-- ============ MEMBER: READ-ONLY INFO BLOCK ============ -->
    <div v-else class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs">
      <h2 class="font-serif text-lg font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Book Information</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
        <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">ISBN</p>
          <p class="text-slate-800 font-bold font-mono">{{ store.currentBook.isbn || '—' }}</p>
        </div>
        <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Category</p>
          <p class="text-slate-800 font-bold">{{ store.currentBook.category?.name || '—' }}</p>
        </div>
        <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Publisher</p>
          <p class="text-slate-800 font-bold">{{ store.currentBook.publisher || '—' }}</p>
        </div>
        <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Publish Year</p>
          <p class="text-slate-800 font-bold">{{ store.currentBook.publish_year || '—' }}</p>
        </div>
        <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Language</p>
          <p class="text-slate-800 font-bold uppercase">{{ store.currentBook.language || '—' }}</p>
        </div>
        <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Shelf Location</p>
          <p class="text-slate-800 font-bold">{{ store.currentBook.shelf_location || '—' }}</p>
        </div>
        <div class="col-span-full bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Description</p>
          <p class="text-slate-700 whitespace-pre-line text-xs leading-relaxed">{{ store.currentBook.description || 'No description available.' }}</p>
        </div>
      </div>
    </div>

    <!-- ============ ADD COPIES SECTION (ADMIN / LIBRARIAN) ============ -->
    <div v-if="canManage" class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs">
      <h2 class="font-serif text-lg font-black text-slate-900 mb-1">Add Physical Copies</h2>
      <p class="text-xs text-slate-500 mb-4">Generate additional inventory copies for this title into the library stock.</p>
      <div class="flex items-center gap-3">
        <input v-model.number="addQty" type="number" min="1" class="border border-slate-300 rounded-xl px-4 py-2.5 w-32 text-sm font-bold text-slate-800 focus:outline-emerald-600 shadow-2xs" />
        <button @click="handleAddCopies" :disabled="store.loading" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all shadow-sm cursor-pointer">
          Add Copies
        </button>
      </div>
      <p v-if="addCopiesMessage" class="text-xs font-bold mt-3" :class="addCopiesSuccess ? 'text-emerald-600' : 'text-rose-500'">
        {{ addCopiesMessage }}
      </p>
    </div>

    <!-- ============ PHYSICAL COPIES TABLE ============ -->
    <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
      <div class="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="font-serif text-lg font-black text-slate-900">Physical Copies</h2>
          <p class="text-xs text-slate-500 mt-0.5">Real-time availability status for borrowing items.</p>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black">
          {{ store.currentBook.book_copies?.length || 0 }} Total
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <th class="px-6 py-3.5">Barcode</th>
              <th class="px-6 py-3.5">Status</th>
              <th class="px-6 py-3.5">Condition</th>
              <th class="px-6 py-3.5">Location</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            <tr v-if="!store.currentBook.book_copies?.length">
              <td colspan="4" class="text-center py-12 text-slate-400">
                <span class="text-2xl mb-1 block">🏷️</span>
                <p class="font-bold text-slate-700">No physical copies registered</p>
              </td>
            </tr>
            <tr v-for="copy in store.currentBook.book_copies" :key="copy.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-6 py-4 font-mono font-bold text-slate-900">{{ copy.barcode }}</td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-lg text-xs font-black inline-block" :class="copyStatusClass(copy.status)">
                  {{ copy.status.charAt(0).toUpperCase() + copy.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 capitalize font-semibold text-slate-600">{{ copy.condition }}</td>
              <td class="px-6 py-4 font-semibold text-slate-600">{{ copy.shelf_location || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ REVIEWS SECTION ============ -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 class="font-serif text-lg font-black text-slate-900">Reader Reviews</h2>
          <p class="text-xs text-slate-500 mt-0.5">Feedback and ratings shared by community members.</p>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black">
          {{ store.currentBook.rating_count || 0 }} Reviews
        </span>
      </div>

      <!-- Submit Review Box -->
      <div class="bg-slate-50/70 rounded-xl p-5 border border-slate-200/70 space-y-4">
        <p class="text-xs font-black text-slate-700 uppercase tracking-wider">Leave your review</p>
        <div>
          <span class="text-xs font-semibold text-slate-500 block mb-1">Your rating</span>
          <StarRating v-model="myRating" />
        </div>
        <div>
          <textarea v-model="myComment" rows="3" placeholder="Write your thoughts or a review summary about this book..." class="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs bg-white text-slate-800 focus:outline-emerald-600 shadow-2xs"></textarea>
        </div>
        <div class="flex items-center justify-between">
          <button @click="handleSubmitReview" :disabled="!myRating" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all shadow-sm cursor-pointer">
            Submit Review
          </button>
          <p v-if="reviewMessage" class="text-xs font-bold" :class="reviewSuccess ? 'text-emerald-600' : 'text-rose-500'">{{ reviewMessage }}</p>
        </div>
      </div>

      <!-- Reviews Feed -->
      <div class="space-y-4 pt-2">
        <div v-if="!store.reviews.length" class="text-slate-400 text-xs text-center py-12">
          <span class="text-2xl mb-1 block">💬</span>
          <p class="font-bold text-slate-700">No reviews yet</p>
          <p class="text-slate-400 mt-0.5">Be the first member to review this book!</p>
        </div>
        <div v-for="r in store.reviews" :key="r.id" class="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900">{{ r.member?.user?.name || 'Anonymous' }}</span>
            <StarRating :model-value="r.rating" readonly />
          </div>
          <p v-if="r.comment" class="text-xs text-slate-600 leading-relaxed">{{ r.comment }}</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20 text-slate-400">
    <div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Loading book details...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EyeIcon } from '@heroicons/vue/24/outline'
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
    myRating.value = 0
  }
}

function copyStatusClass(status) {
  return {
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    borrowed: 'bg-amber-50 text-amber-700 border border-amber-200/50',
    lost: 'bg-rose-50 text-rose-600 border border-rose-200/50',
    damaged: 'bg-slate-100 text-slate-600 border border-slate-200/50',
  }[status] || 'bg-slate-100 text-slate-600 border border-slate-200/50'
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
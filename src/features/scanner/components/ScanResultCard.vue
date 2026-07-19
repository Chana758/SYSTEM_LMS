<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <!-- status banner -->
    <div class="px-6 py-3 flex items-center gap-2" :class="banner.bg">
      <component :is="banner.icon" class="w-4 h-4 flex-shrink-0" :class="banner.iconColor" />
      <span class="text-xs font-semibold" :class="banner.textColor">{{ banner.label }}</span>
    </div>

    <div class="p-6">
      <div class="flex items-start gap-4">
        <img
          v-if="result.book_copy?.book?.cover_image"
          :src="result.book_copy.book.cover_image"
          class="w-20 h-28 object-cover rounded-xl border border-gray-100 flex-shrink-0"
          alt="Book cover"
        />
        <div v-else class="w-20 h-28 rounded-xl flex-shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100">
          <BookOpenIcon class="w-7 h-7 text-gray-300" />
        </div>

        <div class="flex-1 min-w-0">
          <template v-if="result.book_copy">
            <h3 class="font-semibold text-base leading-snug text-gray-800 truncate">
              {{ result.book_copy.book?.title }}
            </h3>
            <p class="text-sm text-gray-500 mt-0.5">{{ result.book_copy.book?.author }}</p>
            <p class="font-mono text-xs mt-2 inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
              {{ result.book_copy.barcode }}
            </p>
          </template>
          <template v-else>
            <p class="text-sm text-gray-400">No book copy found for this barcode.</p>
          </template>

          <div v-if="result.active_borrow" class="mt-3 flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-100 text-amber-800">
            <UserCircleIcon class="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span>
              Borrowed by <span class="font-semibold">{{ result.active_borrow.member?.user?.name }}</span>
              since {{ formatDate(result.active_borrow.borrow_date) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Borrow confirmation -->
      <div v-if="scanType === 'borrow' && result.result === 'success'" class="mt-5 pt-5 border-t border-dashed border-gray-200">
        <label class="block text-sm font-medium text-gray-700 mb-2">Assign to Member</label>
        <div class="relative">
          <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="memberSearch"
            @input="searchMembers"
            type="text"
            placeholder="Search member by name or membership no…"
            class="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border-2 border-gray-200 focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
          />
        </div>

        <ul v-if="memberOptions.length" class="mt-2 rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-40 overflow-y-auto">
          <li
            v-for="m in memberOptions" :key="m.id"
            @click="selectedMember = m"
            class="px-3 py-2.5 text-sm cursor-pointer transition flex items-center justify-between"
            :class="selectedMember?.id === m.id ? 'bg-green-50' : 'hover:bg-gray-50'"
          >
            <span class="text-gray-700">{{ m.user?.name }}</span>
            <span class="font-mono text-xs text-gray-400">{{ m.membership_no }}</span>
          </li>
        </ul>

        <button
          @click="handleConfirmBorrow"
          :disabled="!selectedMember || isSubmitting"
          class="mt-3 w-full px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Confirming…' : 'Confirm Borrow' }}
        </button>
      </div>

      <!-- Return confirmation -->
      <div v-if="scanType === 'return' && result.active_borrow" class="mt-5 pt-5 border-t border-dashed border-gray-200">
        <button
          @click="handleConfirmReturn"
          :disabled="isSubmitting"
          class="w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Confirming…' : 'Confirm Return' }}
        </button>
      </div>

      <transition name="fade">
        <p v-if="actionError" class="text-sm mt-3 rounded-xl px-3.5 py-2.5 bg-red-50 border border-red-100 text-red-600">{{ actionError }}</p>
      </transition>
      <transition name="fade">
        <p v-if="actionSuccess" class="text-sm mt-3 rounded-xl px-3.5 py-2.5 bg-green-50 border border-green-100 text-green-700">{{ actionSuccess }}</p>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon,
  BookOpenIcon, UserCircleIcon, MagnifyingGlassIcon,
} from '@heroicons/vue/24/solid'
import { scannerService } from '../services'

const props = defineProps({
  result: { type: Object, required: true },
  scanType: { type: String, required: true },
})

const emit = defineEmits(['completed'])

const bannerMap = {
  success:   { label: 'Found · Available', bg: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', icon: CheckCircleIcon },
  not_found: { label: 'Not on File', bg: 'bg-gray-50', textColor: 'text-gray-600', iconColor: 'text-gray-400', icon: ExclamationTriangleIcon },
  error:     { label: 'Action Needed', bg: 'bg-red-50', textColor: 'text-red-600', iconColor: 'text-red-500', icon: XCircleIcon },
}
const banner = computed(() => bannerMap[props.result.result] ?? bannerMap.not_found)

const memberSearch = ref('')
const memberOptions = ref([])
const selectedMember = ref(null)
const isSubmitting = ref(false)
const actionError = ref('')
const actionSuccess = ref('')

let searchTimeout = null
const searchMembers = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (!memberSearch.value.trim()) {
      memberOptions.value = []
      return
    }
    try {
      const { data } = await scannerService.searchMembers(memberSearch.value)
      memberOptions.value = data.data ?? data
    } catch (e) {
      memberOptions.value = []
    }
  }, 300)
}

const formatDate = (d) => new Date(d).toLocaleDateString()

const handleConfirmBorrow = async () => {
  actionError.value = ''
  actionSuccess.value = ''
  isSubmitting.value = true
  try {
    await scannerService.confirmBorrow({
      book_copy_id: props.result.book_copy.id,
      member_id: selectedMember.value.id,
    })
    actionSuccess.value = 'Borrow confirmed successfully.'
    emit('completed')
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed to confirm borrow.'
  } finally {
    isSubmitting.value = false
  }
}

const handleConfirmReturn = async () => {
  actionError.value = ''
  actionSuccess.value = ''
  isSubmitting.value = true
  try {
    await scannerService.confirmReturn(props.result.active_borrow.id)
    actionSuccess.value = 'Return confirmed successfully.'
    emit('completed')
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed to confirm return.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
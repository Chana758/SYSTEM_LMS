<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <!-- Status Banner -->
    <div class="px-6 py-3 flex items-center gap-2" :class="banner.bg">
      <component :is="banner.icon" class="w-4 h-4 flex-shrink-0" :class="banner.iconColor" />
      <span class="text-xs font-semibold" :class="banner.textColor">{{ banner.label }}</span>
    </div>

    <div class="p-6">
      <!-- Book Header Info -->
      <div class="flex items-start gap-4">
        <img
          v-if="result.book_copy?.book?.cover_image"
          :src="coverUrl(result.book_copy.book.cover_image)"
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
            <p class="text-sm text-gray-400">{{ t('scanner.result.noBookCopyFound') }}</p>
          </template>

          <div v-if="result.active_borrow" class="mt-3 flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-100 text-amber-800">
            <UserCircleIcon class="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span>
              {{ t('scanner.result.borrowedBySince', { name: result.active_borrow.member?.user?.name, date: formatDate(result.active_borrow.borrow_date) }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- BORROW FLOW: Available to Assign -->
      <div
        v-if="scanType === 'borrow' && result.result === 'success' && !result.active_borrow"
        class="mt-5 pt-5 border-t border-dashed border-gray-200"
      >
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('scanner.result.assignToMember') }}</label>

        <div class="relative">
          <div class="relative">
            <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="memberSearch"
              @input="searchMembers"
              type="text"
              :placeholder="t('scanner.result.searchMemberPlaceholder')"
              class="w-full rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none border-2 border-gray-200 focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
            />
            <button
              v-if="selectedMember"
              @click="clearSelectedMember"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <ul
            v-if="memberOptions.length"
            class="absolute z-30 left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl divide-y divide-gray-100 max-h-48 overflow-y-auto select-none"
          >
            <li
              v-for="m in memberOptions"
              :key="m.id"
              @click="selectMember(m)"
              class="px-3.5 py-2.5 text-sm cursor-pointer transition flex items-center justify-between hover:bg-green-50 active:bg-green-100"
            >
              <span class="text-gray-800 font-medium">{{ m.user?.name }}</span>
              <span class="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ m.membership_no }}</span>
            </li>
          </ul>
        </div>

        <button
          @click="handleConfirmBorrow"
          :disabled="!selectedMember || isSubmitting"
          class="mt-4 w-full px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? t('scanner.result.confirming') : t('scanner.result.confirmBorrow') }}
        </button>
      </div>

      <!-- BORROW FLOW: Already Checked Out -->
      <div
        v-else-if="scanType === 'borrow' && result.result === 'success' && result.active_borrow"
        class="mt-5 pt-5 border-t border-dashed border-gray-200"
      >
        <p class="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 mb-3">
          {{ t('scanner.result.alreadyCheckedOut') }}
        </p>

        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('scanner.result.reserveForMember') }}</label>

        <div class="relative">
          <div class="relative">
            <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="memberSearch"
              @input="searchMembers"
              type="text"
              :placeholder="t('scanner.result.searchMemberPlaceholder')"
              class="w-full rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none border-2 border-gray-200 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition"
            />
            <button
              v-if="selectedMember"
              @click="clearSelectedMember"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <ul
            v-if="memberOptions.length"
            class="absolute z-30 left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl divide-y divide-gray-100 max-h-48 overflow-y-auto select-none"
          >
            <li
              v-for="m in memberOptions"
              :key="m.id"
              @click="selectMember(m)"
              class="px-3.5 py-2.5 text-sm cursor-pointer transition flex items-center justify-between hover:bg-blue-50 active:bg-blue-100"
            >
              <span class="text-gray-800 font-medium">{{ m.user?.name }}</span>
              <span class="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ m.membership_no }}</span>
            </li>
          </ul>
        </div>

        <button
          @click="handleReserve"
          :disabled="!selectedMember || isSubmitting"
          class="mt-4 w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? t('scanner.result.addingToQueue') : t('scanner.result.addToQueue') }}
        </button>
      </div>

      <!-- RETURN FLOW -->
      <div v-if="scanType === 'return' && result.active_borrow" class="mt-5 pt-5 border-t border-dashed border-gray-200 space-y-4">
        <div v-if="daysLate > 0" class="flex items-start gap-2 text-sm rounded-xl px-3.5 py-3 bg-rose-50 border border-rose-100 text-rose-700">
          <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
          <span>
            {{ t('scanner.result.overdueWarning', { days: daysLate, fine: estimatedOverdueFineKhr.toLocaleString(), usd: khrToUsd(estimatedOverdueFineKhr) }) }}
          </span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('scanner.result.bookCondition') }}</label>
          <select
            v-model="returnCondition"
            class="w-full rounded-xl px-3.5 py-2.5 text-sm border-2 border-gray-200 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
          >
            <option value="good">{{ t('scanner.result.conditionGood') }}</option>
            <option value="damaged">{{ t('scanner.result.conditionDamaged') }}</option>
            <option value="lost">{{ t('scanner.result.conditionLost') }}</option>
          </select>
        </div>

        <div v-if="returnCondition === 'damaged'">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('scanner.result.damageFee') }}</label>
          <input
            v-model.number="damageFeeKhr"
            type="number" min="0" step="500"
            class="w-full rounded-xl px-3.5 py-2.5 text-sm border-2 border-gray-200 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
          />
          <p class="text-xs text-gray-400 mt-1">≈ ${{ khrToUsd(damageFeeKhr) }}</p>
        </div>

        <div v-if="returnCondition === 'lost'">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('scanner.result.lostFee') }}</label>
          <input
            v-model.number="lostFeeKhr"
            type="number" min="0" step="1000"
            class="w-full rounded-xl px-3.5 py-2.5 text-sm border-2 border-gray-200 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
          />
          <p class="text-xs text-gray-400 mt-1">≈ ${{ khrToUsd(lostFeeKhr) }}</p>
        </div>

        <div v-if="returnCondition !== 'good'">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('scanner.result.notesOptional') }}</label>
          <textarea
            v-model="returnNotes"
            rows="2"
            :placeholder="t('scanner.result.notesPlaceholder')"
            class="w-full rounded-xl px-3.5 py-2.5 text-sm border-2 border-gray-200 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
          ></textarea>
        </div>

        <button
          @click="handleConfirmReturn"
          :disabled="isSubmitting"
          class="w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? t('scanner.result.confirming2') : t('scanner.result.confirmReturn') }}
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
import { ref, computed, watch } from 'vue'
import {
  CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon,
  BookOpenIcon, UserCircleIcon, MagnifyingGlassIcon,
} from '@heroicons/vue/24/solid'
import { scannerService } from '../services'
import { soundService } from '../services/soundService'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const KHR_TO_USD_RATE = 4100
const khrToUsd = (khr) => ((khr || 0) / KHR_TO_USD_RATE).toFixed(2)

const props = defineProps({
  result: { type: Object, required: true },
  scanType: { type: String, required: true },
})

const emit = defineEmits(['completed'])

const bannerMap = computed(() => ({
  success:   { label: t('scanner.result.foundAvailable'), bg: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500', icon: CheckCircleIcon },
  not_found: { label: t('scanner.result.notOnFile'), bg: 'bg-gray-50', textColor: 'text-gray-600', iconColor: 'text-gray-400', icon: ExclamationTriangleIcon },
  error:     { label: t('scanner.result.actionNeeded'), bg: 'bg-red-50', textColor: 'text-red-600', iconColor: 'text-red-500', icon: XCircleIcon },
}))
const banner = computed(() => bannerMap.value[props.result.result] ?? bannerMap.value.not_found)

const memberSearch = ref('')
const memberOptions = ref([])
const selectedMember = ref(null)
const isSubmitting = ref(false)
const actionError = ref('')
const actionSuccess = ref('')

// Return-flow state
const returnCondition = ref('good')
const damageFeeKhr = ref(5000)
const lostFeeKhr = ref(15000)
const returnNotes = ref('')

const daysLate = computed(() => {
  if (!props.result.active_borrow?.due_date) return 0
  const diff = Math.floor((new Date() - new Date(props.result.active_borrow.due_date)) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})
const estimatedOverdueFineKhr = computed(() => daysLate.value * 500)

function coverUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  const baseUrl = apiBase.replace(/\/api\/?$/, '')

  let cleanPath = path.startsWith('/') ? path.slice(1) : path

  if (cleanPath.startsWith('storage/')) {
    return `${baseUrl}/${cleanPath}`
  }

  return `${baseUrl}/storage/${cleanPath}`
}

let searchTimeout = null
const searchMembers = () => {
  selectedMember.value = null
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

const selectMember = (m) => {
  selectedMember.value = m
  memberSearch.value = m.user?.name || m.membership_no
  memberOptions.value = []
}

const clearSelectedMember = () => {
  selectedMember.value = null
  memberSearch.value = ''
  memberOptions.value = []
}

const formatDate = (d) => new Date(d).toLocaleDateString()

const handleConfirmBorrow = async () => {
  actionError.value = ''
  actionSuccess.value = ''
  isSubmitting.value = true
  try {
    await scannerService.confirmBorrow({
      book_copy_id: props.result.book_copy?.id,
      book_id: props.result.book_copy?.book_id || props.result.book_copy?.book?.id,
      member_id: selectedMember.value?.id,
    })
    actionSuccess.value = t('scanner.result.borrowConfirmedMsg')
    emit('completed')
  } catch (e) {
    actionError.value = e.response?.data?.message || t('scanner.result.confirmBorrowFailed')
  } finally {
    isSubmitting.value = false
  }
}

const handleReserve = async () => {
  actionError.value = ''
  actionSuccess.value = ''
  isSubmitting.value = true
  try {
    await scannerService.reserveBook({
      book_id: props.result.book_copy?.book_id || props.result.book_copy?.book?.id,
      member_id: selectedMember.value?.id,
    })
    actionSuccess.value = t('scanner.result.reservedMsg')
    emit('completed')
  } catch (e) {
    actionError.value = e.response?.data?.message || t('scanner.result.reserveFailed')
  } finally {
    isSubmitting.value = false
  }
}

const handleConfirmReturn = async () => {
  actionError.value = ''
  actionSuccess.value = ''
  isSubmitting.value = true
  try {
    const payload = { condition: returnCondition.value }
    if (returnCondition.value === 'damaged') {
      payload.damage_fee = damageFeeKhr.value
      payload.notes = returnNotes.value
    }
    if (returnCondition.value === 'lost') {
      payload.lost_fee = lostFeeKhr.value
      payload.notes = returnNotes.value
    }
    const { data } = await scannerService.confirmReturn(props.result.active_borrow.id, payload)
    actionSuccess.value = data.message || t('scanner.result.returnConfirmedMsg')
    emit('completed')
  } catch (e) {
    actionError.value = e.response?.data?.message || t('scanner.result.confirmReturnFailed')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.result,
  (r) => {
    if (!r) return
    if (r.result === 'success') {
      soundService.success()
      soundService.vibrate([30])
    } else if (r.result === 'not_found') {
      soundService.notFound()
      soundService.vibrate([30, 40, 30])
    } else {
      soundService.error()
      soundService.vibrate([60, 40, 60])
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
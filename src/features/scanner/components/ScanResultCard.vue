<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
    <!-- Status Banner -->
    <div class="px-6 py-3 flex items-center gap-2" :class="banner.bg">
      <component :is="banner.icon" class="w-4 h-4 flex-shrink-0" :class="banner.iconColor" />
      <span class="text-xs font-semibold" :class="banner.textColor">{{ banner.label }}</span>
    </div>

    <div class="p-6">
      <!-- Reason from the backend (e.g. nothing to return, copy unavailable) -->
      <p
        v-if="reasonText"
        class="text-sm mb-4 rounded-xl px-3.5 py-2.5 bg-red-50 dark:bg-rose-500/10 border border-red-100 dark:border-rose-400/25 text-red-600 dark:text-rose-300"
      >
        {{ reasonText }}
      </p>

      <!-- Book Header Info -->
      <div class="flex items-start gap-4">
        <img
          v-if="result.book_copy?.book?.cover_image"
          :src="coverUrl(result.book_copy.book.cover_image)"
          class="w-20 h-28 object-cover rounded-xl border border-gray-100 dark:border-white/10 flex-shrink-0"
          alt="Book cover"
        />
        <div v-else class="w-20 h-28 rounded-xl flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/10">
          <BookOpenIcon class="w-7 h-7 text-gray-300 dark:text-slate-600" />
        </div>

        <div class="flex-1 min-w-0">
          <template v-if="result.book_copy">
            <h3 class="font-semibold text-base leading-snug text-gray-800 dark:text-white truncate">
              {{ result.book_copy.book?.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{{ result.book_copy.book?.author }}</p>

            <div class="mt-2 flex flex-wrap items-center gap-2">
              <p class="font-mono text-xs inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300">
                {{ result.book_copy.barcode }}
              </p>
              <!-- Stock of the whole title (all copies) -->
              <p
                v-if="stats"
                class="text-xs font-semibold inline-block px-2 py-0.5 rounded-md"
                :class="stats.available_copies > 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'"
              >
                {{ t('scanner.result.copiesAvailable', { available: stats.available_copies, total: stats.total_copies }) }}
              </p>
            </div>
          </template>
          <template v-else>
            <p class="text-sm text-gray-400 dark:text-slate-400">{{ t('scanner.result.noBookCopyFound') }}</p>
          </template>

          <div v-if="result.active_borrow" class="mt-3 flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-400/25 text-amber-800 dark:text-amber-200">
            <UserCircleIcon class="w-4 h-4 flex-shrink-0 text-amber-500 dark:text-amber-300" />
            <span>
              {{ t('scanner.result.borrowedBySince', { name: result.active_borrow.member?.user?.name, date: formatDate(result.active_borrow.borrow_date) }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- BORROW FLOW (3 modes: assign / borrowOther / reserve) -->
      <div
        v-if="borrowMode"
        class="mt-5 pt-5 border-t border-dashed border-gray-200 dark:border-white/15"
      >
        <!-- Notice -->
        <p
          v-if="borrowMode === 'borrowOther'"
          class="text-sm text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-400/25 rounded-xl px-3.5 py-2.5 mb-3"
        >
          {{ t('scanner.result.otherCopiesAvailable', { n: stats?.available_copies ?? 0 }) }}
        </p>
        <p
          v-else-if="borrowMode === 'reserve'"
          class="text-sm text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-400/25 rounded-xl px-3.5 py-2.5 mb-3"
        >
          {{ t('scanner.result.alreadyCheckedOut') }}
        </p>

        <label :class="labelClass">
          {{ borrowMode === 'reserve' ? t('scanner.result.reserveForMember') : t('scanner.result.assignToMember') }}
        </label>

        <div class="relative">
          <div class="relative">
            <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              v-model="memberSearch"
              @input="searchMembers"
              type="text"
              :disabled="!!actionSuccess"
              :placeholder="t('scanner.result.searchMemberPlaceholder')"
              :class="[inputBase, accent.focus]"
              class="pl-9 pr-8"
            />
            <button
              v-if="selectedMember && !actionSuccess"
              @click="clearSelectedMember"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <ul v-if="memberOptions.length" :class="dropdownClass">
            <li
              v-for="m in memberOptions"
              :key="m.id"
              @click="selectMember(m)"
              class="px-3.5 py-2.5 text-sm cursor-pointer transition flex items-center justify-between"
              :class="accent.option"
            >
              <span class="text-gray-800 dark:text-slate-100 font-medium">{{ m.user?.name }}</span>
              <span class="font-mono text-xs text-gray-400 dark:text-slate-300 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{{ m.membership_no }}</span>
            </li>
          </ul>
        </div>

        <button
          @click="handleBorrowSubmit"
          :disabled="!selectedMember || isSubmitting || !!actionSuccess"
          class="mt-4 w-full px-5 py-2.5 text-white text-sm font-semibold rounded-xl active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          :class="accent.button"
        >
          {{ submitLabel }}
        </button>
      </div>

      <!-- RETURN FLOW -->
      <div v-if="scanType === 'return' && result.active_borrow" class="mt-5 pt-5 border-t border-dashed border-gray-200 dark:border-white/15 space-y-4">
        <div v-if="daysLate > 0" class="flex items-start gap-2 text-sm rounded-xl px-3.5 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-400/25 text-rose-700 dark:text-rose-300">
          <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-300" />
          <span>
            {{ t('scanner.result.overdueWarning', { days: daysLate, fine: estimatedOverdueFineKhr.toLocaleString(), usd: khrToUsd(estimatedOverdueFineKhr) }) }}
          </span>
        </div>

        <div>
          <label :class="labelClass">{{ t('scanner.result.bookCondition') }}</label>
          <select
            v-model="returnCondition"
            :disabled="!!actionSuccess"
            :class="inputBase"
            class="px-3.5 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 dark:focus:border-blue-400 dark:[color-scheme:dark]"
          >
            <option value="good">{{ t('scanner.result.conditionGood') }}</option>
            <option value="damaged">{{ t('scanner.result.conditionDamaged') }}</option>
            <option value="lost">{{ t('scanner.result.conditionLost') }}</option>
          </select>
        </div>

        <div v-if="returnCondition === 'damaged'">
          <label :class="labelClass">{{ t('scanner.result.damageFee') }}</label>
          <input
            v-model.number="damageFeeKhr"
            type="number" min="0" step="500"
            :disabled="!!actionSuccess"
            :class="inputBase"
            class="px-3.5 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 dark:focus:border-blue-400"
          />
          <p class="text-xs text-gray-400 dark:text-slate-400 mt-1">≈ ${{ khrToUsd(damageFeeKhr) }}</p>
        </div>

        <div v-if="returnCondition === 'lost'">
          <label :class="labelClass">{{ t('scanner.result.lostFee') }}</label>
          <input
            v-model.number="lostFeeKhr"
            type="number" min="0" step="1000"
            :disabled="!!actionSuccess"
            :class="inputBase"
            class="px-3.5 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 dark:focus:border-blue-400"
          />
          <p class="text-xs text-gray-400 dark:text-slate-400 mt-1">≈ ${{ khrToUsd(lostFeeKhr) }}</p>
        </div>

        <div v-if="returnCondition !== 'good'">
          <label :class="labelClass">{{ t('scanner.result.notesOptional') }}</label>
          <textarea
            v-model="returnNotes"
            rows="2"
            :disabled="!!actionSuccess"
            :placeholder="t('scanner.result.notesPlaceholder')"
            :class="inputBase"
            class="px-3.5 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 dark:focus:border-blue-400"
          ></textarea>
        </div>

        <button
          @click="handleConfirmReturn"
          :disabled="isSubmitting || !!actionSuccess"
          class="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-xl active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ isSubmitting ? t('scanner.result.confirming2') : t('scanner.result.confirmReturn') }}
        </button>
      </div>

      <transition name="fade">
        <p v-if="actionError" class="text-sm mt-3 rounded-xl px-3.5 py-2.5 bg-red-50 dark:bg-rose-500/10 border border-red-100 dark:border-rose-400/25 text-red-600 dark:text-rose-300">{{ actionError }}</p>
      </transition>
      <transition name="fade">
        <p v-if="actionSuccess" class="text-sm mt-3 rounded-xl px-3.5 py-2.5 bg-green-50 dark:bg-emerald-500/10 border border-green-100 dark:border-emerald-400/25 text-green-700 dark:text-emerald-300">{{ actionSuccess }}</p>
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

const { t, te } = useI18n()

// Full class names so Tailwind can generate them.
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2'
const inputBase = 'w-full rounded-xl py-2.5 text-sm outline-none transition border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed'
const dropdownClass = 'absolute z-30 left-0 right-0 mt-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 shadow-xl dark:shadow-black/50 divide-y divide-gray-100 dark:divide-white/10 max-h-48 overflow-y-auto select-none'

const KHR_TO_USD_RATE = 4100
const khrToUsd = (khr) => ((khr || 0) / KHR_TO_USD_RATE).toFixed(2)

const props = defineProps({
  result: { type: Object, required: true },
  scanType: { type: String, required: true },
})

const emit = defineEmits(['completed'])

/* ------------------------------------------------------------------ */
/*  Which borrow flow applies?                                         */
/*   assign      : scanned copy is free  -> borrow it                  */
/*   borrowOther : scanned copy is out, but another copy is free       */
/*                 -> borrow a free copy (reservation would be refused)*/
/*   reserve     : every copy is out -> join the queue                 */
/* ------------------------------------------------------------------ */
const stats = computed(() => props.result.book_stats ?? null)

const borrowMode = computed(() => {
  if (props.scanType !== 'borrow' || props.result.result !== 'success') return null
  if (!props.result.active_borrow) return 'assign'
  if (stats.value?.can_borrow_other) return 'borrowOther'
  return 'reserve'
})

const accent = computed(() =>
  borrowMode.value === 'reserve'
    ? {
        focus: 'focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 dark:focus:border-blue-400',
        option: 'hover:bg-blue-50 dark:hover:bg-blue-500/10 active:bg-blue-100',
        button: 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500',
      }
    : {
        focus: 'focus:ring-2 focus:ring-green-600/30 focus:border-green-600 dark:focus:border-emerald-400',
        option: 'hover:bg-green-50 dark:hover:bg-emerald-500/10 active:bg-green-100',
        button: 'bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500',
      },
)

const submitLabel = computed(() => {
  if (borrowMode.value === 'reserve') {
    return isSubmitting.value ? t('scanner.result.addingToQueue') : t('scanner.result.addToQueue')
  }
  if (borrowMode.value === 'borrowOther') {
    return isSubmitting.value ? t('scanner.result.confirming') : t('scanner.result.borrowAvailableCopy')
  }
  return isSubmitting.value ? t('scanner.result.confirming') : t('scanner.result.confirmBorrow')
})

/* Reason shown for error results: translated by `code` when possible, else raw `message`. */
const reasonText = computed(() => {
  const r = props.result
  if (r.result !== 'error') return ''
  if (r.code && te(`scanner.errors.${r.code}`)) return t(`scanner.errors.${r.code}`)
  return r.message || ''
})

/* Translate a copy status (available, reserved, damaged…) when a translation exists. */
const statusText = (s) => (te(`scanner.result.statuses.${s}`) ? t(`scanner.result.statuses.${s}`) : s)

/* Banner follows the real state of the scanned copy */
const banner = computed(() => {
  const r = props.result

  if (r.result === 'success' && r.active_borrow) {
    return {
      label: t('scanner.result.foundBorrowed'),
      bg: 'bg-amber-50 dark:bg-amber-500/15',
      textColor: 'text-amber-700 dark:text-amber-300',
      iconColor: 'text-amber-500 dark:text-amber-300',
      icon: ExclamationTriangleIcon,
    }
  }

  // Lookup of a copy that is not on loan but also not available (damaged / lost / reserved...)
  if (
    r.result === 'success' &&
    !r.active_borrow &&
    r.book_copy &&
    r.book_copy.status &&
    r.book_copy.status !== 'available'
  ) {
    return {
      label: t('scanner.result.copyStatus', { status: statusText(r.book_copy.status) }),
      bg: 'bg-amber-50 dark:bg-amber-500/15',
      textColor: 'text-amber-700 dark:text-amber-300',
      iconColor: 'text-amber-500 dark:text-amber-300',
      icon: ExclamationTriangleIcon,
    }
  }

  const map = {
    success:   { label: t('scanner.result.foundAvailable'), bg: 'bg-green-50 dark:bg-emerald-500/15', textColor: 'text-green-700 dark:text-emerald-300', iconColor: 'text-green-500 dark:text-emerald-300', icon: CheckCircleIcon },
    not_found: { label: t('scanner.result.notOnFile'), bg: 'bg-gray-50 dark:bg-slate-500/15', textColor: 'text-gray-600 dark:text-slate-300', iconColor: 'text-gray-400 dark:text-slate-400', icon: ExclamationTriangleIcon },
    error:     { label: t('scanner.result.actionNeeded'), bg: 'bg-red-50 dark:bg-rose-500/15', textColor: 'text-red-600 dark:text-rose-300', iconColor: 'text-red-500 dark:text-rose-300', icon: XCircleIcon },
  }
  return map[r.result] ?? map.not_found
})

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

const bookId = () => props.result.book_copy?.book_id || props.result.book_copy?.book?.id

// Prefer a translated message for a backend error `code`; fall back to the raw message.
const errorText = (e, fallbackKey) => {
  const data = e.response?.data
  if (data?.code && te(`scanner.errors.${data.code}`)) return t(`scanner.errors.${data.code}`)
  return data?.message || t(fallbackKey)
}

const handleBorrowSubmit = async () => {
  if (!selectedMember.value || !borrowMode.value || isSubmitting.value || actionSuccess.value) return
  actionError.value = ''
  actionSuccess.value = ''
  isSubmitting.value = true

  try {
    if (borrowMode.value === 'reserve') {
      await scannerService.reserveBook({
        book_id: bookId(),
        member_id: selectedMember.value.id,
      })
      actionSuccess.value = t('scanner.result.reservedMsg')
    } else {
      // 'assign' borrows the scanned copy. 'borrowOther' omits book_copy_id because the
      // scanned copy is checked out; the API picks any free copy of the book itself.
      const payload = { book_id: bookId(), member_id: selectedMember.value.id }
      if (borrowMode.value === 'assign') payload.book_copy_id = props.result.book_copy?.id
      await scannerService.confirmBorrow(payload)
      actionSuccess.value = t('scanner.result.borrowConfirmedMsg')
    }
    emit('completed')
  } catch (e) {
    actionError.value = errorText(
      e,
      borrowMode.value === 'reserve' ? 'scanner.result.reserveFailed' : 'scanner.result.confirmBorrowFailed',
    )
  } finally {
    isSubmitting.value = false
  }
}

const handleConfirmReturn = async () => {
  if (isSubmitting.value || actionSuccess.value) return
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
    actionError.value = errorText(e, 'scanner.result.confirmReturnFailed')
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
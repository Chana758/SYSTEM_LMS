<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Member -->
    <div ref="memberRoot" class="relative space-y-1.5">
      <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">{{ $t('reservation.form.member') }}</label>
      <div class="relative">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">👤</span>
        <input
          v-model="member.query.value"
          type="text"
          :placeholder="$t('reservation.form.memberPlaceholder')"
          :class="inputCls"
          @input="member.onInput"
          @focus="member.open.value = true"
        />
      </div>

      <p v-if="member.selected.value" class="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl p-2.5 mt-2 inline-flex items-center gap-1.5 shadow-2xs w-full">
        <span class="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
        <span class="min-w-0 truncate">
          {{ member.selected.value.user?.name }}
          <span class="text-slate-500 dark:text-slate-400 font-bold">({{ member.selected.value.membership_no }})</span>
        </span>
      </p>

      <div v-if="member.open.value && member.results.value.length" :class="dropdownCls">
        <button
          v-for="m in member.results.value" :key="m.id" type="button"
          @click="member.select(m, (x) => x.user?.name || '')"
          class="block w-full text-left px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 hover:bg-emerald-50/70 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {{ m.user?.name }} <span class="text-slate-400 dark:text-slate-500 font-semibold">({{ m.membership_no }})</span>
        </button>
      </div>
      <p v-if="errors.member_id" :class="errCls">{{ errors.member_id[0] }}</p>
    </div>

    <!-- Book -->
    <div ref="bookRoot" class="relative space-y-1.5">
      <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">{{ $t('reservation.form.book') }}</label>
      <div class="relative">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">📖</span>
        <input
          v-model="book.query.value"
          type="text"
          :placeholder="$t('reservation.form.bookPlaceholder')"
          :class="inputCls"
          @input="book.onInput"
          @focus="book.open.value = true"
        />
      </div>

      <!-- Same rule + same three-state hint as the member modal -->
      <p
        v-if="book.selected.value"
        class="text-xs font-extrabold mt-2 p-2.5 rounded-xl border-2 shadow-2xs"
        :class="directBorrowable
          ? 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-400/25'
          : 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-400/25'"
      >
        <span class="inline-flex items-center gap-1.5">
          <span class="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
          {{ book.selected.value.title }}
        </span>
        <span class="block font-bold text-[11px] mt-1">
          <template v-if="directBorrowable">{{ $t('reservation.form.availableNowHint') }}</template>
          <template v-else-if="queueCountOf(book.selected.value) > 0">
            {{ $t('reservation.hint.queue', { count: queueCountOf(book.selected.value), priority: queueCountOf(book.selected.value) + 1 }) }}
          </template>
          <template v-else>{{ $t('reservation.hint.outOfStock') }}</template>
        </span>
      </p>

      <div v-if="book.open.value && book.results.value.length" :class="dropdownCls">
        <button
          v-for="b in book.results.value" :key="b.id" type="button"
          @click="book.select(b, (x) => x.title)"
          class="flex items-center justify-between gap-2 w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-emerald-50/70 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span class="text-slate-900 dark:text-slate-100 truncate">{{ b.title }} <span class="text-slate-400 dark:text-slate-500 font-semibold">— {{ b.author }}</span></span>
          <span
            class="text-[10px] font-black px-2 py-0.5 rounded-lg border flex-shrink-0"
            :class="canBorrowDirectly(b)
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-400/25'
              : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/15 dark:border-amber-400/25'"
          >
            {{ b.available_qty }}/{{ b.total_qty }}
            <template v-if="queueCountOf(b) > 0"> ({{ $t('reservation.hint.queueShort', { count: queueCountOf(b) }) }})</template>
          </span>
        </button>
      </div>
      <p v-if="errors.book_id" :class="errCls">{{ errors.book_id[0] }}</p>
    </div>

    <p v-if="errors.general" :class="errCls">{{ errors.general }}</p>

    <button
      type="submit"
      :disabled="!member.selected.value || !book.selected.value || directBorrowable || loading"
      class="w-full bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer"
    >
      {{ loading ? $t('reservation.form.reserving') : $t('reservation.form.reserveBook') }}
    </button>
  </form>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import apiClient from '@/api/axios'
import { canBorrowDirectly, queueCountOf } from '../../../utils/reservationRules'

defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit'])

// ---- shared light/dark classes ----
const inputCls = 'w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-600 dark:focus:border-emerald-400 focus:outline-hidden transition-colors shadow-2xs'
const dropdownCls = 'absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-white/15 rounded-xl shadow-lg dark:shadow-black/50 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-white/10'
const errCls = 'text-xs font-extrabold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-400/25 rounded-xl p-2.5 mt-2 shadow-2xs'

// One small factory instead of two copy-pasted search blocks.
// Debounced, ignores out-of-order responses, never throws.
function useRemoteSearch(url) {
  const query = ref('')
  const results = ref([])
  const selected = ref(null)
  const open = ref(false)
  let timer = null
  let seq = 0

  async function run() {
    const q = query.value.trim()
    const id = ++seq
    if (!q) { results.value = []; return }
    try {
      const { data } = await apiClient.get(url, { params: { search: q, per_page: 5 } })
      if (id !== seq) return
      results.value = data.data ?? data
      open.value = true
    } catch {
      if (id === seq) results.value = []
    }
  }

  const onInput = () => {
    selected.value = null
    clearTimeout(timer)
    timer = setTimeout(run, 350)
  }

  const select = (item, labelOf) => {
    seq++ // drop any in-flight response
    selected.value = item
    query.value = labelOf(item)
    open.value = false
  }

  return { query, results, selected, open, onInput, select, dispose: () => clearTimeout(timer) }
}

const member = useRemoteSearch('/members')
const book = useRemoteSearch('/books')

const directBorrowable = computed(() => canBorrowDirectly(book.selected.value))

// ---- close dropdowns when clicking outside ----
const memberRoot = ref(null)
const bookRoot = ref(null)
const onDocMouseDown = (e) => {
  if (memberRoot.value && !memberRoot.value.contains(e.target)) member.open.value = false
  if (bookRoot.value && !bookRoot.value.contains(e.target)) book.open.value = false
}
onMounted(() => document.addEventListener('mousedown', onDocMouseDown))
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown)
  member.dispose()
  book.dispose()
})

function handleSubmit() {
  if (!member.selected.value || !book.selected.value || directBorrowable.value) return
  emit('submit', {
    member_id: member.selected.value.id,
    book_id: book.selected.value.id,
  })
}
</script>
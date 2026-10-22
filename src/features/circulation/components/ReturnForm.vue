<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-white/10 p-5 sm:p-8 w-full max-w-md max-h-[90dvh] overflow-y-auto shadow-2xl space-y-4">
      <!-- Modal Header -->
      <div class="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
        <div class="min-w-0">
          <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ $t('circulation.returnBook') }}</h2>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 break-words">{{ borrow.book_copy?.book?.title }} — {{ borrow.member?.user?.name }}</p>
        </div>
        <button type="button" @click="$emit('cancel')" class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold cursor-pointer p-1 -m-1 flex-shrink-0">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Condition Select -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{{ $t('circulation.bookCondition') }}</label>
          <select
            v-model="form.condition"
            class="w-full border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600 transition cursor-pointer dark:[color-scheme:dark]"
          >
            <option value="good" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.conditionGood') }}</option>
            <option value="damaged" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.conditionDamaged') }}</option>
            <option value="lost" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('circulation.conditionLost') }}</option>
          </select>
        </div>

        <!-- Damage Fee -->
        <div v-if="form.condition === 'damaged'">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{{ $t('circulation.damageFee') }}</label>
          <input
            v-model.number="form.damage_fee"
            type="number" min="0" step="100"
            class="w-full border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono outline-none focus:border-emerald-600 transition"
            placeholder="5000"
          />
          <!-- Display-only USD preview — purely informational, never sent
               to the backend. Helps the librarian sanity-check the Riel
               amount before submitting (this is exactly the kind of
               "wait, that's way too high" signal that was missing when
               the $5000/$15000 fines got created in the first place). -->
          <p class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">≈ {{ formatUsd(khrToUsd(form.damage_fee)) }}</p>
        </div>

        <!-- Lost Fee -->
        <div v-if="form.condition === 'lost'">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{{ $t('circulation.lostFee') }}</label>
          <input
            v-model.number="form.lost_fee"
            type="number" min="0" step="100"
            class="w-full border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono outline-none focus:border-emerald-600 transition"
            placeholder="15000"
          />
          <p class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">≈ {{ formatUsd(khrToUsd(form.lost_fee)) }}</p>
        </div>

        <!-- Notes (Optional) -->
        <div v-if="form.condition !== 'good'">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{{ $t('circulation.notesOptional') }}</label>
          <textarea
            v-model="form.notes"
            rows="2"
            class="w-full border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-600 transition"
            :placeholder="$t('circulation.notesPlaceholder')"
          ></textarea>
        </div>

        <!-- Overdue Warning -->
        <div v-if="isOverdue" class="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-300">
          ⚠️ {{ $t('circulation.overdueWarning', { days: daysLate }) }}
        </div>

        <!-- Error Message -->
        <p v-if="errorMessage" class="text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5">
          {{ errorMessage }}
        </p>

        <!-- Actions Buttons -->
        <div class="flex gap-2 pt-2 border-t border-slate-200 dark:border-white/10 mt-4">
          <button
            type="button"
            @click="$emit('cancel')"
            class="flex-1 border border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
          >
            {{ $t('common.actions.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer shadow-md"
          >
            {{ loading ? $t('circulation.processing') : $t('circulation.confirmReturn') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
// NOTE: khrToUsd/formatUsd are used ONLY for the on-screen "≈ $x.xx"
// preview text below the Riel inputs — they are display-only helpers now.
// They are NOT applied to the payload anymore (see handleSubmit below).
import { khrToUsd, formatUsd } from '@/utils/currencyHelper'

const props = defineProps({
  borrow: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  condition: 'good',
  damage_fee: 5000,   // Riel — matches the "(៛)" label on the input above
  lost_fee: 15000,
  notes: '',
})

const isOverdue = computed(() => new Date(props.borrow.due_date) < new Date())
const daysLate = computed(() => {
  const diff = Math.floor((new Date() - new Date(props.borrow.due_date)) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

function handleSubmit() {
  const payload = { condition: form.condition, notes: form.notes || undefined }

  if (form.condition === 'damaged') {
    payload.damage_fee = form.damage_fee
  }
  if (form.condition === 'lost') {
    payload.lost_fee = form.lost_fee
  }

  emit('submit', payload)
}
</script>
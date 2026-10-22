<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div v-if="!isEdit">
      <label :class="labelClass">{{ t('fines.form.borrowTransactionId') }}</label>
      <input v-model.number="form.borrow_id" type="number" :class="[inputClass, displayErrors.borrow_id ? errorBorder : '']" />
      <p v-if="displayErrors.borrow_id" class="text-red-500 dark:text-rose-400 text-xs mt-1">{{ firstError(displayErrors.borrow_id) }}</p>
    </div>

    <!-- EDIT mode: borrow_id can't be changed once a fine exists (see
         FineController::update()) — shown read-only for context instead
         of an editable field. -->
    <div v-else>
      <label :class="labelClass">{{ t('fines.form.borrowTransactionId') }}</label>
      <input :value="initialData.borrow_id ?? initialData.borrow?.id" type="text" disabled
        class="w-full border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-not-allowed" />
      <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">A fine's borrow record can't be changed after it's created.</p>
    </div>

    <div>
      <label :class="labelClass">
        {{ isEdit ? t('fines.form.amountUsd') : t('fines.form.amountKhr') }}
      </label>
      <input
        v-model.number="form.amount"
        type="number"
        :step="isEdit ? 0.01 : 100"
        :min="isEdit ? 0.01 : 100"
        :placeholder="isEdit ? '0.00' : 'e.g. 4000'"
        :class="[inputClass, displayErrors.amount ? errorBorder : '']"
      />
      <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">
        {{ isEdit ? t('fines.form.amountUsdHint') : t('fines.form.amountKhrHint') }}
      </p>
      <p v-if="displayErrors.amount" class="text-red-500 dark:text-rose-400 text-xs mt-1">{{ firstError(displayErrors.amount) }}</p>
    </div>

    <div>
      <label :class="labelClass">{{ t('fines.form.reason') }}</label>
      <select v-model="form.reason" :class="[inputClass, 'dark:[color-scheme:dark]']">
        <option value="overdue">{{ t('fines.reasonOverdue') }}</option>
        <option value="damaged">{{ t('fines.reasonDamaged') }}</option>
        <option value="lost">{{ t('fines.reasonLost') }}</option>
        <option value="other">{{ t('fines.reasonOther') }}</option>
      </select>
    </div>
    <div>
      <label :class="labelClass">{{ t('fines.form.notes') }}</label>
      <textarea v-model="form.notes" rows="3" :class="inputClass"></textarea>
    </div>
    <p v-if="displayErrors.general" class="text-red-500 dark:text-rose-400 text-sm">{{ firstError(displayErrors.general) }}</p>

    <!-- Buttons: stacked + full width on phones (Save on top), inline from sm -->
    <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
      <button type="button" @click="$emit('cancel')" class="w-full sm:w-auto px-4 py-3 sm:py-2 border border-slate-300 dark:border-white/15 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{{ t('fines.cancel') }}</button>
      <button type="submit" :disabled="loading" class="w-full sm:w-auto px-4 py-3 sm:py-2 bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 transition-colors">
        {{ loading ? t('fines.form.saving') : (isEdit ? t('fines.form.saveChanges') : t('fines.form.createFine')) }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { validateFineForm } from '../validations/fineValidation'

const { t } = useI18n()

// Full class names so Tailwind can generate them.
// Phones: text-base (16px) so iOS Safari does not zoom in on focus.
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'
const inputClass = 'w-full border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors'
const errorBorder = '!border-red-500 dark:!border-rose-400'

const props = defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
  // presence of initialData switches the form into Edit mode:
  // borrow_id becomes read-only, amount switches from Riel to USD.
  initialData: { type: Object, default: null },
})
const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => !!props.initialData)

const form = reactive(
  isEdit.value
    ? {
        borrow_id: props.initialData.borrow_id ?? props.initialData.borrow?.id ?? null,
        // Already a USD value from creation time — edited directly, not
        // re-converted. See FineController::update().
        amount: props.initialData.amount != null ? Number(props.initialData.amount) : null,
        reason: props.initialData.reason || 'overdue',
        notes: props.initialData.notes || '',
      }
    : { borrow_id: null, amount: null, reason: 'overdue', notes: '' }
)

// Client-side validation errors (from validateFineForm), separate from
// server-side `props.errors` so a fresh submit attempt doesn't show
// stale server errors alongside new client errors for the same field.
const clientErrors = reactive({})
const displayErrors = computed(() => ({ ...clientErrors, ...props.errors }))

function firstError(e) {
  return Array.isArray(e) ? e[0] : e
}

function handleSubmit() {
  Object.keys(clientErrors).forEach((k) => delete clientErrors[k])

  const validation = validateFineForm(form, { unit: isEdit.value ? 'usd' : 'khr' })
  if (Object.keys(validation).length) {
    Object.assign(clientErrors, validation)
    return
  }

  // borrow_id is read-only in edit mode and not accepted by
  // FineController::update() — omit it from the payload so an
  // unexpected extra field never reaches that endpoint.
  const payload = isEdit.value
    ? { amount: form.amount, reason: form.reason, notes: form.notes }
    : { ...form }

  emit('submit', payload)
}
</script>
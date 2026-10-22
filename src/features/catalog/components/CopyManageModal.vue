<template>
  <BaseModal :model-value="modelValue" :title="t('catalog.copy.manageTitle')" :subtitle="copy?.barcode" size="md" @update:model-value="$emit('update:modelValue', $event)">
    <div v-if="copy" class="space-y-4">
      <p v-if="isBorrowed" class="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/20 rounded-xl px-4 py-3">
        {{ t('catalog.copy.borrowedLocked') }}
      </p>

      <div>
        <label :for="id('status')" class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">{{ t('catalog.copy.status') }}</label>
        <select :id="id('status')" v-model="form.status" :disabled="isBorrowed" :class="[inputCls, 'dark:[color-scheme:dark] disabled:bg-slate-100 dark:disabled:bg-slate-800 dark:disabled:text-slate-500']">
          <option v-for="s in statuses" :key="s" :value="s">{{ t(`catalog.copy.status_${s}`) }}</option>
        </select>
      </div>

      <div>
        <label :for="id('shelf')" class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">{{ t('catalog.copy.shelfLocation') }}</label>
        <input :id="id('shelf')" v-model="form.shelf_location" type="text" :class="inputCls" />
      </div>

      <div>
        <label :for="id('reason')" class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">{{ t('catalog.copy.reason') }}</label>
        <input :id="id('reason')" v-model="form.reason" type="text" :placeholder="t('catalog.copy.reasonPlaceholder')" :class="inputCls" />
      </div>

      <p v-if="error" class="text-xs font-bold text-rose-600 dark:text-rose-400">{{ error }}</p>

      <!-- Phones: save/cancel stacked full width, withdraw as its own bordered button. sm+: original single row. -->
      <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <button
          type="button"
          :disabled="isBorrowed || busy"
          class="w-full sm:w-auto py-3 sm:py-0 rounded-xl sm:rounded-none border border-rose-200 dark:border-rose-400/30 sm:border-0 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-40 cursor-pointer"
          @click="remove"
        >
          {{ t('catalog.copy.withdraw') }}
        </button>
        <div class="flex flex-col-reverse sm:flex-row gap-2">
          <button type="button" class="w-full sm:w-auto px-4 py-3 sm:py-2 border border-slate-300 dark:border-white/15 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" @click="$emit('update:modelValue', false)">
            {{ t('catalog.common.cancel') }}
          </button>
          <button type="button" :disabled="busy" class="w-full sm:w-auto px-4 py-3 sm:py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer" @click="save">
            {{ busy ? t('catalog.common.saving') : t('catalog.common.saveChanges') }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import BaseModal from '@/components/common/BaseModal.vue'
import { useCatalogStore } from '../store/catalogStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  copy: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'changed'])

const { t } = useI18n()
const toast = useToast()
const store = useCatalogStore()

const uid = 'cm-' + Math.random().toString(36).slice(2, 8)
const id = (name) => `${uid}-${name}`

// Phones: text-base (16px) so iOS Safari does not zoom on focus, taller fields for thumbs.
const inputCls = 'w-full border border-slate-300 dark:border-white/15 rounded-xl px-3 py-3 sm:py-2 text-base sm:text-sm bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500'

const statuses = ['available', 'damaged', 'lost', 'archived']
const form = reactive({ status: 'available', shelf_location: '', reason: '' })
const busy = ref(false)
const error = ref('')

const isBorrowed = computed(() => props.copy?.status === 'borrowed')

watch(() => [props.modelValue, props.copy], () => {
  if (!props.copy) return
  form.status = props.copy.status
  form.shelf_location = props.copy.shelf_location || ''
  form.reason = ''
  error.value = ''
}, { immediate: true })

async function save() {
  busy.value = true
  error.value = ''
  const payload = { shelf_location: form.shelf_location || null, reason: form.reason || null }
  if (!isBorrowed.value) payload.status = form.status

  const result = await store.updateCopy(props.copy.id, payload)
  busy.value = false
  if (result.success) {
    toast.success(result.message)
    emit('update:modelValue', false)
    emit('changed')
  } else {
    error.value = result.message
  }
}

async function remove() {
  if (!window.confirm(t('catalog.copy.confirmWithdraw', { barcode: props.copy.barcode }))) return
  busy.value = true
  const result = await store.deleteCopy(props.copy.id)
  busy.value = false
  if (result.success) {
    toast.success(result.message)
    emit('update:modelValue', false)
    emit('changed')
  } else {
    error.value = result.message
  }
}
</script>
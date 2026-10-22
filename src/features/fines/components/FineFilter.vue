<template>
  <!-- Phones: search on its own row, the two selects side by side. sm and up: one row. -->
  <div class="grid grid-cols-2 sm:flex sm:flex-row gap-3 mb-4">
    <input
      v-model="localFilters.search"
      @input="emitChange"
      type="text"
      :placeholder="t('fines.searchMemberName')"
      class="col-span-2 sm:flex-1 min-w-0 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors"
    />
    <select
      v-model="localFilters.status"
      @change="emitChange"
      class="min-w-0 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-400 dark:[color-scheme:dark] transition-colors"
    >
      <option value="">{{ t('fines.allStatuses') }}</option>
      <option value="unpaid">{{ t('fines.unpaid') }}</option>
      <option value="paid">{{ t('fines.paid') }}</option>
      <option value="waived">{{ t('fines.waived') }}</option>
    </select>
    <select
      v-model="localFilters.reason"
      @change="emitChange"
      class="min-w-0 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-400 dark:[color-scheme:dark] transition-colors"
    >
      <option value="">{{ t('fines.allReasons') }}</option>
      <option value="overdue">{{ t('fines.reasonOverdue') }}</option>
      <option value="damaged">{{ t('fines.reasonDamaged') }}</option>
      <option value="lost">{{ t('fines.reasonLost') }}</option>
      <option value="other">{{ t('fines.reasonOther') }}</option>
    </select>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue', 'change'])

const localFilters = reactive({ ...props.modelValue })

watch(() => props.modelValue, (v) => Object.assign(localFilters, v))

let timeout = null
function emitChange() {
  emit('update:modelValue', { ...localFilters })
  clearTimeout(timeout)
  timeout = setTimeout(() => emit('change'), 350)
}
</script>
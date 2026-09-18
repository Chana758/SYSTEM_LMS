<template>
  <div class="flex gap-3 mb-4">
    <input v-model="localFilters.search" @input="emitChange" type="text" :placeholder="t('fines.searchMemberName')" class="flex-1 border rounded-lg px-3 py-2 text-sm" />
    <select v-model="localFilters.status" @change="emitChange" class="border rounded-lg px-3 py-2 text-sm">
      <option value="">{{ t('fines.allStatuses') }}</option>
      <option value="unpaid">{{ t('fines.unpaid') }}</option>
      <option value="paid">{{ t('fines.paid') }}</option>
      <option value="waived">{{ t('fines.waived') }}</option>
    </select>
    <select v-model="localFilters.reason" @change="emitChange" class="border rounded-lg px-3 py-2 text-sm">
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
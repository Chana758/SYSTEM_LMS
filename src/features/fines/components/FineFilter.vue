<template>
  <div class="flex gap-3 mb-4">
    <input v-model="localFilters.search" @input="emitChange" type="text" placeholder="Search member name..." class="flex-1 border rounded-lg px-3 py-2 text-sm" />
    <select v-model="localFilters.status" @change="emitChange" class="border rounded-lg px-3 py-2 text-sm">
      <option value="">All Statuses</option>
      <option value="unpaid">Unpaid</option>
      <option value="paid">Paid</option>
      <option value="waived">Waived</option>
    </select>
    <select v-model="localFilters.reason" @change="emitChange" class="border rounded-lg px-3 py-2 text-sm">
      <option value="">All Reasons</option>
      <option value="overdue">Overdue</option>
      <option value="damaged">Damaged</option>
      <option value="lost">Lost</option>
      <option value="other">Other</option>
    </select>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

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
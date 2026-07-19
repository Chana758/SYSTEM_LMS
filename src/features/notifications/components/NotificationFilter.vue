<template>
  <div class="flex flex-wrap items-center gap-2 mb-5">
    <button
      v-for="opt in typeOptions" :key="opt.value"
      @click="update('type', opt.value)"
      class="px-3 py-1.5 rounded-full text-xs font-medium border transition"
      :class="modelValue.type === opt.value ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
    >
      {{ opt.label }}
    </button>

    <div class="flex-1"></div>

    <select :value="modelValue.is_read" @change="update('is_read', $event.target.value)" class="border rounded-lg px-3 py-1.5 text-xs">
      <option value="">All</option>
      <option value="false">Unread</option>
      <option value="true">Read</option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({ type: '', is_read: '' }) },
})
const emit = defineEmits(['update:modelValue', 'change'])

const typeOptions = [
  { value: '', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'reservation', label: 'Reservation' },
  { value: 'fine', label: 'Fine' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'system', label: 'System' },
]

function update(key, value) {
  const next = { ...props.modelValue, [key]: value }
  emit('update:modelValue', next)
  emit('change', next)
}
</script>
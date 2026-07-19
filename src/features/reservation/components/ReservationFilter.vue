<template>
  <div class="flex gap-3 mb-5">
    <div class="relative flex-1">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔍</span>
      <input
        :value="modelValue.search"
        @input="update('search', $event.target.value)"
        type="text"
        placeholder="Search member or book title…"
        class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
      />
    </div>
    <select
      :value="modelValue.status"
      @change="update('status', $event.target.value)"
      class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
    >
      <option value="">All Statuses</option>
      <option value="pending">Pending</option>
      <option value="ready">Ready</option>
      <option value="fulfilled">Fulfilled</option>
      <option value="cancelled">Cancelled</option>
      <option value="expired">Expired</option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({ search: '', status: '' }) },
})
const emit = defineEmits(['update:modelValue', 'change'])

function update(key, value) {
  const next = { ...props.modelValue, [key]: value }
  emit('update:modelValue', next)
  emit('change', next)
}
</script>
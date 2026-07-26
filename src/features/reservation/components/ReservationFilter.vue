<template>
  <div class="flex flex-col sm:flex-row gap-3 mb-6">
    <!-- Search Input -->
    <div class="relative flex-1">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
      <input
        :value="modelValue.search"
        @input="update('search', $event.target.value)"
        type="text"
        placeholder="Search member or book title…"
        class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors shadow-2xs"
      />
    </div>

    <!-- Status Select Dropdown -->
    <select
      :value="modelValue.status"
      @change="update('status', $event.target.value)"
      class="bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-700 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors shadow-2xs cursor-pointer"
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
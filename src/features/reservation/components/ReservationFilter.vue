<template>
  <div class="flex flex-col sm:flex-row gap-3 mb-6">
    <!-- Search Input -->
    <div class="relative flex-1">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">🔍</span>
      <input
        :value="modelValue.search"
        @input="update('search', $event.target.value)"
        type="text"
        :placeholder="$t('reservation.searchPlaceholder')"
        class="w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-600 dark:focus:border-emerald-400 focus:outline-hidden transition-colors shadow-2xs"
      />
    </div>

    <!-- Status Select Dropdown -->
    <select
      :value="modelValue.status"
      @change="update('status', $event.target.value)"
      class="bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-100 dark:[color-scheme:dark] focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-600 dark:focus:border-emerald-400 focus:outline-hidden transition-colors shadow-2xs cursor-pointer"
    >
      <option value="">{{ $t('reservation.allStatuses') }}</option>
      <option value="pending">{{ $t('reservation.statusPending') }}</option>
      <option value="ready">{{ $t('reservation.statusReady') }}</option>
      <option value="fulfilled">{{ $t('reservation.statusFulfilled') }}</option>
      <option value="cancelled">{{ $t('reservation.statusCancelled') }}</option>
      <option value="expired">{{ $t('reservation.statusExpired') }}</option>
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
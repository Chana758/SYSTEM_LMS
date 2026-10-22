<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none overflow-x-auto">
    <div v-if="loading" class="p-16 text-center text-gray-400 dark:text-slate-500 font-bold text-sm uppercase tracking-widest animate-pulse">
      {{ t('reports.table.loading') }}
    </div>
    <div v-else-if="!rows.length" class="p-16 text-center text-gray-400 dark:text-slate-500 font-bold text-sm uppercase tracking-widest">
      {{ t('reports.table.noRecordsFound') }}
    </div>
    <table v-else class="w-full min-w-[700px]">
      <thead class="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-100 dark:border-white/10">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 whitespace-nowrap"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50 dark:divide-white/5">
        <tr v-for="(row, i) in rows" :key="row.id ?? i" class="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
          <td v-for="col in columns" :key="col.key" class="px-5 py-4 text-sm text-gray-600 dark:text-slate-300 font-medium whitespace-nowrap">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ resolve(row, col.key) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination: Prev / windowed pages / Next (never renders 50 buttons) -->
    <div
      v-if="pagination && pagination.last_page > 1"
      class="flex items-center justify-center flex-wrap gap-1.5 py-4 px-3 border-t border-gray-50 dark:border-white/10"
    >
      <button
        type="button"
        :disabled="pagination.current_page <= 1"
        @click="go(pagination.current_page - 1)"
        class="h-8 px-3 rounded-lg text-sm font-bold transition bg-gray-50 dark:bg-slate-900/60 text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >‹</button>

      <template v-for="(p, i) in pageList" :key="`${p}-${i}`">
        <span v-if="p === '…'" class="w-6 text-center text-gray-400 dark:text-slate-500 select-none">…</span>
        <button
          v-else
          type="button"
          @click="go(p)"
          class="min-w-8 h-8 px-2 rounded-lg text-sm font-medium transition"
          :class="p === pagination.current_page
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-50 dark:bg-slate-900/60 text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'"
        >{{ p }}</button>
      </template>

      <button
        type="button"
        :disabled="pagination.current_page >= pagination.last_page"
        @click="go(pagination.current_page + 1)"
        class="h-8 px-3 rounded-lg text-sm font-bold transition bg-gray-50 dark:bg-slate-900/60 text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >›</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  columns: { type: Array, required: true },   // [{ key: 'name', label: 'Name' }] — label is already translated by the caller
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: null }, // { current_page, last_page }
})

const emit = defineEmits(['page-change'])

const go = (page) => {
  if (!props.pagination) return
  if (page < 1 || page > props.pagination.last_page || page === props.pagination.current_page) return
  emit('page-change', page)
}

// 1 … 4 5 [6] 7 8 … 50
const pageList = computed(() => {
  if (!props.pagination) return []
  const { current_page: cur, last_page: last } = props.pagination
  const list = []
  for (let p = 1; p <= last; p++) {
    if (p === 1 || p === last || Math.abs(p - cur) <= 1) list.push(p)
    else if (list[list.length - 1] !== '…') list.push('…')
  }
  return list
})

// resolves dotted paths like "user.name" against a row object
const resolve = (row, path) => {
  const value = path.split('.').reduce((acc, key) => acc?.[key], row)
  return value ?? '—'
}
</script>
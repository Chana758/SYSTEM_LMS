<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
    <div v-if="loading" class="p-16 text-center text-gray-400 font-bold text-sm uppercase tracking-widest animate-pulse">
      Loading…
    </div>
    <div v-else-if="!rows.length" class="p-16 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">
      No records found
    </div>
    <table v-else class="w-full min-w-[700px]">
      <thead class="bg-gray-50 border-b border-gray-100">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="(row, i) in rows" :key="row.id ?? i" class="hover:bg-gray-50/60 transition-colors">
          <td v-for="col in columns" :key="col.key" class="px-5 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ resolve(row, col.key) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="pagination && pagination.last_page > 1" class="flex justify-center gap-1.5 py-4 border-t border-gray-50">
      <button
        v-for="page in pagination.last_page"
        :key="page"
        @click="$emit('page-change', page)"
        class="w-8 h-8 rounded-lg text-sm font-medium transition"
        :class="page === pagination.current_page ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },   // [{ key: 'name', label: 'Name' }]
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: null }, // { current_page, last_page }
})

defineEmits(['page-change'])

// resolves dotted paths like "user.name" against a row object
const resolve = (row, path) => {
  const value = path.split('.').reduce((acc, key) => acc?.[key], row)
  return value ?? '—'
}
</script>
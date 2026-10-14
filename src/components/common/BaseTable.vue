<template>
  <div class="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th
              v-for="c in columns"
              :key="c.key"
              class="px-4 py-3 font-black uppercase tracking-wider text-slate-500"
              :class="[alignClass(c.align), c.class]"
            >
              {{ c.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-4 py-14 text-center text-slate-400">
              <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              {{ loadingText }}
            </td>
          </tr>

          <tr v-else-if="!rows.length">
            <td :colspan="columns.length" class="px-4 py-14 text-center text-slate-400">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="(row, i) in rows"
              :key="row[rowKey] ?? i"
              class="transition-colors"
              :class="clickable ? 'hover:bg-slate-50 cursor-pointer' : ''"
              @click="clickable && $emit('row-click', row)"
            >
              <td v-for="c in columns" :key="c.key" class="px-4 py-3 text-slate-700" :class="alignClass(c.align)">
                <slot :name="`cell-${c.key}`" :row="row" :index="i">{{ row[c.key] ?? '—' }}</slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <slot name="footer" />
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true }, // [{ key, label, align?, class? }]
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: '...' },
  emptyText: { type: String, default: '—' },
  clickable: { type: Boolean, default: false },
})
defineEmits(['row-click'])

const alignClass = (a) => (a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left')
</script>
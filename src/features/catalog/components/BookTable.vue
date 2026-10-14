<template>
  <BaseTable
    :columns="columns"
    :rows="books"
    :loading="loading"
    :loading-text="t('catalog.loadingBooks')"
    :empty-text="t('catalog.noBooksFound')"
    clickable
    @row-click="(b) => $emit('select', b)"
  >
    <template #cell-cover="{ row }">
      <img v-if="row.cover_image" :src="coverUrl(row.cover_image)" :alt="row.title" loading="lazy" class="w-10 h-14 object-cover rounded-md" />
      <div v-else class="w-10 h-14 rounded-md bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center text-lg">📖</div>
    </template>

    <template #cell-title="{ row }">
      <span class="font-bold text-slate-900">{{ row.title }}</span>
    </template>

    <template #cell-isbn="{ row }">
      <span class="font-mono text-[11px] text-slate-500">{{ row.isbn || '—' }}</span>
    </template>

    <template #cell-category="{ row }">{{ row.category?.name || '—' }}</template>

    <template #cell-copies="{ row }">
      <span class="font-black" :class="row.available_qty > 0 ? 'text-emerald-700' : 'text-rose-600'">{{ row.available_qty }}</span>
      <span class="text-slate-400"> / {{ row.total_qty }}</span>
    </template>

    <template #cell-status="{ row }">
      <span class="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider" :class="badgeClass(row.status)">
        {{ label(row.status) }}
      </span>
    </template>

    <template #cell-actions="{ row }">
      <div class="flex justify-end gap-1" @click.stop>
        <button type="button" class="p-1.5 text-slate-500 hover:text-emerald-700 cursor-pointer" :title="t('catalog.common.edit')" @click="$emit('edit', row)">
          <PencilSquareIcon class="w-5 h-5" />
        </button>
        <button type="button" class="p-1.5 text-slate-500 hover:text-rose-600 cursor-pointer" :title="t('catalog.common.delete')" @click="$emit('delete', row)">
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>
    </template>
  </BaseTable>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseTable from '@/components/common/BaseTable.vue'
import { coverUrl } from '@/utils/coverUrl'
import { useBookStatus } from '../composables/useBookStatus'

const props = defineProps({
  books: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  canManage: { type: Boolean, default: false },
})
defineEmits(['select', 'edit', 'delete'])

const { t } = useI18n()
const { badgeClass, label } = useBookStatus()

const columns = computed(() => {
  const cols = [
    { key: 'cover', label: '', class: 'w-16' },
    { key: 'title', label: t('catalog.table.title') },
    { key: 'author', label: t('catalog.table.author') },
    { key: 'isbn', label: t('catalog.table.isbn') },
    { key: 'category', label: t('catalog.table.category') },
    { key: 'copies', label: t('catalog.table.copies'), align: 'center' },
    { key: 'status', label: t('catalog.table.status') },
  ]
  if (props.canManage) cols.push({ key: 'actions', label: t('catalog.table.actions'), align: 'right' })
  return cols
})
</script>
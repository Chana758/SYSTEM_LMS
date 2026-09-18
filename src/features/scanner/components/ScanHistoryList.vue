<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
          <th class="pb-3 font-semibold">{{ t('scanner.list.colBarcode') }}</th>
          <th class="pb-3 font-semibold">{{ t('scanner.list.colBook') }}</th>
          <th class="pb-3 font-semibold">{{ t('scanner.list.colScannedBy') }}</th>
          <th class="pb-3 font-semibold">{{ t('scanner.list.colType') }}</th>
          <th class="pb-3 font-semibold">{{ t('scanner.list.colResult') }}</th>
          <th class="pb-3 font-semibold">{{ t('scanner.list.colDevice') }}</th>
          <th class="pb-3 font-semibold">{{ t('scanner.list.colDate') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" class="border-b border-gray-50 hover:bg-gray-50/70 transition">
          <td class="py-3.5 font-mono text-xs text-gray-600">{{ item.barcode_scanned }}</td>
          <td class="py-3.5 text-gray-700 font-medium">{{ item.book_copy?.book?.title || '—' }}</td>
          <td class="py-3.5 text-gray-600">{{ item.user?.name || '—' }}</td>
          <td class="py-3.5">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold" :class="typeClass(item.scan_type)">
              <span class="w-1.5 h-1.5 rounded-full" :class="typeDotClass(item.scan_type)"></span>
              {{ typeLabel(item.scan_type) }}
            </span>
          </td>
          <td class="py-3.5">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" :class="resultClass(item.scan_result)">
              <span class="w-1.5 h-1.5 rounded-full" :class="dotClass(item.scan_result)"></span>
              {{ resultLabel(item.scan_result) }}
            </span>
          </td>
          <td class="py-3.5 text-gray-400 text-xs">{{ item.device || '—' }}</td>
          <td class="py-3.5 text-gray-400 text-xs">{{ formatDate(item.created_at) }}</td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="7" class="py-16 text-center">
            <div class="flex flex-col items-center gap-2 text-gray-400">
              <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-1">
                <ClipboardDocumentListIcon class="w-7 h-7 text-gray-300" />
              </div>
              <p class="text-sm font-medium text-gray-500">{{ t('scanner.list.noHistory') }}</p>
              <p class="text-xs">{{ t('scanner.list.noHistoryHint') }}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  items: { type: Array, default: () => [] },
})

const resultClass = (result) => ({
  success: 'bg-green-100 text-green-700',
  not_found: 'bg-gray-100 text-gray-500',
  error: 'bg-red-100 text-red-700',
}[result] || 'bg-gray-100 text-gray-500')

const dotClass = (result) => ({
  success: 'bg-green-500',
  not_found: 'bg-gray-400',
  error: 'bg-red-500',
}[result] || 'bg-gray-400')

const typeClass = (type) => ({
  borrow: 'bg-green-50 text-green-700',
  return: 'bg-blue-50 text-blue-700',
  lookup: 'bg-purple-50 text-purple-700',
}[type] || 'bg-gray-100 text-gray-600')

const typeDotClass = (type) => ({
  borrow: 'bg-green-500',
  return: 'bg-blue-500',
  lookup: 'bg-purple-500',
}[type] || 'bg-gray-400')

// Raw values (borrow/return/lookup/success/not_found/error) come straight
// from the database and are not localized strings — map each to its
// translation key here, falling back to the raw value if it's ever an
// unrecognized type (defensive, shouldn't normally happen).
const typeLabelMap = computed(() => ({
  borrow: t('scanner.typeBorrow'),
  return: t('scanner.typeReturn'),
  lookup: t('scanner.typeLookup'),
}))
const typeLabel = (type) => typeLabelMap.value[type] || type

const resultLabelMap = computed(() => ({
  success: t('scanner.historyPage.resultSuccess'),
  not_found: t('scanner.historyPage.resultNotFound'),
  error: t('scanner.historyPage.resultError'),
}))
const resultLabel = (result) => resultLabelMap.value[result] || result || '—'

const formatDate = (d) => new Date(d).toLocaleString()
</script>
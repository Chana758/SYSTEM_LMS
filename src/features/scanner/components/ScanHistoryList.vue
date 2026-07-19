<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
          <th class="pb-3 font-semibold">Barcode</th>
          <th class="pb-3 font-semibold">Book</th>
          <th class="pb-3 font-semibold">Scanned By</th>
          <th class="pb-3 font-semibold">Type</th>
          <th class="pb-3 font-semibold">Result</th>
          <th class="pb-3 font-semibold">Device</th>
          <th class="pb-3 font-semibold">Date</th>
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
              {{ item.scan_type }}
            </span>
          </td>
          <td class="py-3.5">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" :class="resultClass(item.scan_result)">
              <span class="w-1.5 h-1.5 rounded-full" :class="dotClass(item.scan_result)"></span>
              {{ item.scan_result || '—' }}
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
              <p class="text-sm font-medium text-gray-500">No scan history yet</p>
              <p class="text-xs">Scans will appear here once staff start using the scanner.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'

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

const formatDate = (d) => new Date(d).toLocaleString()
</script>
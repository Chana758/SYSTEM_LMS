<template>
  <div>
    <!-- Empty state (shared by mobile + desktop) -->
    <div v-if="!items.length" class="py-16 text-center">
      <div class="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-400">
        <div class="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-1">
          <ClipboardDocumentListIcon class="w-7 h-7 text-gray-300 dark:text-slate-500" />
        </div>
        <p class="text-sm font-medium text-gray-500 dark:text-slate-200">{{ t('scanner.list.noHistory') }}</p>
        <p class="text-xs">{{ t('scanner.list.noHistoryHint') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- MOBILE: card list -->
      <ul class="md:hidden space-y-3">
        <li
          v-for="item in items"
          :key="item.id"
          class="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 p-4 space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <p
              class="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug break-words min-w-0"
            >
              {{ item.book_copy?.book?.title || '—' }}
            </p>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0" :class="resultClass(item.scan_result)">
              <span class="w-1.5 h-1.5 rounded-full" :class="dotClass(item.scan_result)"></span>
              {{ resultLabel(item.scan_result) }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
              {{ item.barcode_scanned }}
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold" :class="typeClass(item.scan_type)">
              <span class="w-1.5 h-1.5 rounded-full" :class="typeDotClass(item.scan_type)"></span>
              {{ typeLabel(item.scan_type) }}
            </span>
          </div>

          <div class="flex items-end justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div class="min-w-0">
              <p class="truncate">{{ item.user?.name || '—' }}</p>
              <p class="truncate text-[11px] text-slate-400 dark:text-slate-500 mt-0.5" :title="item.device || ''">{{ formatDevice(item.device) }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="font-semibold text-slate-700 dark:text-slate-200">{{ formatDay(item.created_at) }}</p>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{{ formatTime(item.created_at) }}</p>
            </div>
          </div>
        </li>
      </ul>

      <!--  DESKTOP: table  -->
      <div class="hidden md:block overflow-x-auto -mx-2 px-2">
        <table class="w-full min-w-[860px] text-sm border-separate border-spacing-0">
          <thead>
            <tr class="text-left text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
              <th class="px-4 py-3 font-semibold bg-slate-50 dark:bg-white/5 rounded-l-xl whitespace-nowrap">{{ t('scanner.list.colBarcode') }}</th>
              <th class="px-4 py-3 font-semibold bg-slate-50 dark:bg-white/5 whitespace-nowrap">{{ t('scanner.list.colBook') }}</th>
              <th class="px-4 py-3 font-semibold bg-slate-50 dark:bg-white/5 whitespace-nowrap">{{ t('scanner.list.colScannedBy') }}</th>
              <th class="px-4 py-3 font-semibold bg-slate-50 dark:bg-white/5 whitespace-nowrap">{{ t('scanner.list.colType') }}</th>
              <th class="px-4 py-3 font-semibold bg-slate-50 dark:bg-white/5 whitespace-nowrap">{{ t('scanner.list.colResult') }}</th>
              <th class="px-4 py-3 font-semibold bg-slate-50 dark:bg-white/5 whitespace-nowrap">{{ t('scanner.list.colDevice') }}</th>
              <th class="px-4 py-3 font-semibold bg-slate-50 dark:bg-white/5 rounded-r-xl text-right whitespace-nowrap">{{ t('scanner.list.colDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item.id"
              class="group hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
            >
              <td class="px-4 py-4 border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                <span class="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                  {{ item.barcode_scanned }}
                </span>
              </td>

              <td class="px-4 py-4 border-b border-slate-100 dark:border-white/5 max-w-[260px]">
                <p
                  class="truncate font-semibold text-slate-800 dark:text-slate-100"
                  :title="item.book_copy?.book?.title || ''"
                >
                  {{ item.book_copy?.book?.title || '—' }}
                </p>
              </td>

              <td class="px-4 py-4 border-b border-slate-100 dark:border-white/5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                {{ item.user?.name || '—' }}
              </td>

              <td class="px-4 py-4 border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold" :class="typeClass(item.scan_type)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="typeDotClass(item.scan_type)"></span>
                  {{ typeLabel(item.scan_type) }}
                </span>
              </td>

              <td class="px-4 py-4 border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" :class="resultClass(item.scan_result)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="dotClass(item.scan_result)"></span>
                  {{ resultLabel(item.scan_result) }}
                </span>
              </td>

              <td class="px-4 py-4 border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                <span
                  class="text-xs text-slate-500 dark:text-slate-400 cursor-help"
                  :title="item.device || ''"
                >
                  {{ formatDevice(item.device) }}
                </span>
              </td>

              <td class="px-4 py-4 border-b border-slate-100 dark:border-white/5 whitespace-nowrap text-right">
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ formatDay(item.created_at) }}</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{{ formatTime(item.created_at) }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
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

// Full class names so Tailwind can generate them.
const resultClass = (result) => ({
  success: 'bg-green-100 text-green-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  not_found: 'bg-gray-100 text-gray-500 dark:bg-slate-500/15 dark:text-slate-300',
  error: 'bg-red-100 text-red-700 dark:bg-rose-500/15 dark:text-rose-300',
}[result] || 'bg-gray-100 text-gray-500 dark:bg-slate-500/15 dark:text-slate-300')

const dotClass = (result) => ({
  success: 'bg-green-500 dark:bg-emerald-400',
  not_found: 'bg-gray-400 dark:bg-slate-400',
  error: 'bg-red-500 dark:bg-rose-400',
}[result] || 'bg-gray-400 dark:bg-slate-400')

const typeClass = (type) => ({
  borrow: 'bg-green-50 text-green-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  return: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  lookup: 'bg-purple-50 text-purple-700 dark:bg-violet-500/15 dark:text-violet-300',
}[type] || 'bg-gray-100 text-gray-600 dark:bg-slate-500/15 dark:text-slate-300')

const typeDotClass = (type) => ({
  borrow: 'bg-green-500 dark:bg-emerald-400',
  return: 'bg-blue-500 dark:bg-blue-400',
  lookup: 'bg-purple-500 dark:bg-violet-400',
}[type] || 'bg-gray-400 dark:bg-slate-400')

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

// Turn a long user-agent string into something short like "Chrome 150 · macOS".
const formatDevice = (ua) => {
  if (!ua) return '—'

  let browser = ''
  const match = (re) => ua.match(re)?.[1]?.split('.')[0]
  if (/Edg\//.test(ua)) browser = `Edge ${match(/Edg\/([\d.]+)/)}`
  else if (/OPR\//.test(ua)) browser = `Opera ${match(/OPR\/([\d.]+)/)}`
  else if (/Firefox\//.test(ua)) browser = `Firefox ${match(/Firefox\/([\d.]+)/)}`
  else if (/Chrome\//.test(ua)) browser = `Chrome ${match(/Chrome\/([\d.]+)/)}`
  else if (/Safari\//.test(ua)) browser = `Safari ${match(/Version\/([\d.]+)/) || ''}`.trim()

  let os = ''
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  const label = [browser, os].filter(Boolean).join(' · ')
  // Not a browser user-agent (e.g. a handheld scanner name) → show as-is.
  return label || ua
}

const formatDay = (d) => new Date(d).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
})
const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit', second: '2-digit',
})
</script>
<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 overflow-hidden shadow-2xs">

    <!-- Phone: one card per borrow -->
    <div class="md:hidden">
      <p v-if="items.length === 0" class="text-center py-12 text-xs text-slate-400 dark:text-slate-500 font-semibold">
        {{ $t('common.table.noRecordsFound') }}
      </p>

      <div v-else class="divide-y divide-slate-200 dark:divide-white/5">
        <div
          v-for="item in items"
          :key="item.id"
          class="p-4 space-y-3"
          :class="{ 'bg-rose-50/40 dark:bg-rose-950/20': isOverdue(item) }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-900 dark:text-white leading-snug break-words">{{ item.book_copy?.book?.title || '—' }}</p>
              <p v-if="item.book_copy?.book?.category?.name" class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                {{ item.book_copy.book.category.name }}
              </p>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex-shrink-0"
              :class="statusClass(item)"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(item)"></span>
              {{ statusLabel(item) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div v-if="role !== 'member'" class="col-span-2">
              <p :class="lbl">{{ $t('circulation.member') }}</p>
              <p class="font-bold text-slate-800 dark:text-slate-200">{{ item.member?.user?.name || '—' }}</p>
            </div>
            <div>
              <p :class="lbl">{{ $t('circulation.borrowed') }}</p>
              <p class="font-semibold text-slate-700 dark:text-slate-300">{{ formatDate(item.borrow_date) }}</p>
            </div>
            <div>
              <p :class="lbl">{{ $t('circulation.dueDate') }}</p>
              <p :class="isOverdue(item) ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-semibold'">{{ formatDate(item.due_date) }}</p>
            </div>
            <div>
              <p :class="lbl">{{ $t('circulation.renewals') }}</p>
              <p class="font-bold text-slate-800 dark:text-slate-200">{{ item.renewed_count }} <span class="text-slate-400 dark:text-slate-600">/ 2</span></p>
            </div>
            <div v-if="role !== 'member'">
              <p :class="lbl">{{ $t('circulation.librarian') }}</p>
              <p class="font-semibold text-slate-700 dark:text-slate-300">{{ item.librarian?.user?.name || '—' }}</p>
            </div>
          </div>

          <div v-if="canRenew(item) || canReturn(item)" class="flex gap-2 pt-1">
            <button
              v-if="canRenew(item)"
              @click="$emit('renew', item)"
              class="flex-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 rounded-xl py-2.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
            >
              {{ $t('circulation.renew') }}
            </button>
            <button
              v-if="canReturn(item)"
              @click="$emit('return', item)"
              class="flex-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 rounded-xl py-2.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              {{ $t('circulation.return') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tablet/desktop: table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-300 dark:border-white/10">
          <tr>
            <th class="px-5 py-3.5">{{ $t('circulation.book') }}</th>
            <th v-if="role !== 'member'" class="px-5 py-3.5">{{ $t('circulation.member') }}</th>
            <th class="px-5 py-3.5">{{ $t('circulation.borrowed') }}</th>
            <th class="px-5 py-3.5">{{ $t('circulation.dueDate') }}</th>
            <th class="px-5 py-3.5">{{ $t('common.table.status') }}</th>
            <th class="px-5 py-3.5">{{ $t('circulation.renewals') }}</th>
            <th v-if="role !== 'member'" class="px-5 py-3.5">{{ $t('circulation.librarian') }}</th>
            <th class="px-5 py-3.5 text-right">{{ $t('common.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <tr v-if="items.length === 0">
            <td :colspan="role === 'member' ? 6 : 8" class="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">
              {{ $t('common.table.noRecordsFound') }}
            </td>
          </tr>

          <tr
            v-for="item in items"
            :key="item.id"
            class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
            :class="{ 'bg-rose-50/40 dark:bg-rose-950/20': isOverdue(item) }"
          >
            <!-- Book title and category -->
            <td class="px-5 py-4">
              <p class="font-bold text-slate-900 dark:text-white leading-snug">{{ item.book_copy?.book?.title || '—' }}</p>
              <p v-if="item.book_copy?.book?.category?.name" class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                {{ item.book_copy.book.category.name }}
              </p>
            </td>

            <!-- Member -->
            <td v-if="role !== 'member'" class="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
              {{ item.member?.user?.name || '—' }}
            </td>

            <!-- Borrow date -->
            <td class="px-5 py-4 text-slate-600 dark:text-slate-400 font-medium">
              {{ formatDate(item.borrow_date) }}
            </td>

            <!-- Due date -->
            <td class="px-5 py-4">
              <span :class="isOverdue(item) ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-semibold'">
                {{ formatDate(item.due_date) }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-5 py-4">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs"
                :class="statusClass(item)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(item)"></span>
                {{ statusLabel(item) }}
              </span>
            </td>

            <!-- Renewals -->
            <td class="px-5 py-4">
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ item.renewed_count }}</span>
              <span class="text-slate-400 dark:text-slate-600 font-bold"> / 2</span>
            </td>

            <!-- Librarian -->
            <td v-if="role !== 'member'" class="px-5 py-4 text-slate-600 dark:text-slate-400 font-medium">
              {{ item.librarian?.user?.name || '—' }}
            </td>

            <!-- Actions -->
            <td class="px-5 py-4 text-right">
              <div class="flex justify-end gap-2 items-center">
                <button
                  v-if="canRenew(item)"
                  @click="$emit('renew', item)"
                  class="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  {{ $t('circulation.renew') }}
                </button>
                <button
                  v-if="canReturn(item)"
                  @click="$emit('return', item)"
                  class="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 rounded-lg px-3 py-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  {{ $t('circulation.return') }}
                </button>
                <span v-if="item.status === 'returned'" class="text-xs font-bold text-slate-300 dark:text-slate-600">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  items: { type: Array, default: () => [] },
  role: { type: String, default: 'member' }, // 'admin' | 'librarian' | 'member'
})
defineEmits(['renew', 'return'])

const { t } = useI18n()

// Shared class for the small field labels in the phone cards
const lbl = 'text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5'

// Still borrowed and past its due date
function isOverdue(item) {
  return item.status === 'borrowed' && item.due_date && new Date(item.due_date) < new Date()
}

// Max 2 renewals; overdue items can't be renewed
function canRenew(item) {
  return item.status === 'borrowed' && item.renewed_count < 2 && !isOverdue(item)
}

// Only staff can process returns
function canReturn(item) {
  return props.role !== 'member' && item.status === 'borrowed'
}

function statusLabel(item) {
  if (item.status === 'returned') return t('circulation.returnedStatus')
  return isOverdue(item) ? t('circulation.overdue') : t('circulation.active')
}

function statusClass(item) {
  if (item.status === 'returned') return 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  return isOverdue(item)
    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/20'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20'
}

function statusDotClass(item) {
  if (item.status === 'returned') return 'bg-slate-400'
  return isOverdue(item) ? 'bg-rose-500' : 'bg-emerald-500'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
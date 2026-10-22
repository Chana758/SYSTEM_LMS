<template>
  <tr class="border-t border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition">
    <td class="px-4 py-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-green-700 dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {{ initials(memberName) }}
        </div>
        <span class="font-medium text-gray-800 dark:text-slate-100">{{ memberName || '—' }}</span>
      </div>
    </td>

    <td class="px-4 py-3 text-gray-600 dark:text-slate-300">{{ bookTitle || '—' }}</td>

    <td
      class="px-4 py-3 font-bold"
      :class="isUnpaid ? 'text-red-600 dark:text-rose-400' : 'text-gray-800 dark:text-slate-100'"
    >
      ${{ amount }}
    </td>

    <td class="px-4 py-3 capitalize text-gray-500 dark:text-slate-400">{{ reasonLabel }}</td>

    <td class="px-4 py-3"><FineStatusBadge :status="fine.status" /></td>

    <!-- Actions: all visible, no hidden menu.
         Primary action = labelled green button; the rest = compact icon
         buttons (hover for a tooltip). -->
    <td class="px-4 py-3">
      <div class="flex items-center justify-end gap-1.5 whitespace-nowrap">
        <template v-if="isUnpaid">
          <button
            type="button"
            @click="$emit('pay', fine)"
            class="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 px-3 text-xs font-extrabold text-white shadow-sm transition-colors cursor-pointer"
          >
            <BanknotesIcon class="w-4 h-4" />
            {{ t('fines.markAsPaid') }}
          </button>

          <button
            type="button"
            @click="$emit('edit', fine)"
            :title="t('fines.editFine')"
            :aria-label="t('fines.editFine')"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 dark:border-sky-400/25 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20 transition-colors cursor-pointer"
          >
            <PencilSquareIcon class="w-4 h-4" />
          </button>

          <button
            type="button"
            @click="$emit('waive', fine)"
            :title="t('fines.waiveFine')"
            :aria-label="t('fines.waiveFine')"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <HandRaisedIcon class="w-4 h-4" />
          </button>
        </template>

        <button
          type="button"
          @click="$emit('view', fine)"
          :title="t('fines.viewDetail')"
          :aria-label="t('fines.viewDetail')"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
        >
          <EyeIcon class="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BanknotesIcon, EyeIcon, PencilSquareIcon, HandRaisedIcon } from '@heroicons/vue/24/outline'
import FineStatusBadge from './FineStatusBadge.vue'

const { t } = useI18n()

const props = defineProps({ fine: { type: Object, required: true } })
defineEmits(['pay', 'waive', 'view', 'edit'])

const isUnpaid = computed(() => props.fine.status === 'unpaid')
const memberName = computed(() => props.fine.borrow?.member?.user?.name || '')
const bookTitle = computed(() => props.fine.borrow?.book_copy?.book?.title || '')
const amount = computed(() => Number(props.fine.amount || 0).toFixed(2))

// Translate the reason (overdue / damaged / lost / other) instead of showing the raw value.
const REASON_KEYS = {
  overdue: 'fines.reasonOverdue',
  damaged: 'fines.reasonDamaged',
  lost: 'fines.reasonLost',
  other: 'fines.reasonOther',
}
const reasonLabel = computed(() => {
  const key = REASON_KEYS[props.fine.reason]
  return key ? t(key) : props.fine.reason
})

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
</script>
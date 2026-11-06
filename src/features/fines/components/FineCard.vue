<template>
  <!-- Phone version of one fine row (used by FineTable below md). Same data + same events as FineRow. -->
  <div class="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/60 p-4 space-y-3 shadow-2xs">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-full bg-green-700 dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {{ initials(memberName) }}
        </div>
        <div class="min-w-0">
          <p class="font-medium text-gray-800 dark:text-slate-100 truncate">{{ memberName || '—' }}</p>
          <p class="text-xs text-gray-500 dark:text-slate-400 truncate">{{ bookTitle || '—' }}</p>
        </div>
      </div>
      <FineStatusBadge :status="fine.status" class="flex-shrink-0" />
    </div>

    <div class="flex items-end justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
      <span class="text-xs font-semibold capitalize text-gray-500 dark:text-slate-400">{{ t('fines.reason') }}: {{ reasonLabel }}</span>
      <span class="text-xl font-black leading-none" :class="isUnpaid ? 'text-red-600 dark:text-rose-400' : 'text-gray-800 dark:text-slate-100'">
        ${{ amount }}
      </span>
    </div>

    <!-- Actions -->
    <div v-if="isUnpaid" class="space-y-2">
      <button
        type="button"
        @click="$emit('pay', fine)"
        class="w-full inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-xs font-extrabold text-white shadow-sm transition-colors cursor-pointer"
      >
        <BanknotesIcon class="w-4 h-4" />
        {{ t('fines.markAsPaid') }}
      </button>

      <!-- Edit + Waive share the width and may wrap onto two lines (no more "…" cut-off);
           View is icon-only so the two text buttons get the room. -->
      <div class="grid grid-cols-[1fr_1fr_auto] gap-2">
        <button
          type="button"
          @click="$emit('edit', fine)"
          class="inline-flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-2 py-1.5 text-sky-600 dark:border-sky-400/25 dark:bg-sky-500/10 dark:text-sky-300 text-[11px] font-bold transition-colors cursor-pointer"
        >
          <PencilSquareIcon class="w-4 h-4 flex-shrink-0" />
          <span class="text-center leading-tight break-words">{{ t('fines.editFine') }}</span>
        </button>
        <button
          type="button"
          @click="$emit('waive', fine)"
          class="inline-flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2 py-1.5 text-amber-600 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
        >
          <HandRaisedIcon class="w-4 h-4 flex-shrink-0" />
          <span class="text-center leading-tight break-words">{{ t('fines.waiveFine') }}</span>
        </button>
        <button
          type="button"
          @click="$emit('view', fine)"
          :title="t('fines.viewDetail')"
          :aria-label="t('fines.viewDetail')"
          class="inline-flex w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <EyeIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <button
      v-else
      type="button"
      @click="$emit('view', fine)"
      class="w-full inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
    >
      <EyeIcon class="w-4 h-4" />
      {{ t('fines.viewDetail') }}
    </button>
  </div>
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
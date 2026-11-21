<template>
  <!-- B4.3 (Sam): books scanned for this member, borrowed together with one button -->
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-5 space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm font-black text-slate-900 dark:text-white">{{ t('scanner.desk.basket', { n: items.length }) }}</p>
    </div>

    <p v-if="!items.length" class="text-sm text-slate-400 py-6 text-center">{{ t('scanner.desk.basketEmpty') }}</p>

    <ul v-else class="divide-y divide-slate-100 dark:divide-white/5">
      <li v-for="(it, i) in items" :key="it.copyId" class="py-2.5 flex items-center gap-3">
        <span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs font-black flex items-center justify-center text-slate-500">{{ i + 1 }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ it.title }}</p>
          <p class="text-xs text-slate-400">{{ it.barcode }}</p>
        </div>
        <span v-if="it.state === 'ok'" class="text-xs font-bold text-emerald-600 text-right">✓ {{ t('scanner.desk.dueOn', { date: it.due }) }}</span>
        <span v-else-if="it.state === 'error'" class="text-xs font-bold text-rose-600 max-w-[45%] text-right">{{ it.error }}</span>
        <button v-else type="button" @click="$emit('remove', it.copyId)" :disabled="busy" class="text-xs font-bold text-slate-400 hover:text-rose-600 cursor-pointer">{{ t('scanner.desk.remove') }}</button>
      </li>
    </ul>

    <p v-if="overLimit" class="text-xs font-bold text-amber-700 dark:text-amber-300">{{ t('scanner.desk.overLimit', { n: remaining }) }}</p>

    <div class="flex flex-col sm:flex-row gap-2">
      <button v-if="!done" type="button" @click="$emit('confirm')" :disabled="busy || !pending || blocked"
        class="flex-1 h-12 rounded-xl bg-green-700 hover:bg-green-800 dark:bg-emerald-600 text-white text-sm font-black disabled:opacity-50 cursor-pointer">
        {{ busy ? t('scanner.result.confirming') : t('scanner.desk.borrowAll', { n: pending }) }}
      </button>
      <button v-if="done || items.length" type="button" @click="$emit('next')" :disabled="busy"
        class="flex-1 h-12 rounded-xl border border-slate-300 dark:border-white/15 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
        {{ t('scanner.desk.nextMember') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  items: { type: Array, default: () => [] }, // { copyId, bookId, title, barcode, state: 'pending'|'ok'|'error', error }
  remaining: { type: Number, default: 0 },
  busy: Boolean,
  blocked: Boolean,
})
defineEmits(['remove', 'confirm', 'next'])
const { t } = useI18n()

const pending = computed(() => props.items.filter((i) => i.state === 'pending').length)
const done = computed(() => props.items.length > 0 && pending.value === 0)
const overLimit = computed(() => pending.value > props.remaining)
</script>

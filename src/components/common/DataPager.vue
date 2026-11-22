<template>
  <!-- Shared pager: "21–40 of 312", first/prev/numbers/next/last, jump to page, rows per page -->
  <div v-if="total > 0" class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-white/10 text-xs">
    <div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
      <span class="font-semibold tabular-nums">{{ t('common.pager.showing', { from, to, total }) }}</span>
      <label class="inline-flex items-center gap-1.5">
        <span>{{ t('common.pager.perPage') }}</span>
        <select :value="perPage" @change="$emit('per-page', Number($event.target.value))"
          class="h-8 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-2 font-bold cursor-pointer">
          <option v-for="n in sizes" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
    </div>

    <div v-if="lastPage > 1" class="flex items-center gap-1 flex-wrap">
      <button type="button" :disabled="page <= 1" @click="go(1)" :class="btn" :title="t('common.pager.first')">«</button>
      <button type="button" :disabled="page <= 1" @click="go(page - 1)" :class="btn" :title="t('common.pager.prev')">‹</button>
      <template v-for="(p, i) in pages" :key="i">
        <span v-if="p === '…'" class="px-1 text-slate-400">…</span>
        <button v-else type="button" @click="go(p)" :class="[btn, p === page ? active : '']">{{ p }}</button>
      </template>
      <button type="button" :disabled="page >= lastPage" @click="go(page + 1)" :class="btn" :title="t('common.pager.next')">›</button>
      <button type="button" :disabled="page >= lastPage" @click="go(lastPage)" :class="btn" :title="t('common.pager.last')">»</button>

      <form class="inline-flex items-center gap-1 ml-2" @submit.prevent="jump">
        <span class="text-slate-500 dark:text-slate-400">{{ t('common.pager.goTo') }}</span>
        <input v-model.number="target" type="number" min="1" :max="lastPage"
          class="w-14 h-8 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-2 text-center font-bold tabular-nums" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  page: { type: Number, default: 1 },
  lastPage: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  perPage: { type: Number, default: 25 },
  sizes: { type: Array, default: () => [10, 25, 50, 100] },
})
const emit = defineEmits(['change', 'per-page'])
const { t } = useI18n()

const btn = 'min-w-8 h-8 px-2 rounded-lg border border-slate-300 dark:border-white/10 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer tabular-nums'
const active = '!bg-emerald-700 !border-emerald-700 !text-white'

const from = computed(() => (props.total ? (props.page - 1) * props.perPage + 1 : 0))
const to = computed(() => Math.min(props.total, props.page * props.perPage))

// 1 … 4 5 [6] 7 8 … 20
const pages = computed(() => {
  const last = props.lastPage
  const cur = props.page
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const out = [1]
  const start = Math.max(2, cur - 2)
  const end = Math.min(last - 1, cur + 2)
  if (start > 2) out.push('…')
  for (let p = start; p <= end; p++) out.push(p)
  if (end < last - 1) out.push('…')
  out.push(last)
  return out
})

const target = ref(props.page)
watch(() => props.page, (p) => (target.value = p))

function go(p) {
  const n = Math.min(Math.max(1, Number(p) || 1), props.lastPage)
  if (n !== props.page) emit('change', n)
}
function jump() {
  go(target.value)
}
</script>

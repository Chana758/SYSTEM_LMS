<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold"
    :class="meta.cls"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({ status: { type: String, default: '' } })

// Full class names so Tailwind can generate them.
const STATUS = {
  unpaid: {
    key: 'fines.unpaid',
    cls: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/25',
  },
  paid: {
    key: 'fines.paid',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25',
  },
  waived: {
    key: 'fines.waived',
    cls: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/25',
  },
}
const FALLBACK = {
  key: null,
  cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15',
}

const meta = computed(() => STATUS[props.status] || FALLBACK)
const label = computed(() => (meta.value.key ? t(meta.value.key) : props.status || '—'))
</script>
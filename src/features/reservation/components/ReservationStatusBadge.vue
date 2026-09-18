<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-2xs"
    :class="classes"
  >
    <span class="w-1.5 h-1.5 rounded-full ring-2" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ status: { type: String, required: true } })
const { t } = useI18n()

const map = {
  pending:   { labelKey: 'reservation.statusPending',   classes: 'bg-amber-50 text-amber-800 border-amber-200',   dot: 'bg-amber-500 ring-amber-100' },
  ready:     { labelKey: 'reservation.statusReady',     classes: 'bg-blue-50 text-blue-800 border-blue-200',       dot: 'bg-blue-500 ring-blue-100' },
  fulfilled: { labelKey: 'reservation.statusFulfilled', classes: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500 ring-emerald-100' },
  cancelled: { labelKey: 'reservation.statusCancelled', classes: 'bg-slate-100 text-slate-600 border-slate-300',      dot: 'bg-slate-400 ring-slate-200' },
  expired:   { labelKey: 'reservation.statusExpired',   classes: 'bg-rose-50 text-rose-800 border-rose-200',       dot: 'bg-rose-500 ring-rose-100' },
}

const info = computed(() => map[props.status] || map.pending)
const label = computed(() => t(info.value.labelKey))
const classes = computed(() => info.value.classes)
const dotClass = computed(() => info.value.dot)
</script>
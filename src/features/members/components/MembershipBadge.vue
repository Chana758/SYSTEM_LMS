<template>
  <div class="inline-flex items-center gap-1.5">
    <span v-if="!hideType" class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" :class="typeClass">
      {{ typeLabel }}
    </span>
    <span v-if="status && !hideStatus" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" :class="statusClass">
      <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass"></span>
      {{ statusLabel }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  type: { type: String, default: 'student' },
  status: { type: String, default: '' },
  hideType: { type: Boolean, default: false },
  hideStatus: { type: Boolean, default: false },
})

const typeClass = computed(() => ({
  student: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20',
  teacher: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/20',
  external: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-500/20',
}[props.type] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'))

const statusClass = computed(() => ({
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/20',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  expired: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-500/20',
}[props.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'))

const statusDotClass = computed(() => ({
  active: 'bg-emerald-500',
  inactive: 'bg-slate-400',
  expired: 'bg-rose-500',
}[props.status] || 'bg-slate-400'))

const typeLabel = computed(() => ({
  student: t('members.typeStudent'),
  teacher: t('members.typeTeacher'),
  external: t('members.typeExternal'),
}[props.type] || props.type))

const statusLabel = computed(() => ({
  active: t('members.statusActive'),
  inactive: t('members.statusInactive'),
  expired: t('members.statusExpired'),
}[props.status] || props.status))
</script>
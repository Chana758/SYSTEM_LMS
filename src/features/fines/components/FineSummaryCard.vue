<template>
  <!-- 2 per row on phones, 4 on desktop -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <div
      v-for="c in cards"
      :key="c.key"
      class="group relative overflow-hidden rounded-2xl border-2 p-4 sm:p-5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-transparent dark:bg-gradient-to-br dark:shadow-lg dark:ring-1 dark:ring-inset dark:ring-white/10"
      :class="c.card"
    >
      <!-- Light: soft coloured circle  |  Dark: glossy highlight + glow -->
      <span class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full dark:hidden" :class="c.orbLight"></span>
      <span class="pointer-events-none absolute inset-x-0 top-0 hidden h-1/2 bg-gradient-to-b from-white/20 to-transparent dark:block"></span>
      <span class="pointer-events-none absolute -right-8 -top-8 hidden h-28 w-28 rounded-full bg-white/15 blur-2xl transition-transform duration-500 group-hover:scale-125 dark:block"></span>

      <div class="relative">
        <div class="mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <div
            class="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border-2 dark:border-white/30 dark:bg-white/25 dark:bg-none dark:shadow-none dark:backdrop-blur-sm"
            :class="c.iconBox"
          >
            <component :is="c.icon" class="h-5 w-5 sm:h-6 sm:w-6" :class="c.iconColor" />
          </div>
          <span
            class="hidden sm:inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest dark:border-white/30 dark:bg-white/15 dark:text-white"
            :class="c.badge"
          >
            {{ c.badge_text }}
          </span>
        </div>

        <p class="mb-1.5 text-2xl sm:text-3xl font-black leading-none tracking-tight dark:text-white" :class="c.value_cls">{{ c.value }}</p>
        <p class="text-[11px] font-bold tracking-wide leading-snug" :class="c.label_cls">{{ c.label }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ExclamationCircleIcon, CheckCircleIcon, HandRaisedIcon, BanknotesIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const props = defineProps({ summary: { type: Object, required: true } })

const money = (n) => `$${Number(n || 0).toFixed(2)}`

// Full class names so Tailwind can generate them.
const cards = computed(() => [
  {
    key: 'unpaid',
    icon: ExclamationCircleIcon,
    value: money(props.summary.total_unpaid),
    badge_text: t('fines.unpaid'),
    label: `${props.summary.count_unpaid ?? 0} ${t('fines.outstandingRecords')}`,
    card: 'bg-white border-slate-300 hover:shadow-rose-200 dark:from-rose-500 dark:via-rose-600 dark:to-rose-800 dark:border-rose-300/30 dark:hover:shadow-rose-500/40',
    orbLight: 'bg-rose-100',
    iconBox: 'bg-gradient-to-br from-rose-400 to-rose-600 border-rose-300 shadow-lg shadow-rose-500/40',
    iconColor: 'text-white',
    badge: 'bg-rose-50 text-rose-600 border-rose-200',
    value_cls: 'text-slate-900',
    label_cls: 'text-slate-500 dark:text-rose-100',
  },
  {
    key: 'paid',
    icon: CheckCircleIcon,
    value: money(props.summary.total_paid),
    badge_text: t('fines.paid'),
    label: t('fines.collectedToDate'),
    card: 'bg-white border-slate-300 hover:shadow-emerald-200 dark:from-emerald-500 dark:via-emerald-600 dark:to-emerald-800 dark:border-emerald-300/30 dark:hover:shadow-emerald-500/40',
    orbLight: 'bg-emerald-100',
    iconBox: 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-300 shadow-lg shadow-emerald-500/40',
    iconColor: 'text-white',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    value_cls: 'text-slate-900',
    label_cls: 'text-slate-500 dark:text-emerald-100',
  },
  {
    key: 'waived',
    icon: HandRaisedIcon,
    value: money(props.summary.total_waived),
    badge_text: t('fines.waived'),
    label: t('fines.forgivenAmount'),
    card: 'bg-white border-slate-300 hover:shadow-violet-200 dark:from-violet-500 dark:via-violet-600 dark:to-violet-800 dark:border-violet-300/30 dark:hover:shadow-violet-500/40',
    orbLight: 'bg-violet-100',
    iconBox: 'bg-gradient-to-br from-violet-400 to-violet-600 border-violet-300 shadow-lg shadow-violet-500/40',
    iconColor: 'text-white',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    value_cls: 'text-slate-900',
    label_cls: 'text-slate-500 dark:text-violet-100',
  },
  {
    key: 'processed',
    icon: BanknotesIcon,
    value: money(Number(props.summary.total_paid || 0) + Number(props.summary.total_waived || 0)),
    badge_text: t('fines.totalProcessed'),
    label: t('fines.paidPlusWaived'),
    card: 'bg-gradient-to-br from-green-600 to-green-800 border-green-800 text-white hover:shadow-green-500/40 dark:from-sky-500 dark:via-blue-600 dark:to-indigo-800 dark:border-sky-300/30 dark:hover:shadow-blue-500/40',
    orbLight: 'bg-white/15',
    iconBox: 'bg-white/20 border-white/30',
    iconColor: 'text-white',
    badge: 'bg-white/15 text-white border-white/30',
    value_cls: 'text-white',
    label_cls: 'text-green-100 dark:text-sky-100',
  },
])
</script>
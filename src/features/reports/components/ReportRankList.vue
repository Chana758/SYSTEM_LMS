<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none p-5 h-full">
    <h3 class="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-wide mb-4">{{ title }}</h3>

    <ul v-if="items.length" class="space-y-3.5">
      <li v-for="(item, i) in items" :key="item.key ?? i" class="flex items-center gap-3">
        <!-- avatar variant -->
        <span
          v-if="variant === 'avatar'"
          class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
          :class="avatarTone(i)"
        >{{ initials(item.name) }}</span>
        <span v-else class="w-5 text-xs font-black text-slate-400 dark:text-slate-500 shrink-0">{{ i + 1 }}</span>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-100 truncate">{{ item.name }}</p>
            <span class="text-xs font-black text-slate-600 dark:text-slate-200 shrink-0">{{ item.label ?? item.value }}{{ suffix }}</span>
          </div>
          <p v-if="item.sub" class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ item.sub }}</p>
          <!-- bar variant -->
          <div v-if="variant === 'bar'" class="mt-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
            <div class="h-full rounded-full" :class="barColor" :style="{ width: pct(item.value) + '%' }"></div>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="py-8 text-center text-sm text-slate-300 dark:text-slate-600 font-bold">{{ t('reports.dashboardPage.noDataYet') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// items = [{ key?, name, sub?, value, label? }]
const props = defineProps({
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  variant: { type: String, default: 'bar' }, // 'bar' | 'avatar'
  suffix: { type: String, default: '' },
  barColor: { type: String, default: 'bg-emerald-500' },
})

const max = computed(() => Math.max(1, ...props.items.map((i) => Number(i.value) || 0)))
const pct = (v) => Math.max(4, Math.round(((Number(v) || 0) / max.value) * 100))

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'

const tones = [
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
]
const avatarTone = (i) => tones[i % tones.length]
</script>
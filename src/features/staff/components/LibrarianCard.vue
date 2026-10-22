<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm">
    <div class="flex items-start gap-3.5 sm:gap-5">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt="Profile avatar"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
      />
      <div
        v-else
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white text-lg sm:text-xl font-bold flex items-center justify-center flex-shrink-0 shadow-sm"
      >
        {{ initials }}
      </div>

      <div class="flex-1 min-w-0">
        <!-- Phones: status badge drops below the name. sm+: sits on the right. -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">{{ librarian.user?.name }}</h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{{ librarian.user?.email }}</p>
          </div>
          <span
            class="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border flex-shrink-0"
            :class="statusClass"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass"></span>
            {{ statusLabel }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3.5 sm:gap-4 mt-4 sm:mt-5 pt-4 border-t border-slate-100 dark:border-white/10">
      <div class="min-w-0">
        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mb-0.5">{{ $t('staff.detail.employeeId') }}</p>
        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 font-mono break-all">{{ librarian.employee_id }}</p>
      </div>
      <div class="min-w-0">
        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mb-0.5">{{ $t('staff.detail.department') }}</p>
        <p class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 break-words">{{ librarian.department || '—' }}</p>
      </div>
      <div class="min-w-0">
        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mb-0.5">{{ $t('staff.detail.shift') }}</p>
        <p class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{{ librarian.shift || '—' }}</p>
      </div>
      <div class="min-w-0">
        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mb-0.5">{{ $t('staff.detail.hired') }}</p>
        <p class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{{ formatDate(librarian.hire_date) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  librarian: { type: Object, required: true },
})

const { t } = useI18n()

const initials = computed(() => {
  const name = props.librarian.user?.name || ''
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

const avatarUrl = computed(() => {
  if (!props.librarian.user?.avatar) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${props.librarian.user.avatar}`
})

const statusLabel = computed(() => {
  const map = {
    active: t('staff.form.statusActive'),
    inactive: t('staff.form.statusInactive'),
    on_leave: t('staff.form.statusOnLeave'),
  }
  return map[props.librarian.status] || props.librarian.status
})

const statusClass = computed(() => ({
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-500/20',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  on_leave: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/20',
}[props.librarian.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'))

const statusDotClass = computed(() => ({
  active: 'bg-emerald-500',
  inactive: 'bg-slate-400',
  on_leave: 'bg-amber-500',
}[props.librarian.status] || 'bg-slate-400'))

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
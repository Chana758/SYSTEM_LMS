import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ExclamationTriangleIcon, CalendarDaysIcon, BanknotesIcon,
  Cog6ToothIcon, MegaphoneIcon,
} from '@heroicons/vue/24/outline'

export const TYPE_KEYS = ['overdue', 'reservation', 'fine', 'announcement', 'system']

// Full literal class names so Tailwind JIT can see them.
export const TYPES = {
  overdue: {
    icon: ExclamationTriangleIcon, labelKey: 'notifications.typeOverdue',
    spine: 'bg-rose-500', iconBg: 'bg-rose-500', dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30',
  },
  reservation: {
    icon: CalendarDaysIcon, labelKey: 'notifications.typeReservation',
    spine: 'bg-sky-500', iconBg: 'bg-sky-500', dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30',
  },
  fine: {
    icon: BanknotesIcon, labelKey: 'notifications.typeFine',
    spine: 'bg-amber-500', iconBg: 'bg-amber-500', dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30',
  },
  announcement: {
    icon: MegaphoneIcon, labelKey: 'notifications.typeAnnouncement',
    spine: 'bg-purple-500', iconBg: 'bg-purple-500', dot: 'bg-purple-500',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30',
  },
  system: {
    icon: Cog6ToothIcon, labelKey: 'notifications.typeSystem',
    spine: 'bg-slate-400', iconBg: 'bg-slate-500', dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/20',
  },
}

export function useNotificationMeta() {
  const { t, locale } = useI18n()

  // Intl does not know "kh" — Khmer is "km".
  const intlLocale = computed(() => {
    if (locale.value === 'kh') return 'km'
    if (locale.value === 'en') return 'en-GB'
    return locale.value
  })

  const meta = (type) => TYPES[type] || TYPES.system
  const typeLabel = (type) => t(meta(type).labelKey)

  const formatDate = (d, withYear = true) =>
    new Date(d).toLocaleString(intlLocale.value, {
      day: '2-digit', month: 'short', ...(withYear ? { year: 'numeric' } : {}),
      hour: '2-digit', minute: '2-digit',
    })

  const timeAgo = (d) => {
    try {
      const diff = (new Date(d).getTime() - Date.now()) / 1000
      const rtf = new Intl.RelativeTimeFormat(intlLocale.value, { numeric: 'auto' })
      for (const [unit, secs] of [['day', 86400], ['hour', 3600], ['minute', 60]]) {
        if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
      }
      return rtf.format(0, 'second')
    } catch {
      return formatDate(d)
    }
  }

  return { meta, typeLabel, formatDate, timeAgo }
}
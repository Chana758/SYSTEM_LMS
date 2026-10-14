import { useI18n } from 'vue-i18n'

const KEYS = { available: 'statusAvailable', damaged: 'statusDamaged', lost: 'statusLost', archived: 'statusArchived' }
const CLASSES = {
  available: 'bg-emerald-500 text-white',
  damaged: 'bg-amber-400 text-slate-950',
  lost: 'bg-rose-500 text-white',
  archived: 'bg-slate-500 text-white',
}

export function useBookStatus() {
  const { t } = useI18n()
  const badgeClass = (s) => CLASSES[s] || 'bg-slate-400 text-white'
  const label = (s) => (KEYS[s] ? t(`catalog.${KEYS[s]}`) : s)
  return { badgeClass, label }
}
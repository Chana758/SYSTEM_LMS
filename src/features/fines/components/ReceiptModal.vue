<template>
  <!-- Receipt for any payment (cash or KHQR, ៛ or $): view and print -->
  <div class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4" @click.self="$emit('close')">
    <div class="w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4">
      <div v-if="!r" class="py-12"><div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>

      <template v-else>
        <div class="text-center space-y-1">
          <CheckCircleIcon class="w-12 h-12 mx-auto" :class="r.status === 'refunded' ? 'text-rose-500' : 'text-emerald-600'" />
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">{{ t('fines.receipt.title') }}</p>
          <p class="text-3xl font-black text-slate-900 dark:text-white">{{ r.status === 'refunded' ? '− ' : '' }}{{ formatIn(r.amount, r.currency) }}</p>
          <p v-if="r.currency === 'USD'" class="text-xs text-slate-400">= {{ formatIn(r.amount_khr, 'KHR') }} · 1$ = {{ formatIn(r.exchange_rate, 'KHR') }}</p>
        </div>

        <div class="text-xs divide-y divide-slate-100 dark:divide-white/10 border-y border-slate-100 dark:border-white/10">
          <p v-for="row in lines" :key="row[0]" class="flex justify-between gap-3 py-2">
            <span class="text-slate-500">{{ row[0] }}</span><b class="text-right text-slate-900 dark:text-white">{{ row[1] }}</b>
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button type="button" @click="$emit('close')" class="h-11 rounded-xl border-2 border-slate-300 dark:border-white/15 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">{{ t('fines.receipt.close') }}</button>
          <button type="button" @click="print" class="h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer">
            <PrinterIcon class="w-4 h-4" />{{ t('fines.receipt.print') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircleIcon, PrinterIcon } from '@heroicons/vue/24/outline'
import { paymentService } from '../services/paymentService'
import { formatIn } from '@/utils/currencyHelper'
import { useBrandingStore } from '@/stores/brandingStore'

const props = defineProps({ paymentId: { type: [Number, String], required: true } })
defineEmits(['close'])

const { t } = useI18n()
const branding = useBrandingStore()
const r = ref(null)

const when = (v) => (v ? new Date(v).toLocaleString('en-GB') : '—')

const lines = computed(() => {
  if (!r.value) return []
  const x = r.value
  const out = [
    [t('fines.receipt.no'), x.tran_id],
    [t('fines.receipt.date'), when(x.paid_at || x.created_at)],
    [t('fines.receipt.member'), x.member?.name || '—'],
    [t('fines.receipt.for'), x.description],
    [t('fines.receipt.method'), x.method === 'khqr' ? 'KHQR (Bakong)' : t('fines.payments.cash')],
  ]
  if (x.method === 'cash' && x.status === 'paid') {
    const got = [x.cash_received_khr ? formatIn(x.cash_received_khr, 'KHR') : '', x.cash_received_usd ? formatIn(x.cash_received_usd, 'USD') : ''].filter(Boolean).join(' + ')
    out.push([t('fines.cash.receivedLabel'), got || '—'])
    const chg = [x.change_usd ? formatIn(x.change_usd, 'USD') : '', x.change_khr || !x.change_usd ? formatIn(x.change_khr, 'KHR') : ''].filter(Boolean).join(' + ')
    out.push([t('fines.cash.changeGive'), chg])
  }
  if (x.apv) out.push(['APV / Hash', x.apv])
  if (x.staff) out.push([t('fines.receipt.staff'), x.staff])
  return out
})

// Print just the receipt in a small window (80mm-style layout)
function print() {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const x = r.value
  const amount = (x.status === 'refunded' ? '− ' : '') + formatIn(x.amount, x.currency)
  const rows = lines.value.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')
  const w = window.open('', '_blank', 'width=380,height=640')
  if (!w) return
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(x.tran_id)}</title>
<style>body{font-family:system-ui,'Noto Sans Khmer',sans-serif;width:72mm;margin:0 auto;padding:8px;color:#111}
h1{font-size:15px;text-align:center;margin:4px 0}.c{text-align:center}.big{font-size:22px;font-weight:800;margin:8px 0}
table{width:100%;font-size:11px;border-collapse:collapse}td{padding:3px 0;vertical-align:top}td+td{text-align:right;font-weight:700}
hr{border:0;border-top:1px dashed #999;margin:8px 0}</style></head><body>
<h1>${esc(branding.siteName || 'Library')}</h1><p class="c" style="font-size:11px">${esc(t('fines.receipt.title'))}</p><hr>
<p class="c big">${esc(amount)}</p><table>${rows}</table><hr><p class="c" style="font-size:10px">${esc(t('fines.receipt.thanks'))}</p>
<script>window.onload=function(){window.print()}<\/script></body></html>`)
  w.document.close()
}

onMounted(async () => {
  const { data } = await paymentService.receipt(props.paymentId)
  r.value = data
})
</script>

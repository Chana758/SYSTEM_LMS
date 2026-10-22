<template>
  <div class="flex items-center gap-3">
    <!-- QR stays on white in dark mode so it remains scannable -->
    <div class="bg-white p-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-2xs flex-shrink-0">
      <QrcodeVue :value="barcode" :size="40" level="M" />
    </div>
    <span class="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">{{ barcode }}</span>
  </div>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue'

defineProps({
  barcode: { type: String, required: true },
})
</script>
<template>
  <div class="flex items-center gap-3">
    <div class="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex-shrink-0">
      <QrcodeVue :value="barcode" :size="40" level="M" />
    </div>
    <span class="font-mono font-bold text-slate-900 text-xs">{{ barcode }}</span>
  </div>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue'

defineProps({
  barcode: { type: String, required: true },
})
</script>
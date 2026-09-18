<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-2xl border border-gray-200 p-5 relative overflow-hidden">
      <div class="absolute -right-3 -top-3 w-16 h-16 bg-red-50 rounded-full"></div>
      <div class="relative">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <ExclamationCircleIcon class="w-4 h-4 text-red-500" />
          </div>
          <p class="text-xs text-gray-400 uppercase font-semibold">{{ t('fines.unpaid') }}</p>
        </div>
        <p class="text-2xl font-bold text-gray-800">${{ Number(summary.total_unpaid).toFixed(2) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ summary.count_unpaid }} {{ t('fines.outstandingRecords') }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-5 relative overflow-hidden">
      <div class="absolute -right-3 -top-3 w-16 h-16 bg-green-50 rounded-full"></div>
      <div class="relative">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircleIcon class="w-4 h-4 text-green-600" />
          </div>
          <p class="text-xs text-gray-400 uppercase font-semibold">{{ t('fines.paid') }}</p>
        </div>
        <p class="text-2xl font-bold text-gray-800">${{ Number(summary.total_paid).toFixed(2) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ t('fines.collectedToDate') }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-5 relative overflow-hidden">
      <div class="absolute -right-3 -top-3 w-16 h-16 bg-gray-100 rounded-full"></div>
      <div class="relative">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <HandRaisedIcon class="w-4 h-4 text-gray-500" />
          </div>
          <p class="text-xs text-gray-400 uppercase font-semibold">{{ t('fines.waived') }}</p>
        </div>
        <p class="text-2xl font-bold text-gray-800">${{ Number(summary.total_waived).toFixed(2) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ t('fines.forgivenAmount') }}</p>
      </div>
    </div>

    <div class="bg-green-700 rounded-2xl p-5 relative overflow-hidden text-white">
      <div class="absolute -right-3 -top-3 w-16 h-16 bg-white/10 rounded-full"></div>
      <div class="relative">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <BanknotesIcon class="w-4 h-4 text-white" />
          </div>
          <p class="text-xs text-white/70 uppercase font-semibold">{{ t('fines.totalProcessed') }}</p>
        </div>
        <p class="text-2xl font-bold">
          ${{ (Number(summary.total_paid) + Number(summary.total_waived)).toFixed(2) }}
        </p>
        <p class="text-xs text-white/70 mt-1">{{ t('fines.paidPlusWaived') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ExclamationCircleIcon, CheckCircleIcon, HandRaisedIcon, BanknotesIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
defineProps({ summary: { type: Object, required: true } })
</script>
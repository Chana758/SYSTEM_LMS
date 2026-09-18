<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
        <tr>
          <th class="text-left px-4 py-3">{{ t('fines.member') }}</th>
          <th class="text-left px-4 py-3">{{ t('fines.book') }}</th>
          <th class="text-left px-4 py-3">{{ t('fines.amount') }}</th>
          <th class="text-left px-4 py-3">{{ t('fines.reason') }}</th>
          <th class="text-left px-4 py-3">{{ t('fines.status') }}</th>
          <th class="text-right px-4 py-3">{{ t('fines.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="6" class="text-center py-10 text-gray-400">
            <div class="animate-pulse">{{ t('fines.loadingFines') }}</div>
          </td>
        </tr>
        <tr v-else-if="!fines.length">
          <td colspan="6" class="text-center py-12">
            <div class="flex flex-col items-center gap-2 text-gray-400">
              <CheckCircleIcon class="w-10 h-10 text-green-200" />
              <p class="text-sm">{{ t('fines.allClear') }}</p>
            </div>
          </td>
        </tr>
        <FineRow
          v-for="fine in fines"
          :key="fine.id"
          :fine="fine"
          @pay="$emit('pay', $event)"
          @waive="$emit('waive', $event)"
          @view="$emit('view', $event)"
          @edit="$emit('edit', $event)"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import FineRow from './FineRow.vue'

const { t } = useI18n()
defineProps({ fines: { type: Array, required: true }, loading: { type: Boolean, default: false } })
defineEmits(['pay', 'waive', 'view', 'edit'])
</script>
<template>
  <div>
    <!--  PHONES: card list -->
    <div class="md:hidden space-y-3">
      <div v-if="loading" class="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-center py-10 text-gray-400 dark:text-slate-500">
        <div class="animate-pulse">{{ t('fines.loadingFines') }}</div>
      </div>
      <div v-else-if="!fines.length" class="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-center py-12">
        <div class="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-500">
          <CheckCircleIcon class="w-10 h-10 text-green-200 dark:text-emerald-400/40" />
          <p class="text-sm">{{ t('fines.allClear') }}</p>
        </div>
      </div>
      <FineCard
        v-for="fine in fines"
        :key="fine.id"
        :fine="fine"
        @pay="$emit('pay', $event)"
        @waive="$emit('waive', $event)"
        @view="$emit('view', $event)"
        @edit="$emit('edit', $event)"
      />
    </div>

    <!-- md and up: table -->
    <!-- overflow-x-auto (was overflow-hidden): with the action buttons now
         visible in each row, a narrow screen scrolls sideways instead of
         clipping the buttons. -->
    <div class="hidden md:block bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-xs uppercase">
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
            <td colspan="6" class="text-center py-10 text-gray-400 dark:text-slate-500">
              <div class="animate-pulse">{{ t('fines.loadingFines') }}</div>
            </td>
          </tr>
          <tr v-else-if="!fines.length">
            <td colspan="6" class="text-center py-12">
              <div class="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-500">
                <CheckCircleIcon class="w-10 h-10 text-green-200 dark:text-emerald-400/40" />
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
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import FineRow from './FineRow.vue'
import FineCard from './FineCard.vue'

const { t } = useI18n()
defineProps({ fines: { type: Array, required: true }, loading: { type: Boolean, default: false } })
defineEmits(['pay', 'waive', 'view', 'edit'])
</script>
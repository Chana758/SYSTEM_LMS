<template>
  <!-- Where the member came from, whether they hold the university card, and (MEM4)
       whether an imported student has activated the app yet -->
  <div class="flex flex-wrap gap-1">
    <span v-if="member.source" class="px-1.5 py-0.5 rounded-md text-[10px] font-bold" :class="originClass">
      {{ t('members.origin.' + member.source) }}
    </span>
    <span v-if="member.has_school_card" class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
      {{ t('members.origin.schoolCard') }}
    </span>
    <!-- Not activated yet: one click activates it and shows a one-time password -->
    <QuickActivate v-if="member.user?.status === 'inactive'" :member="member" />
    <span v-else-if="member.user?.status === 'pending'" class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
      {{ t('members.origin.pending') }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import QuickActivate from './QuickActivate.vue'

const props = defineProps({ member: { type: Object, required: true } })
const { t } = useI18n()

const originClass = computed(() => ({
  import: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  register: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  staff: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}[props.member.source] || 'bg-slate-100 text-slate-600'))
</script>

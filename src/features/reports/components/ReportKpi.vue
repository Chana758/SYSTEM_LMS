<template>
  <component :is="to ? RouterLink : 'div'" :to="to || undefined" class="block h-full min-w-0">
    <ReportSummaryCard v-bind="$attrs" class="h-full">
      <template v-if="hasSpark" #spark>
        <ReportSparkline :values="spark" />
      </template>
    </ReportSummaryCard>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ReportSummaryCard from './ReportSummaryCard.vue'
import ReportSparkline from './ReportSparkline.vue'

// KPI = ReportSummaryCard + optional sparkline + optional click-through link.
// Every other prop (label, value, bg, icon, trend, badge, format) falls through to the card.
defineOptions({ inheritAttrs: false })
const props = defineProps({
  spark: { type: Array, default: () => [] },
  to: { type: [String, Object], default: null },
})

// Nothing to draw when every point is 0 (it would render as a flat grey bar).
const hasSpark = computed(() => props.spark?.length > 1 && props.spark.some((v) => Number(v) > 0))
</script>
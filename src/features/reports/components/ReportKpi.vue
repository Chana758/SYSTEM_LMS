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

// Only draw a trend line when at least 2 days have activity.
// A single busy day between zeros renders as a lone triangle that tells you nothing.
const hasSpark = computed(
  () => Array.isArray(props.spark) && props.spark.filter((v) => Number(v) > 0).length >= 2,
)
</script>
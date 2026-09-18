<template>
  <div class="inline-flex items-center gap-1.5">
    <span v-if="!hideType" class="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" :class="typeClass">
      {{ typeLabel }}
    </span>
    <span v-if="status" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize" :class="statusClass">
      <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass"></span>
      {{ statusLabel }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  type: { type: String, default: 'student' },
  status: { type: String, default: '' },
  hideType: { type: Boolean, default: false },
})

const typeClass = computed(() => ({
  student: 'bg-blue-50 text-blue-700',
  teacher: 'bg-purple-50 text-purple-700',
  external: 'bg-amber-50 text-amber-700',
}[props.type] || 'bg-gray-100 text-gray-600'))

const statusClass = computed(() => ({
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  expired: 'bg-red-50 text-red-600',
}[props.status] || 'bg-gray-100 text-gray-500'))

const statusDotClass = computed(() => ({
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  expired: 'bg-red-500',
}[props.status] || 'bg-gray-400'))

// Translate the dynamic type/status codes coming from the backend
// (student/teacher/external, active/inactive/expired) into the
// localized labels defined in members.json.
const typeLabel = computed(() => ({
  student: t('members.typeStudent'),
  teacher: t('members.typeTeacher'),
  external: t('members.typeExternal'),
}[props.type] || props.type))

const statusLabel = computed(() => ({
  active: t('members.statusActive'),
  inactive: t('members.statusInactive'),
  expired: t('members.statusExpired'),
}[props.status] || props.status))
</script>
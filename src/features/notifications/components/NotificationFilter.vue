<template>
  <div class="flex flex-wrap items-center gap-2 mb-5">
    <button
      v-for="opt in typeOptions" :key="opt.value"
      @click="update('type', opt.value)"
      class="px-3 py-1.5 rounded-full text-xs font-medium border transition"
      :class="modelValue.type === opt.value ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
    >
      {{ opt.label }}
    </button>

    <div class="flex-1"></div>

    <select :value="modelValue.is_read" @change="update('is_read', $event.target.value)" class="border rounded-lg px-3 py-1.5 text-xs">
      <option value="">{{ t('notifications.filter.all') }}</option>
      <option value="false">{{ t('notifications.unread') }}</option>
      <option value="true">{{ t('notifications.filter.read') }}</option>
    </select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({
  modelValue: { type: Object, default: () => ({ type: '', is_read: '' }) },
})
const emit = defineEmits(['update:modelValue', 'change'])

const typeOptions = computed(() => [
  { value: '', label: t('notifications.filter.all') },
  { value: 'overdue', label: t('notifications.typeOverdue') },
  { value: 'reservation', label: t('notifications.typeReservation') },
  { value: 'fine', label: t('notifications.typeFine') },
  { value: 'announcement', label: t('notifications.typeAnnouncement') },
  { value: 'system', label: t('notifications.typeSystem') },
])

function update(key, value) {
  const next = { ...props.modelValue, [key]: value }
  emit('update:modelValue', next)
  emit('change', next)
}
</script>
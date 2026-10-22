<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <h2 class="text-lg font-bold text-gray-800 dark:text-white">
      {{ isEdit ? t('catalog.categoryForm.editTitle') : t('catalog.categoryForm.addTitle') }}
    </h2>

    <div>
      <label :for="id('name')" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{{ t('catalog.categoryForm.categoryName') }}</label>
      <input :id="id('name')" v-model="form.name" type="text" :class="inputCls" />
      <p v-if="errors.name" class="text-red-500 dark:text-rose-400 text-xs mt-1">{{ errors.name[0] }}</p>
    </div>

    <div>
      <label :for="id('description')" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{{ t('catalog.categoryForm.descriptionOptional') }}</label>
      <textarea :id="id('description')" v-model="form.description" rows="3" :class="inputCls"></textarea>
      <p v-if="errors.description" class="text-red-500 dark:text-rose-400 text-xs mt-1">{{ errors.description[0] }}</p>
    </div>

    <div class="flex gap-2">
      <button type="button" @click="$emit('cancel')" class="flex-1 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-slate-300 py-3 sm:py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
        {{ t('common.actions.cancel') }}
      </button>
      <button type="submit" class="flex-1 bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-3 sm:py-2.5 rounded-lg text-sm font-medium cursor-pointer">
        {{ isEdit ? t('catalog.common.saveChanges') : t('common.actions.create') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Object, default: null },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit', 'cancel'])

const uid = 'cf-' + Math.random().toString(36).slice(2, 8)
const id = (name) => `${uid}-${name}`

// Phones: text-base (16px) so iOS Safari does not zoom on focus, taller fields for thumbs.
const inputCls = 'w-full border rounded-lg px-3 py-3 sm:py-2 text-base sm:text-sm bg-white text-slate-900 border-gray-300 dark:bg-slate-900/60 dark:text-slate-100 dark:border-white/15'

const isEdit = computed(() => !!props.modelValue)
const form = ref({ name: '', description: '' })

watch(() => props.modelValue, (val) => {
  form.value = val ? { name: val.name, description: val.description } : { name: '', description: '' }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>
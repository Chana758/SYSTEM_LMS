<template>
  <div class="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[240px]">
        <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('catalog.searchPlaceholder')"
          class="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:outline-emerald-600 transition-all shadow-2xs"
        />
      </div>

      <select v-model="categoryId" class="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:outline-emerald-600 cursor-pointer">
        <option value="">{{ t('catalog.allCategories') }}</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <select v-model="status" class="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:outline-emerald-600 cursor-pointer min-w-[150px]">
        <option value="">{{ t('catalog.allStatuses') }}</option>
        <option value="available">{{ t('catalog.statusAvailable') }}</option>
        <option value="damaged">{{ t('catalog.statusDamaged') }}</option>
        <option value="lost">{{ t('catalog.statusLost') }}</option>
        <option value="archived">{{ t('catalog.statusArchived') }}</option>
      </select>

      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ search: '', category_id: '', status: '' }) },
  categories: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'change'])

const { t } = useI18n()
const search = ref(props.modelValue.search || '')
const categoryId = ref(props.modelValue.category_id || '')
const status = ref(props.modelValue.status || '')

function apply() {
  emit('update:modelValue', { search: search.value, category_id: categoryId.value, status: status.value })
  emit('change')
}
const applyDebounced = debounce(apply, 400)

watch(search, applyDebounced)
watch([categoryId, status], apply)
onBeforeUnmount(() => applyDebounced.cancel())
</script>
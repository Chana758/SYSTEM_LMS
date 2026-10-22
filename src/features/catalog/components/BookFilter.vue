<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-3 sm:p-4 shadow-sm">
    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
      <div class="relative w-full sm:w-auto sm:flex-1 sm:min-w-[240px]">
        <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('catalog.searchPlaceholder')"
          class="w-full bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:outline-emerald-600 dark:focus:outline-emerald-400 transition-all shadow-2xs"
        />
      </div>

      <select v-model="categoryId" class="flex-1 sm:flex-none min-w-0 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/15 rounded-xl px-3 sm:px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-100 dark:[color-scheme:dark] outline-none focus:outline-emerald-600 dark:focus:outline-emerald-400 cursor-pointer">
        <option value="">{{ t('catalog.allCategories') }}</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <select v-model="status" class="flex-1 sm:flex-none min-w-0 sm:min-w-[150px] bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/15 rounded-xl px-3 sm:px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-100 dark:[color-scheme:dark] outline-none focus:outline-emerald-600 dark:focus:outline-emerald-400 cursor-pointer">
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
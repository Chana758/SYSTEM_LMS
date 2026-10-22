<template>
  <div class="relative">
    <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
    <input
      v-model="query"
      @input="debouncedEmit"
      type="text"
      :placeholder="t('digitalLibrary.searchPlaceholder')"
      class="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 dark:focus:ring-emerald-400/20 focus:border-green-600 dark:focus:border-emerald-400 transition-colors"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const emit = defineEmits(['search'])
const query = ref('')

const debouncedEmit = debounce(() => emit('search', query.value), 350)
</script>
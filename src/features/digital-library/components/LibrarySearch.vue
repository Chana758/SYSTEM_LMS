<template>
  <div class="relative">
    <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
    <input
      v-model="query"
      @input="debouncedEmit"
      type="text"
      placeholder="Search e-books by title, author..."
      class="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { debounce } from 'lodash'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['search'])
const query = ref('')

const debouncedEmit = debounce(() => emit('search', query.value), 350)
</script>
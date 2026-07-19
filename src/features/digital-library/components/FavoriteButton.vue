<template>
  <button
    @click="handleToggle"
    :disabled="loading"
    class="flex items-center gap-2 border rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
    :class="isFav ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
  >
    <HeartIcon v-if="!isFav" class="w-4 h-4" />
    <HeartIconSolid v-else class="w-4 h-4" />
    {{ isFav ? 'Favorited' : 'Add to Favorites' }}
  </button>
</template>

<script setup>
import { ref, watch } from 'vue'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/vue/24/solid'
import { useLibraryStore } from '../store/libraryStore'

const props = defineProps({
  ebookId: { type: [Number, String], required: true },
  initialFavorited: { type: Boolean, default: false },
})

const store = useLibraryStore()
const loading = ref(false)
const isFav = ref(props.initialFavorited)

watch(() => props.initialFavorited, (v) => { isFav.value = v })

async function handleToggle() {
  loading.value = true
  const result = await store.toggleFavorite(props.ebookId)
  loading.value = false
  if (result.success) isFav.value = result.isFavorited
}
</script>
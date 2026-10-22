<template>
  <router-link
    :to="{ name: 'book-detail', params: { id: book.id } }"
    @click="$emit('click', book.id)"
    class="relative bg-white dark:bg-slate-800/50 rounded-xl border border-stone-200 dark:border-white/10 overflow-hidden hover:shadow-md dark:hover:shadow-black/40 hover:-translate-y-0.5 dark:hover:border-emerald-400/40 transition-all group block"
  >
    <span class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 dark:bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>

    <div class="aspect-[3/4] bg-stone-50 dark:bg-slate-800 overflow-hidden">
      <img
        v-if="coverUrl"
        :src="coverUrl"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <BookOpenIcon class="w-8 h-8 text-stone-300 dark:text-slate-600" />
      </div>
    </div>
    <div class="p-3">
      <p class="text-sm font-semibold text-stone-800 dark:text-white line-clamp-1">{{ book.title }}</p>
      <p class="text-xs text-stone-400 dark:text-slate-400 line-clamp-1 mt-0.5">{{ book.author }}</p>
      <div class="flex items-center justify-between mt-1.5">
        <span
          v-if="book.category?.name"
          class="text-[10px] font-medium text-green-700 dark:text-emerald-300 bg-green-50 dark:bg-emerald-500/15 rounded-full px-2 py-0.5 line-clamp-1"
        >
          {{ book.category.name }}
        </span>
        <span v-else></span>
        <span class="flex items-center gap-1 flex-shrink-0">
          <StarIcon class="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
          <span class="text-xs font-medium text-stone-600 dark:text-slate-300">{{ Number(book.rating_avg ?? 0).toFixed(1) }}</span>
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BookOpenIcon, StarIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  book: { type: Object, required: true },
})
defineEmits(['click'])

const failed = ref(false)

const coverUrl = computed(() => {
  if (!props.book.cover_image || failed.value) return null
  if (/^https?:\/\//i.test(props.book.cover_image)) {
    return props.book.cover_image
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${props.book.cover_image}`
})

function handleImageError() {
  failed.value = true
}
</script>
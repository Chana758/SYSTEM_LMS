<template>
  <router-link
    :to="{ name: 'library-detail-page', params: { id: ebook.id } }"
    class="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-200 transition-all"
  >
    <div class="relative aspect-[3/4] bg-gray-100 overflow-hidden">
      <img
        v-if="ebook.book?.cover_image"
        :src="coverUrl(ebook.book.cover_image)"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-4xl text-gray-300">📖</div>

      <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
        :class="ebook.access_type === 'public' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
        {{ ebook.access_type === 'public' ? 'Public' : 'Members' }}
      </span>
      <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/60 text-white">
        {{ ebook.format }}
      </span>
    </div>

    <div class="p-3">
      <p class="font-semibold text-gray-800 text-sm line-clamp-1">{{ ebook.book?.title }}</p>
      <p class="text-xs text-gray-400 line-clamp-1 mt-0.5">{{ ebook.book?.author }}</p>
      <div class="flex items-center justify-between mt-2">
        <span class="text-xs text-gray-400">{{ ebook.book?.category?.name || '—' }}</span>
        <span class="flex items-center gap-1 text-xs text-gray-400">
          <ArrowDownTrayIcon class="w-3 h-3" /> {{ ebook.download_count }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

defineProps({ ebook: { type: Object, required: true } })

function coverUrl(path) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}
</script>
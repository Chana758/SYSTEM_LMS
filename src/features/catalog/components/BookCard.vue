<template>
  <div
    class="bg-white rounded-2xl border border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
    @click="$emit('select', book)"
  >
    <div class="p-3 pb-0">
      <div class="relative rounded-xl overflow-hidden bg-slate-100 aspect-[2/3]">
        <div class="absolute left-0 top-0 bottom-0 w-2 bg-black/15 z-10 pointer-events-none"></div>

        <img
          v-if="cover && !coverFailed"
          :src="cover"
          :alt="book.title"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          @error="coverFailed = true"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 via-white to-slate-100">
          <span class="text-4xl opacity-50">📖</span>
          <span class="text-[10px] px-2 text-center text-slate-400 line-clamp-2 font-bold">{{ book.category?.name }}</span>
        </div>

        <span
          class="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-xs z-20 uppercase tracking-wider"
          :class="badgeClass(book.status)"
        >
          {{ label(book.status) }}
        </span>

        <span
          class="absolute bottom-2.5 right-2.5 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs backdrop-blur-md z-20"
          :class="book.available_qty > 0 ? 'bg-white/90 text-slate-900 border border-slate-200/50' : 'bg-slate-900/90 text-white'"
        >
          {{ book.available_qty }} / {{ book.total_qty }}
        </span>

        <div v-if="book.available_qty === 0" class="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center z-10 p-4">
          <span class="text-white text-[10px] font-black uppercase tracking-wider border border-white/40 rounded-lg px-2.5 py-1 text-center shadow-md">
            {{ t('catalog.borrowedOut') }}
          </span>
        </div>
      </div>

      <div class="mt-3 px-1">
        <span class="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block">{{ book.category?.name || 'General' }}</span>
        <h3 class="font-extrabold text-sm text-slate-900 line-clamp-1 mt-0.5 group-hover:text-emerald-700 transition-colors">{{ book.title }}</h3>
      </div>
    </div>

    <div class="p-4 pt-3 flex items-center justify-between mt-2 border-t border-slate-200 bg-slate-50/70">
      <div class="flex items-center gap-1">
        <span class="text-amber-400 text-xs">★</span>
        <span class="text-xs text-slate-900 font-extrabold">{{ Number(book.rating_avg || 0).toFixed(1) }}</span>
        <span class="text-[10px] text-slate-400 font-medium">({{ book.rating_count || 0 }})</span>
      </div>
      <span class="text-[11px] font-medium text-slate-500 truncate max-w-[50%]" :title="book.author">{{ book.author }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { coverUrl } from '@/utils/coverUrl'
import { useBookStatus } from '../composables/useBookStatus'

const props = defineProps({ book: { type: Object, required: true } })
defineEmits(['select'])

const { t } = useI18n()
const { badgeClass, label } = useBookStatus()
const coverFailed = ref(false)
const cover = computed(() => coverUrl(props.book.cover_image))
</script>
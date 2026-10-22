<template>
  <div>
    <!--  LOADING  -->
    <template v-if="loading">
      <!-- phones -->
      <div class="md:hidden space-y-3">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 shadow-sm animate-pulse flex gap-3">
          <div class="w-14 h-20 bg-slate-200 dark:bg-slate-700/50 rounded-lg flex-shrink-0"></div>
          <div class="flex-1 space-y-2 pt-1">
            <div class="h-3 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
            <div class="h-3 w-1/2 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
            <div class="h-3 w-1/3 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
          </div>
        </div>
      </div>
      <!-- md+ -->
      <div class="hidden md:block bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-14 bg-slate-200 dark:bg-slate-700/50 rounded-lg"></div>
                  <div class="h-3 w-32 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
                </div>
              </td>
              <td class="py-3 px-4"><div class="h-3 w-24 bg-slate-200 dark:bg-slate-700/50 rounded"></div></td>
              <td class="py-3 px-4"><div class="h-3 w-20 bg-slate-200 dark:bg-slate-700/50 rounded"></div></td>
              <td class="py-3 px-4"><div class="h-3 w-20 bg-slate-200 dark:bg-slate-700/50 rounded"></div></td>
              <td class="py-3 px-4"><div class="h-3 w-12 bg-slate-200 dark:bg-slate-700/50 rounded mx-auto"></div></td>
              <td class="py-3 px-4"><div class="h-5 w-16 bg-slate-200 dark:bg-slate-700/50 rounded-full mx-auto"></div></td>
              <td v-if="canManage" class="py-3 px-4"><div class="h-4 w-12 bg-slate-200 dark:bg-slate-700/50 rounded ml-auto"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!--  EMPTY  -->
    <div
      v-else-if="!books.length"
      class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm py-12 text-center text-slate-400 dark:text-slate-500"
    >
      <p class="text-xs font-bold uppercase tracking-wider">{{ t('catalog.noBooksFound') }}</p>
    </div>

    <template v-else>
      <!--  CARD LIST (phones)  -->
      <div class="md:hidden space-y-3">
        <div
          v-for="book in books"
          :key="book.id"
          class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 shadow-sm active:scale-[0.99] transition cursor-pointer"
          @click="$emit('select', book)"
        >
          <div class="flex gap-3">
            <div class="w-14 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700/50 flex-shrink-0 shadow-xs">
              <img v-if="book.cover_image" :src="coverUrl(book.cover_image)" :alt="book.title" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-500/15 dark:to-slate-800">
                <span class="text-sm">📖</span>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{{ book.title }}</p>
                <span class="inline-block text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider flex-shrink-0" :class="badgeClass(book.status)">
                  {{ label(book.status) }}
                </span>
              </div>
              <p class="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate mt-0.5">{{ book.author }}</p>
              <div class="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-bold">
                <span>★</span>
                <span>{{ Number(book.rating_avg || 0).toFixed(1) }}</span>
                <span class="text-slate-400 dark:text-slate-500 font-normal">({{ book.rating_count || 0 }})</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-3">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              {{ book.category?.name || 'General' }}
            </span>
            <span v-if="book.isbn" class="font-mono text-[11px] text-slate-500 dark:text-slate-400">{{ book.isbn }}</span>
            <span class="ml-auto text-xs">
              <span class="font-extrabold" :class="book.available_qty > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">{{ book.available_qty }}</span>
              <span class="text-slate-400 dark:text-slate-500 font-medium"> / {{ book.total_qty }}</span>
            </span>
          </div>

          <div v-if="canManage" class="grid grid-cols-2 gap-2 mt-4" @click.stop>
            <button
              type="button"
              class="h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
              @click="$emit('edit', book)"
            >
              <PencilSquareIcon class="w-4 h-4" />
              <span>{{ t('common.edit') }}</span>
            </button>
            <button
              type="button"
              class="h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200/60 dark:border-rose-500/20 active:scale-[0.98] transition cursor-pointer"
              @click="$emit('delete', book)"
            >
              <TrashIcon class="w-4 h-4" />
              <span>{{ t('common.delete') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TABLE (md and up) -->
      <div class="hidden md:block bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th class="py-3.5 px-4">{{ t('catalog.table.title') }}</th>
                <th class="py-3.5 px-4">{{ t('catalog.table.author') }}</th>
                <th class="py-3.5 px-4">{{ t('catalog.table.isbn') }}</th>
                <th class="py-3.5 px-4">{{ t('catalog.table.category') }}</th>
                <th class="py-3.5 px-4 text-center">{{ t('catalog.table.copies') }}</th>
                <th class="py-3.5 px-4 text-center">{{ t('catalog.table.status') }}</th>
                <th v-if="canManage" class="py-3.5 px-4 text-right">{{ t('catalog.table.actions') }}</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200 dark:divide-white/5">
              <tr
                v-for="book in books"
                :key="book.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                @click="$emit('select', book)"
              >
                <!-- Title + Cover -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700/50 flex-shrink-0 relative shadow-xs">
                      <img
                        v-if="book.cover_image"
                        :src="coverUrl(book.cover_image)"
                        :alt="book.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-500/15 dark:to-slate-800">
                        <span class="text-xs">📖</span>
                      </div>
                    </div>
                    <div>
                      <p class="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {{ book.title }}
                      </p>
                      <div class="flex items-center gap-1 mt-0.5 text-[10px] text-amber-500 font-bold">
                        <span>★</span>
                        <span>{{ Number(book.rating_avg || 0).toFixed(1) }}</span>
                        <span class="text-slate-400 dark:text-slate-500 font-normal">({{ book.rating_count || 0 }})</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{{ book.author }}</td>

                <td class="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">{{ book.isbn || '-' }}</td>

                <td class="py-3 px-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {{ book.category?.name || 'General' }}
                  </span>
                </td>

                <td class="py-3 px-4 text-center">
                  <span
                    class="font-extrabold"
                    :class="book.available_qty > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
                  >
                    {{ book.available_qty }}
                  </span>
                  <span class="text-slate-400 dark:text-slate-500 font-medium"> / {{ book.total_qty }}</span>
                </td>

                <td class="py-3 px-4 text-center">
                  <span
                    class="inline-block text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider"
                    :class="badgeClass(book.status)"
                  >
                    {{ label(book.status) }}
                  </span>
                </td>

                <td v-if="canManage" class="py-3 px-4 text-right" @click.stop>
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="p-1.5 text-slate-400 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition"
                      :title="t('common.edit')"
                      @click="$emit('edit', book)"
                    >
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      class="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition"
                      :title="t('common.delete')"
                      @click="$emit('delete', book)"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { coverUrl } from '@/utils/coverUrl'
import { useBookStatus } from '../composables/useBookStatus'

defineProps({
  books: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  canManage: { type: Boolean, default: false },
})

defineEmits(['select', 'edit', 'delete'])

const { t } = useI18n()
const { badgeClass, label } = useBookStatus()
</script>
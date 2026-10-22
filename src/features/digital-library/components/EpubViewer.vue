<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
    <!-- EPUB pages render on a white sheet, so keep the reading area light for contrast -->
    <div ref="viewerEl" class="bg-white" style="height: 70dvh;"></div>
    <div class="flex items-center justify-between px-2 sm:px-4 py-1 border-t border-gray-100 dark:border-white/10">
      <button @click="prev" class="px-3 py-3 text-sm text-gray-500 dark:text-slate-300 hover:text-green-700 dark:hover:text-emerald-300 transition-colors cursor-pointer">‹ {{ t('digitalLibrary.reader.previous') }}</button>
      <span class="text-xs text-gray-400 dark:text-slate-500">{{ Math.round(percentage) }}% {{ t('digitalLibrary.reader.read') }}</span>
      <button @click="next" class="px-3 py-3 text-sm text-gray-500 dark:text-slate-300 hover:text-green-700 dark:hover:text-emerald-300 transition-colors cursor-pointer">{{ t('digitalLibrary.reader.next') }} ›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import ePub from 'epubjs'
import debounce from 'lodash/debounce'
import { useLibraryStore } from '../store/libraryStore'

const { t } = useI18n()

const props = defineProps({
  fileUrl: { type: String, required: true },
  ebookId: { type: [Number, String], required: true },
  initialLocation: { type: String, default: null },
})

const store = useLibraryStore()
const viewerEl = ref(null)
const percentage = ref(0)

let book = null
let rendition = null

const saveProgress = debounce((location, pct) => {
  // last_page here stores the CFI-derived spine index as a stand-in "page"
  store.saveProgress(props.ebookId, location?.start?.index ?? 1, pct)
}, 1500)

onMounted(() => {
  book = ePub(props.fileUrl)
  rendition = book.renderTo(viewerEl.value, { width: '100%', height: '100%' })
  rendition.display(props.initialLocation || undefined)

  book.locations.generate(1000).then(() => {
    rendition.on('relocated', (location) => {
      const pct = book.locations.percentageFromCfi(location.start.cfi) * 100
      percentage.value = pct
      saveProgress(location, pct)
    })
  })
})

onBeforeUnmount(() => {
  rendition?.destroy()
  book?.destroy()
})

function next() { rendition?.next() }
function prev() { rendition?.prev() }
</script>
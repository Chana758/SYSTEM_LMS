<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div ref="viewerEl" style="height: 75vh;"></div>
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <button @click="prev" class="text-sm text-gray-500 hover:text-green-700">‹ Previous</button>
      <span class="text-xs text-gray-400">{{ Math.round(percentage) }}% read</span>
      <button @click="next" class="text-sm text-gray-500 hover:text-green-700">Next ›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ePub from 'epubjs'
import { debounce } from 'lodash'
import { useLibraryStore } from '../store/libraryStore'

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
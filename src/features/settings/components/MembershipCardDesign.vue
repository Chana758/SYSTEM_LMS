<template>
  <!-- Library ID card preview (CR80 size). Same markup as the print window. -->
  <div ref="wrap" class="w-full">
    <div class="flex items-center justify-center gap-1 mb-3">
      <button
        v-for="s in sides"
        :key="s.key"
        type="button"
        @click="side = s.key"
        class="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition"
        :class="side === s.key
          ? 'bg-emerald-700 text-white'
          : 'bg-gray-100 dark:bg-slate-700/60 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="flex justify-center">
      <div
        class="rounded-[12px] shadow-xl shadow-black/15 dark:shadow-black/40 ring-1 ring-black/5"
        :style="{ zoom: scale }"
        v-html="html"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useBrandingStore } from '@/stores/brandingStore'
import defaultLogo from '@/assets/images/logoh6.jpg'
import { CARD_CSS, CARD_W_PX, cardBackHtml, cardFrontHtml } from '@/utils/membershipCardMarkup'

const props = defineProps({
  qrDataUrl: { type: String, required: true },
  name: { type: String, default: '' },
  nameEn: { type: String, default: '' },
  avatarUrl: { type: String, default: null },
  role: { type: String, default: 'member' }, // 'member' | 'librarian' | 'admin'
  idLabel: { type: String, default: 'ID' },
  idValue: { type: [String, Number], default: '—' },
  className: { type: String, default: '' },
  memberType: { type: String, default: '' },
  subLabel: { type: String, default: '' },
  expiresAt: { type: String, default: null },
})

const branding = useBrandingStore()
const sides = [
  { key: 'front', label: 'មុខ · Front' },
  { key: 'back', label: 'ក្រោយ · Back' },
]
const side = ref('front')

const brand = computed(() => ({
  logoUrl: branding.logoUrl || defaultLogo,
  siteName: branding.siteName,
  siteNameAccent: branding.siteNameAccent,
}))

const html = computed(() => {
  const card = { ...props, idValue: String(props.idValue ?? '—') }
  const body = side.value === 'front' ? cardFrontHtml(card, brand.value) : cardBackHtml(card, brand.value)
  return `<style>${CARD_CSS}</style>${body}`
})

// Scale the real-size card (≈324 px wide) to the preview column, between 1× and 1.6×.
const wrap = ref(null)
const scale = ref(1.2)
let observer = null

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width
    scale.value = Math.max(0.8, Math.min(1.6, (width - 8) / CARD_W_PX))
  })
  if (wrap.value) observer.observe(wrap.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

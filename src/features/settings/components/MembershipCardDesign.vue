<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden shadow-md bg-white">
    <!-- Card Header -->
    <div class="p-4 text-white" :style="{ background: `linear-gradient(135deg, ${colors.grad})` }">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
            <span class="text-xs">📖</span>
          </div>
          <span class="text-xs font-bold tracking-wide">Library LMS</span>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-white/20">
          {{ role }}
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="px-4 pt-3 pb-4">
      <div class="flex items-end gap-3 -mt-8 mb-3">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          class="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0 bg-white"
        />
        <div
          v-else
          class="w-14 h-14 rounded-xl border-2 border-white shadow-sm flex items-center justify-center text-white font-black text-lg flex-shrink-0"
          :style="{ background: colors.accent }"
        >
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0 pb-0.5">
          <h3 class="font-extrabold text-gray-900 truncate text-sm leading-tight">{{ name }}</h3>
          <p class="text-[11px] font-semibold mt-0.5 truncate" :style="{ color: colors.accent }">
            {{ subLabel }}
          </p>
        </div>
      </div>

      <div class="rounded-lg p-2.5 mb-3" :style="{ background: colors.box }">
        <p class="text-[9px] font-extrabold uppercase tracking-wider" :style="{ color: colors.accent }">
          {{ idLabel }}
        </p>
        <p class="text-sm font-mono font-black text-gray-800 mt-0.5">{{ idValue }}</p>
      </div>

      <div class="flex items-center gap-3">
        <img :src="qrDataUrl" class="w-16 h-16 rounded-lg border border-gray-100 p-1 bg-white shadow-2xs flex-shrink-0" />
        <div class="text-[10px] text-gray-500 leading-relaxed">
          <p>{{ t('settings.cardApprovals.scanHint') }}</p>
          <p class="font-bold mt-1" :style="{ color: colors.accent }">
            {{ t('settings.cardApprovals.validUntil', { date: formattedExpiry }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="border-t border-dashed border-gray-200 py-1.5 text-center">
      <p class="text-[8px] font-extrabold uppercase tracking-widest" :style="{ color: colors.accent }">
        {{ t('settings.cardApprovals.officialCard') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  qrDataUrl: { type: String, required: true },
  name: { type: String, default: '' },
  avatarUrl: { type: String, default: null },
  role: { type: String, default: 'member' }, // 'member' | 'librarian' | 'admin'
  idLabel: { type: String, default: 'ID' },
  idValue: { type: [String, Number], default: '—' },
  subLabel: { type: String, default: '' },
  expiresAt: { type: String, default: null },
})

const THEME_COLORS = {
  member:    { grad: '#047857, #065f46', accent: '#047857', box: '#ecfdf5' },
  librarian: { grad: '#1d4ed8, #3730a3', accent: '#1d4ed8', box: '#eff6ff' },
  admin:     { grad: '#d97706, #c2410c', accent: '#d97706', box: '#fffbeb' },
}

const colors = computed(() => THEME_COLORS[props.role] || THEME_COLORS.member)

const initials = computed(() =>
  (props.name || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
)

const formattedExpiry = computed(() => {
  if (!props.expiresAt) return '—'
  return new Date(props.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
})
</script>
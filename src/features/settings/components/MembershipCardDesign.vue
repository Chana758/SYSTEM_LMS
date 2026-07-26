<template>
  <div
    class="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl border"
    :class="theme.border"
  >
    <!-- Header with gradient -->
    <div class="relative px-5 pt-4 pb-10 bg-gradient-to-br" :class="theme.gradient">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <span class="text-white text-sm font-bold tracking-wide">Library LMS</span>
        <span class="ml-auto text-[10px] font-black uppercase tracking-widest text-white bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
          {{ role }}
        </span>
      </div>
    </div>

    <!-- Avatar overlapping header -->
    <div class="px-5 -mt-8">
      <div class="flex items-end gap-4">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          class="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0 bg-white"
          alt="Photo"
        />
        <div
          v-else
          class="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0 text-white text-2xl font-black bg-gradient-to-br"
          :class="theme.avatarFallback"
        >
          {{ initials }}
        </div>

        <div class="flex-1 min-w-0 pb-1">
          <p class="text-base font-black text-gray-900 truncate leading-tight">{{ name }}</p>
          <p v-if="subLabel" class="text-xs font-semibold mt-0.5" :class="theme.accentText">{{ subLabel }}</p>
        </div>
      </div>
    </div>

    <!-- ID + QR -->
    <div class="p-5 pt-4">
      <div class="rounded-xl p-3.5 mb-4" :class="theme.idBox">
        <p class="text-[10px] font-black uppercase tracking-widest" :class="theme.accentText">{{ idLabel }}</p>
        <p class="text-lg font-mono font-black text-gray-800 tracking-wide">{{ idValue }}</p>
      </div>

      <div class="flex items-center gap-4">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR code" class="w-24 h-24 border-2 rounded-xl flex-shrink-0 p-1 bg-white" :class="theme.qrBorder" />
        <div class="flex-1 text-xs text-gray-500 space-y-1">
          <p class="font-medium">Scan at the library kiosk to log in instantly.</p>
          <p v-if="expiresAt" class="font-bold" :class="theme.accentText">Valid until {{ formatDate(expiresAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-dashed" :class="theme.border">
      <p class="text-center text-[10px] font-bold py-2 tracking-widest uppercase" :class="theme.accentText">
        Official Library Card
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  qrDataUrl: { type: String, default: '' },
  name: { type: String, required: true },
  avatarUrl: { type: String, default: null },
  role: { type: String, default: 'member' }, // member | librarian | admin
  idLabel: { type: String, default: 'Membership No.' },
  idValue: { type: String, default: '—' },
  subLabel: { type: String, default: '' },
  expiresAt: { type: String, default: null },
})

const initials = computed(() =>
  (props.name || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
)

// Color theme per role — green for members, blue for librarians,
// amber/gold for admins. Keeps the same layout but gives each role
// its own visual identity at a glance.
const themes = {
  member: {
    gradient: 'from-emerald-700 to-emerald-800',
    border: 'border-emerald-100',
    idBox: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    qrBorder: 'border-emerald-100',
    avatarFallback: 'from-emerald-600 to-emerald-800',
  },
  librarian: {
    gradient: 'from-blue-700 to-indigo-800',
    border: 'border-blue-100',
    idBox: 'bg-blue-50',
    accentText: 'text-blue-700',
    qrBorder: 'border-blue-100',
    avatarFallback: 'from-blue-600 to-indigo-800',
  },
  admin: {
    gradient: 'from-amber-600 to-orange-700',
    border: 'border-amber-100',
    idBox: 'bg-amber-50',
    accentText: 'text-amber-700',
    qrBorder: 'border-amber-100',
    avatarFallback: 'from-amber-500 to-orange-700',
  },
}

const theme = computed(() => themes[props.role] || themes.member)

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
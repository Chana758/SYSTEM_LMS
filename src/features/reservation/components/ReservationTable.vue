<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-gray-400 dark:text-slate-500 text-sm">{{ $t('reservation.loadingReservations') }}</div>

    <!-- Empty -->
    <div v-else-if="!reservations.length" class="py-14">
      <div class="flex flex-col items-center gap-1.5 px-4 text-center">
        <span class="text-2xl">🗂️</span>
        <p class="text-gray-500 dark:text-slate-300 text-sm font-medium">{{ $t('reservation.noReservationsFound') }}</p>
        <p class="text-gray-400 dark:text-slate-500 text-xs">{{ $t('reservation.adjustSearchOrStatus') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- ============ MOBILE: card list (each card opens the detail page) ============ -->
      <ul class="md:hidden divide-y divide-gray-100 dark:divide-white/10">
        <li
          v-for="r in reservations" :key="r.id"
          tabindex="0"
          role="link"
          class="p-4 space-y-3 cursor-pointer active:bg-emerald-50/60 dark:active:bg-emerald-400/10 transition-colors"
          @click="$emit('rowClick', r.id)"
          @keydown.enter="$emit('rowClick', r.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {{ getInitials(r.member?.user?.name) }}
              </div>
              <div class="min-w-0">
                <p class="font-medium text-gray-800 dark:text-white truncate">{{ r.member?.user?.name || '—' }}</p>
                <p class="text-xs text-gray-400 dark:text-slate-500 truncate">{{ r.member?.membership_no || '' }}</p>
              </div>
            </div>
            <ReservationStatusBadge :status="r.status" class="flex-shrink-0" />
          </div>

          <!-- Title row: the chevron tells the user the whole card is tappable -->
          <div class="flex items-center justify-between gap-3">
            <p class="min-w-0 font-serif text-gray-700 dark:text-slate-200 font-semibold leading-snug break-words">{{ r.book?.title || '—' }}</p>
            <span class="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200/70 dark:border-emerald-400/20 flex items-center justify-center">
              <ChevronRightIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
            <span class="inline-flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-200 text-[10px] font-serif font-bold">{{ r.priority_order || 1 }}</span>
            </span>
            <span>{{ $t('reservation.reserved') }}: {{ formatDate(r.reserved_date) }}</span>
            <span>{{ $t('reservation.expires') }}: {{ formatDate(r.expire_date) }}</span>
          </div>

          <!-- Actions: stop propagation so they don't open the detail page -->
          <div v-if="r.status === 'ready' || ['pending', 'ready'].includes(r.status)" class="flex items-center gap-2" @click.stop>
            <button
              v-if="r.status === 'ready'"
              @click="$emit('fulfill', r.id)"
              class="flex-1 h-9 rounded-xl border border-emerald-200 dark:border-emerald-400/25 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer"
            >
              {{ $t('reservation.fulfill') }}
            </button>
            <button
              v-if="['pending', 'ready'].includes(r.status)"
              @click="$emit('cancel', r.id)"
              class="flex-1 h-9 rounded-xl border border-rose-200 dark:border-rose-400/25 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs font-bold cursor-pointer"
            >
              {{ $t('reservation.cancel') }}
            </button>
          </div>
        </li>
      </ul>

      <!-- ============ DESKTOP: table ============ -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[820px] text-sm">
          <thead class="bg-gray-50/80 dark:bg-white/5 text-gray-400 dark:text-slate-400 text-[11px] uppercase tracking-wide">
            <tr>
              <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.member') }}</th>
              <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.book') }}</th>
              <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.reserved') }}</th>
              <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.expires') }}</th>
              <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.priority') }}</th>
              <th class="text-left px-4 py-3 font-semibold">{{ $t('reservation.status') }}</th>
              <th class="text-right px-4 py-3 font-semibold">{{ $t('reservation.actions') }}</th>
              <th class="w-10 px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in reservations" :key="r.id"
              tabindex="0"
              class="relative border-t border-gray-100 dark:border-white/10 cursor-pointer transition-colors group
                     hover:bg-emerald-50/60 dark:hover:bg-emerald-400/10
                     focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-500"
              @click="$emit('rowClick', r.id)"
              @keydown.enter="$emit('rowClick', r.id)"
            >
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                    {{ getInitials(r.member?.user?.name) }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{{ r.member?.user?.name || '—' }}</p>
                    <p class="text-xs text-gray-400 dark:text-slate-500">{{ r.member?.membership_no || '' }}</p>
                  </div>
                </div>
              </td>

              <td class="px-4 py-3.5 max-w-[260px]">
                <p class="font-serif text-gray-700 dark:text-slate-200 line-clamp-1 font-semibold group-hover:underline decoration-emerald-500/60 underline-offset-4" :title="r.book?.title">{{ r.book?.title || '—' }}</p>
              </td>

              <td class="px-4 py-3.5 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">{{ formatDate(r.reserved_date) }}</td>
              <td class="px-4 py-3.5 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">{{ formatDate(r.expire_date) }}</td>

              <td class="px-4 py-3.5">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-200 text-[11px] font-serif font-bold">
                  {{ r.priority_order || 1 }}
                </span>
              </td>

              <td class="px-4 py-3.5">
                <ReservationStatusBadge :status="r.status" />
              </td>

              <td class="px-4 py-3.5 text-right space-x-3 whitespace-nowrap" @click.stop>
                <button
                  v-if="r.status === 'ready'"
                  @click="$emit('fulfill', r.id)"
                  class="text-green-700 dark:text-emerald-400 hover:underline text-xs font-medium cursor-pointer"
                >
                  {{ $t('reservation.fulfill') }}
                </button>
                <button
                  v-if="['pending', 'ready'].includes(r.status)"
                  @click="$emit('cancel', r.id)"
                  class="text-red-500 dark:text-rose-400 hover:underline text-xs font-medium cursor-pointer"
                >
                  {{ $t('reservation.cancel') }}
                </button>
              </td>

              <td class="pr-3 text-right">
                <ChevronRightIcon
                  class="w-4 h-4 inline-block text-gray-300 dark:text-slate-600 transition-all duration-200
                         group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import ReservationStatusBadge from './ReservationStatusBadge.vue'

defineProps({
  reservations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['rowClick', 'fulfill', 'cancel'])

function getInitials(name) {
  if (!name) return 'M'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
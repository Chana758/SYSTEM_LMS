<template>
  <router-link :to="to" class="relative inline-flex p-2 rounded-xl hover:bg-white/10 transition" :aria-label="'Notifications'">
    <BellIcon class="w-6 h-6" />
    <span
      v-if="count > 0"
      class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white"
    >
      {{ count > 99 ? '99+' : count }}
    </span>
  </router-link>
</template>

<script setup>
import { BellIcon } from '@heroicons/vue/24/outline'

defineProps({
  count: { type: Number, default: 0 },
  to: { type: [String, Object], default: '/notifications' },
})
</script>
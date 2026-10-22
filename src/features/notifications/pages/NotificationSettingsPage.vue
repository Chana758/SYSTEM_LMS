<template>
  <div class="space-y-4 sm:space-y-6 pb-12 max-w-2xl">
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-none flex items-center gap-3 sm:gap-4">
      <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/30 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-300 flex-shrink-0">
        <Cog6ToothIcon class="w-6 h-6" />
      </div>
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('notifications.settingsPage.title') }}</h1>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('notifications.settingsPage.subtitle') }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-3 sm:p-6 md:p-8 shadow-lg dark:shadow-none space-y-5 sm:space-y-6 border-dashed">

      <!-- Browser push -->
      <div class="bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border-2 border-slate-200 dark:border-white/10 p-4 sm:p-5 shadow-2xs space-y-3">
        <div class="flex items-center justify-between gap-3 sm:gap-4">
          <div class="space-y-1 min-w-0">
            <p class="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">{{ t('notifications.settingsPage.browserPushAlerts') }}</p>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ t('notifications.settingsPage.browserPushDesc') }}</p>
          </div>
          <button
            type="button"
            @click="toggleBrowserPush"
            :class="switchCls(store.prefs.browserPush)"
            role="switch"
            :aria-checked="store.prefs.browserPush"
          >
            <span :class="knobCls(store.prefs.browserPush)"></span>
          </button>
        </div>
        <p v-if="pushError" class="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/30 rounded-xl px-3 py-2">
          {{ t('notifications.settingsPage.pushBlocked') }}
        </p>
      </div>

      <div class="border-t border-slate-200/80 dark:border-white/10"></div>

      <!-- Mute by type -->
      <div class="space-y-4">
        <p class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{{ t('notifications.settingsPage.muteByType') }}</p>

        <div class="space-y-3">
          <div
            v-for="item in types" :key="item.value"
            class="bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border-2 border-slate-200 dark:border-white/10 p-3 sm:p-4 shadow-2xs flex items-center justify-between gap-3 sm:gap-4"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="TYPES[item.value].iconBg">
                <component :is="TYPES[item.value].icon" class="w-4 h-4 text-white" />
              </span>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{{ item.label }}</span>
            </div>
            <button
              type="button"
              @click="store.toggleMute(item.value)"
              :class="switchCls(isOn(item.value))"
              role="switch"
              :aria-checked="isOn(item.value)"
            >
              <span :class="knobCls(isOn(item.value))"></span>
            </button>
          </div>
        </div>
      </div>

      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-2">{{ t('notifications.settingsPage.savedNote') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { TYPES } from '../composables/useNotificationMeta'

const { t } = useI18n()
const router = useRouter()
const store = useNotificationStore()
const authStore = useAuthStore()
const pushError = ref(false)

// Members cannot access notification settings: send them back to the list
onMounted(() => {
  if (authStore.role === 'member') router.replace('/notifications')
})

const types = computed(() => [
  { value: 'overdue', label: t('notifications.settingsPage.typeOverdueReminders') },
  { value: 'reservation', label: t('notifications.settingsPage.typeReservationUpdates') },
  { value: 'fine', label: t('notifications.settingsPage.typeFineAlerts') },
  { value: 'announcement', label: t('notifications.settingsPage.typeAnnouncements') },
  { value: 'system', label: t('notifications.settingsPage.typeSystemMessages') },
])

// A switch is "on" when the type is NOT muted.
const isOn = (type) => !store.prefs.muted.includes(type)

// Track: relative so the absolute knob is positioned inside it.
const switchCls = (on) =>
  `relative w-12 h-7 rounded-xl transition-colors duration-200 flex-shrink-0 border-2 shadow-2xs cursor-pointer ${
    on
      ? 'bg-emerald-600 border-emerald-700 dark:border-emerald-500'
      : 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-white/15'
  }`

// Knob: fixed start point (left-0.5).  OFF = left (translate-x-0), ON = right (translate-x-5).
const knobCls = (on) =>
  `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-lg shadow-sm transition-transform duration-200 ${
    on ? 'translate-x-5' : 'translate-x-0'
  }`

async function toggleBrowserPush() {
  pushError.value = false
  const result = await store.setBrowserPush(!store.prefs.browserPush)
  if (result !== 'granted') pushError.value = true
}
</script>
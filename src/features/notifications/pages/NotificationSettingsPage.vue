<template>
  <div class="max-w-lg">
    <h1 class="text-xl font-bold text-gray-800 mb-5">Notification Settings</h1>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-800 text-sm">Browser Push Alerts</p>
          <p class="text-xs text-gray-400">Show a system popup when a new notification arrives while this tab is open.</p>
        </div>
        <button
          @click="toggleBrowserPush"
          class="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
          :class="settings.browserPush ? 'bg-green-600' : 'bg-gray-300'"
        >
          <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform" :class="settings.browserPush ? 'translate-x-5' : 'translate-x-0.5'"></span>
        </button>
      </div>

      <hr class="border-gray-100" />

      <p class="text-sm font-medium text-gray-800">Mute by type</p>
      <div v-for="t in types" :key="t.value" class="flex items-center justify-between">
        <span class="text-sm text-gray-600">{{ t.label }}</span>
        <button
          @click="toggleMute(t.value)"
          class="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
          :class="!settings.muted.includes(t.value) ? 'bg-green-600' : 'bg-gray-300'"
        >
          <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform" :class="!settings.muted.includes(t.value) ? 'translate-x-5' : 'translate-x-0.5'"></span>
        </button>
      </div>

      <p class="text-xs text-gray-400 pt-2">These preferences are saved on this device only.</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const types = [
  { value: 'overdue', label: 'Overdue reminders' },
  { value: 'reservation', label: 'Reservation updates' },
  { value: 'fine', label: 'Fine alerts' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'system', label: 'System messages' },
]

const STORAGE_KEY = 'notification_prefs'
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

const settings = reactive({
  browserPush: saved.browserPush ?? false,
  muted: saved.muted ?? [],
})

watch(settings, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

async function toggleBrowserPush() {
  if (!settings.browserPush && Notification?.permission !== 'granted') {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return
  }
  settings.browserPush = !settings.browserPush
}

function toggleMute(type) {
  const idx = settings.muted.indexOf(type)
  if (idx >= 0) settings.muted.splice(idx, 1)
  else settings.muted.push(type)
}
</script>
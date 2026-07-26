<template>
  <div class="space-y-6 pb-12 max-w-2xl">
    <!-- Header Banner matching redesign style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center gap-4">
      <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
        ⚙️
      </div>
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Notification Settings</h1>
        <p class="text-xs font-bold text-slate-500 mt-0.5">Manage how and when you receive alerts</p>
      </div>
    </div>

    <!-- Main Container -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-6 border-dashed">
      
      <!-- Browser Push Alerts Section -->
      <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-200 p-5 shadow-2xs flex items-center justify-between gap-4">
        <div class="space-y-1">
          <p class="font-black text-slate-900 text-sm uppercase tracking-wider">Browser Push Alerts</p>
          <p class="text-xs font-bold text-slate-500">Show a system popup when a new notification arrives while this tab is open.</p>
        </div>
        <button
          @click="toggleBrowserPush"
          class="w-12 h-7 rounded-xl transition-all relative flex-shrink-0 border-2 shadow-2xs cursor-pointer"
          :class="settings.browserPush ? 'bg-emerald-600 border-emerald-700' : 'bg-slate-200 border-slate-300'"
        >
          <span 
            class="absolute top-0.5 w-5 h-5 bg-white rounded-lg transition-transform shadow-sm"
            :class="settings.browserPush ? 'translate-x-5' : 'translate-x-0.5'"
          ></span>
        </button>
      </div>

      <div class="border-t border-slate-200/80"></div>

      <!-- Mute by type Section -->
      <div class="space-y-4">
        <p class="text-xs font-black text-slate-900 uppercase tracking-widest">Mute by type</p>
        
        <div class="space-y-3">
          <div 
            v-for="t in types" 
            :key="t.value" 
            class="bg-slate-50/70 rounded-xl border-2 border-slate-200 p-4 shadow-2xs flex items-center justify-between gap-4"
          >
            <span class="text-xs font-bold text-slate-700">{{ t.label }}</span>
            <button
              @click="toggleMute(t.value)"
              class="w-12 h-7 rounded-xl transition-all relative flex-shrink-0 border-2 shadow-2xs cursor-pointer"
              :class="!settings.muted.includes(t.value) ? 'bg-emerald-600 border-emerald-700' : 'bg-slate-200 border-slate-300'"
            >
              <span 
                class="absolute top-0.5 w-5 h-5 bg-white rounded-lg transition-transform shadow-sm"
                :class="!settings.muted.includes(t.value) ? 'translate-x-5' : 'translate-x-0.5'"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">These preferences are saved on this device only.</p>
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
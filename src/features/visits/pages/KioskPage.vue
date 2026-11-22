<template>
  <!-- B4.5 (Sam): the tablet at the library door. Scan a card (USB scanner or camera) to come in / go out. -->
  <div class="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white flex flex-col select-none">
    <!-- Top bar -->
    <header class="flex items-center justify-between px-6 sm:px-10 py-5">
      <div>
        <p class="text-xs uppercase tracking-widest text-emerald-300/80">{{ device?.location || t('visits.kiosk.library') }}</p>
        <h1 class="text-xl sm:text-2xl font-black">{{ device?.name || 'Smart Nexus' }}</h1>
      </div>
      <div class="text-right">
        <p class="text-3xl sm:text-4xl font-black tabular-nums">{{ clock }}</p>
        <p class="text-xs text-emerald-200/70">{{ today }}</p>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 grid lg:grid-cols-2 gap-6 px-6 sm:px-10 pb-6">
      <section class="flex flex-col items-center justify-center text-center gap-6">
        <div class="w-40 h-40 sm:w-48 sm:h-48 rounded-[2.5rem] bg-white/10 border border-white/15 flex items-center justify-center">
          <QrCodeIcon class="w-24 h-24 text-emerald-300" />
        </div>
        <div>
          <h2 class="text-3xl sm:text-4xl font-black leading-tight">{{ t('visits.kiosk.scanTitle') }}</h2>
          <p class="mt-3 text-emerald-100/80 text-lg">{{ t('visits.kiosk.scanHint') }}</p>
        </div>

        <div class="flex flex-wrap justify-center gap-3">
          <button type="button" @click="guestOpen = true"
            class="px-6 py-4 rounded-2xl bg-white text-emerald-900 font-black text-lg cursor-pointer active:scale-95 transition">
            {{ t('visits.kiosk.imGuest') }}
          </button>
          <button type="button" @click="openGuestList"
            class="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 font-bold text-lg cursor-pointer active:scale-95 transition">
            {{ t('visits.kiosk.guestLeaving') }}
          </button>
          <button type="button" @click="cameraOn = !cameraOn"
            class="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 font-bold text-lg cursor-pointer active:scale-95 transition">
            {{ cameraOn ? t('visits.kiosk.cameraOff') : t('visits.kiosk.cameraOn') }}
          </button>
        </div>
      </section>

      <section class="flex flex-col gap-5 justify-center">
        <div v-if="cameraOn" class="rounded-3xl overflow-hidden">
          <CameraScanner continuous auto-start :dedupe-ms="4000" @detected="submit" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-3xl bg-white/10 border border-white/15 p-6">
            <p class="text-sm text-emerald-200/80">{{ t('visits.kiosk.insideNow') }}</p>
            <p class="text-5xl font-black tabular-nums mt-1">{{ occupancy.inside ?? 0 }}</p>
          </div>
          <div class="rounded-3xl bg-white/10 border border-white/15 p-6">
            <p class="text-sm text-emerald-200/80">{{ t('visits.kiosk.seatsFree') }}</p>
            <p class="text-5xl font-black tabular-nums mt-1">
              {{ occupancy.free ?? '—' }}<span v-if="occupancy.capacity" class="text-xl text-emerald-200/60"> / {{ occupancy.capacity }}</span>
            </p>
          </div>
        </div>

        <p class="text-sm text-emerald-100/60 text-center lg:text-left">
          {{ t('visits.kiosk.hours', { open: settings.library_open_time || '—', close: settings.library_close_time || '—' }) }}
        </p>
      </section>
    </main>

    <footer class="px-6 sm:px-10 pb-4 flex items-center justify-between text-xs text-emerald-100/40">
      <span>{{ t('visits.kiosk.privacy') }}</span>
      <button type="button" @click="confirmLogout" class="underline cursor-pointer">{{ t('visits.kiosk.signOut') }}</button>
    </footer>

    <!-- Result overlay -->
    <transition name="fade">
      <div v-if="result" class="fixed inset-0 z-50 flex items-center justify-center p-6" :class="overlayClass" @click="result = null">
        <div class="text-center max-w-2xl">
          <component :is="resultIcon" class="w-28 h-28 mx-auto mb-6" />
          <p v-if="result.person?.name" class="text-4xl sm:text-5xl font-black">{{ result.person.name }}</p>
          <p v-if="result.person?.name_en || result.person?.class_name" class="text-xl mt-2 opacity-80">{{ [result.person.name_en, result.person.class_name].filter(Boolean).join(' · ') }}</p>
          <p class="text-2xl sm:text-3xl font-bold mt-6 leading-snug">{{ result.message }}</p>
          <p v-if="result.notice?.message" class="mt-6 text-lg bg-black/20 rounded-2xl px-5 py-4">{{ result.notice.message }}</p>
          <!-- Idea 3: reminder at the door -->
          <div v-if="result.reminders" class="mt-6 text-left bg-black/25 rounded-2xl px-5 py-4 space-y-2">
            <p class="text-lg font-black">⏰ {{ t('visits.kiosk.reminderTitle') }}</p>
            <p v-for="(l, i) in result.reminders.loans" :key="i" class="text-lg flex justify-between gap-4">
              <span class="truncate">{{ l.title }}</span>
              <span class="whitespace-nowrap font-bold" :class="l.late ? 'text-amber-200' : ''">{{ l.late ? t('visits.kiosk.late') : t('visits.kiosk.dueOn', { date: dm(l.due_date) }) }}</span>
            </p>
            <p v-if="result.reminders.unpaid_fines_khr > 0" class="text-lg font-bold">{{ t('visits.kiosk.finesDue', { amount: formatMoney(result.reminders.unpaid_fines_khr) }) }}</p>
          </div>
          <p v-if="result.door" class="mt-6 text-lg font-semibold opacity-90">🚪 {{ t('visits.kiosk.doorOpen') }}</p>
        </div>
      </div>
    </transition>

    <!-- Guest form -->
    <div v-if="guestOpen" class="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
      <form @submit.prevent="submitGuest" class="w-full max-w-lg rounded-3xl bg-white text-slate-900 p-6 sm:p-8 space-y-4">
        <h3 class="text-2xl font-black">{{ t('visits.kiosk.guestTitle') }}</h3>
        <label class="block">
          <span class="text-sm font-semibold text-slate-600">{{ t('visits.kiosk.guestName') }} *</span>
          <input v-model.trim="guest.name" required maxlength="120"
            class="mt-1 w-full h-14 rounded-2xl border border-slate-300 px-4 text-lg outline-none focus:border-emerald-600" />
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-slate-600">{{ t('visits.kiosk.guestPhone') }}</span>
          <input v-model.trim="guest.phone" inputmode="tel" maxlength="30"
            class="mt-1 w-full h-14 rounded-2xl border border-slate-300 px-4 text-lg outline-none focus:border-emerald-600" />
        </label>
        <div>
          <span class="text-sm font-semibold text-slate-600">{{ t('visits.kiosk.guestPurpose') }}</span>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button v-for="p in purposes" :key="p" type="button" @click="guest.purpose = p"
              class="h-12 rounded-xl border font-semibold cursor-pointer"
              :class="guest.purpose === p ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'">
              {{ t('visits.purpose.' + p) }}
            </button>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" @click="closeGuest" class="flex-1 h-14 rounded-2xl border border-slate-300 font-bold cursor-pointer">{{ t('visits.cancel') }}</button>
          <button type="submit" :disabled="busy || !guest.name" class="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-black disabled:opacity-50 cursor-pointer">{{ t('visits.kiosk.guestSubmit') }}</button>
        </div>
      </form>
    </div>

    <!-- Guests leaving -->
    <div v-if="guestListOpen" class="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
      <div class="w-full max-w-lg rounded-3xl bg-white text-slate-900 p-6 sm:p-8">
        <h3 class="text-2xl font-black mb-4">{{ t('visits.kiosk.guestLeavingTitle') }}</h3>
        <p v-if="!guests.length" class="text-slate-500 py-6 text-center">{{ t('visits.kiosk.noGuests') }}</p>
        <ul v-else class="max-h-[50vh] overflow-y-auto divide-y divide-slate-100">
          <li v-for="g in guests" :key="g.id">
            <button type="button" @click="guestOut(g)" class="w-full flex items-center justify-between py-4 text-left cursor-pointer">
              <span class="text-lg font-bold">{{ g.guest_name }}</span>
              <span class="text-sm text-slate-500">{{ t('visits.kiosk.since', { time: hm(g.check_in_at) }) }}</span>
            </button>
          </li>
        </ul>
        <button type="button" @click="guestListOpen = false" class="mt-4 w-full h-14 rounded-2xl border border-slate-300 font-bold cursor-pointer">{{ t('visits.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  QrCodeIcon, CheckCircleIcon, ArrowRightOnRectangleIcon, InformationCircleIcon, XCircleIcon,
} from '@heroicons/vue/24/outline'
import CameraScanner from '@/features/scanner/components/CameraScanner.vue'
import { soundService } from '@/features/scanner/services/soundService'
import { useAuthStore } from '@/features/auth/store/authStore'
import { visitService } from '../services/visitService'
import { announce, configureVoice } from '../services/kioskVoice'
import { formatMoney } from '@/utils/currencyHelper'

const { t, locale } = useI18n()
const authStore = useAuthStore()

const device = ref(null)
const settings = ref({})
const occupancy = ref({})
const result = ref(null)
const busy = ref(false)
const cameraOn = ref(false)
const guestOpen = ref(false)
const guestListOpen = ref(false)
const guests = ref([])
const guest = ref({ name: '', phone: '', purpose: 'read' })
const purposes = ['read', 'research', 'meeting', 'other']

const now = ref(new Date())
const clock = computed(() => now.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
const today = computed(() => now.value.toLocaleDateString(locale.value === 'km' ? 'km-KH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
const hm = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '')
const dm = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '')

const overlayClass = computed(() => ({
  in: 'bg-emerald-600',
  already_in: 'bg-teal-700',
  out: 'bg-sky-700',
  not_in: 'bg-amber-600',
  guest: 'bg-emerald-600',
  guest_out: 'bg-sky-700',
  denied: 'bg-rose-700',
}[result.value?.action] || 'bg-slate-800'))

const resultIcon = computed(() => ({
  in: CheckCircleIcon,
  guest: CheckCircleIcon,
  already_in: InformationCircleIcon,
  out: ArrowRightOnRectangleIcon,
  guest_out: ArrowRightOnRectangleIcon,
  not_in: InformationCircleIcon,
  denied: XCircleIcon,
}[result.value?.action] || InformationCircleIcon))

let resultTimer = null
const VOICE_KEY = { in: 'welcome', out: 'goodbye', already_in: 'already_in', not_in: 'not_in', guest: 'guest', guest_out: 'goodbye', denied: 'denied' }

function show(data, ms = 4000) {
  if (data.reminders) ms = Math.max(ms, 8000) // give time to read the reminder
  announce(VOICE_KEY[data.action] || 'denied', {
    name: data.person?.name || '',
    lang: locale.value === 'en' ? 'en' : 'km',
    reminder: !!data.reminders?.loans?.length,
  })
  result.value = data
  clearTimeout(resultTimer)
  resultTimer = setTimeout(() => (result.value = null), ms)
}

async function submit(code) {
  if (busy.value || !code || guestOpen.value) return
  busy.value = true
  try {
    const { data } = await visitService.kioskScan(code)
    occupancy.value = data.occupancy || occupancy.value
    data.action === 'in' || data.action === 'out' ? soundService.success() : soundService.notFound()
    show(data)
  } catch (e) {
    soundService.error()
    show({ action: 'denied', message: e.response?.data?.message || t('visits.kiosk.offline') }, 5000)
  } finally {
    busy.value = false
  }
}

// USB / Bluetooth scanners type the code very fast and press Enter.
// Keys more than 80 ms apart are a person typing, so the buffer starts again.
let buffer = ''
let lastKey = 0
function onKey(e) {
  if (guestOpen.value || guestListOpen.value) return
  const t0 = Date.now()
  if (t0 - lastKey > 80) buffer = ''
  lastKey = t0
  if (e.key === 'Enter') {
    if (buffer.length >= 6) submit(buffer)
    buffer = ''
    return
  }
  if (e.key.length === 1) buffer += e.key
}

async function submitGuest() {
  busy.value = true
  try {
    const { data } = await visitService.kioskGuest(guest.value)
    occupancy.value = data.occupancy || occupancy.value
    soundService.success()
    closeGuest()
    show({ action: 'guest', message: data.message })
  } catch (e) {
    show({ action: 'denied', message: e.response?.data?.message || t('visits.kiosk.offline') })
  } finally {
    busy.value = false
  }
}

function closeGuest() {
  guestOpen.value = false
  guest.value = { name: '', phone: '', purpose: 'read' }
}

async function openGuestList() {
  guestListOpen.value = true
  try {
    guests.value = (await visitService.kioskGuests()).data
  } catch {
    guests.value = []
  }
}

async function guestOut(g) {
  try {
    const { data } = await visitService.kioskGuestOut(g.id)
    occupancy.value = data.occupancy || occupancy.value
    guestListOpen.value = false
    show({ action: 'guest_out', message: data.message })
  } catch (e) {
    show({ action: 'denied', message: e.response?.data?.message || t('visits.kiosk.offline') })
  }
}

async function refresh() {
  try {
    const { data } = await visitService.kioskMe()
    device.value = data.device
    settings.value = data.settings
    occupancy.value = data.occupancy
    configureVoice({
      enabled: data.settings.kiosk_voice_enabled !== false,
      name: data.settings.kiosk_voice_name !== false,
      volume: data.settings.kiosk_voice_volume ?? 80,
    })
  } catch {
    /* keep the last values; the next scan shows the error */
  }
}

function confirmLogout() {
  if (window.confirm(t('visits.kiosk.signOutConfirm'))) authStore.logout()
}

let clockTimer = null
let refreshTimer = null
onMounted(() => {
  refresh()
  window.addEventListener('keydown', onKey)
  clockTimer = setInterval(() => (now.value = new Date()), 1000)
  refreshTimer = setInterval(refresh, 60000)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
  clearTimeout(resultTimer)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<template>
  <!-- B4.16/17 (Sam): borrow alone. Card -> 4-digit PIN -> scan books -> receipt. -->
  <div class="flex-1 flex flex-col px-6 sm:px-10 pb-6">
    <!-- Error / info banner -->
    <transition name="fade">
      <div v-if="banner.text" class="mb-4 rounded-2xl px-5 py-4 text-lg font-bold flex items-center gap-3"
        :class="banner.type === 'ok' ? 'bg-emerald-500/90 text-white' : 'bg-rose-600/90 text-white'">
        <component :is="banner.type === 'ok' ? CheckCircleIcon : ExclamationTriangleIcon" class="w-7 h-7 shrink-0" />
        <span>{{ banner.text }}</span>
      </div>
    </transition>

    <!-- 1. Scan card -->
    <section v-if="step === 'card'" class="flex-1 grid lg:grid-cols-2 gap-6 items-center">
      <div class="text-center flex flex-col items-center gap-6">
        <div class="w-40 h-40 rounded-[2.5rem] bg-white/10 border border-white/15 flex items-center justify-center">
          <BookOpenIcon class="w-24 h-24 text-emerald-300" />
        </div>
        <div>
          <h2 class="text-3xl sm:text-4xl font-black">{{ t('visits.self.title') }}</h2>
          <p class="mt-3 text-emerald-100/80 text-lg">{{ t('visits.self.scanCard') }}</p>
        </div>
        <div class="flex gap-3">
          <button type="button" @click="cameraOn = !cameraOn" class="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 font-bold text-lg cursor-pointer">
            {{ cameraOn ? t('visits.kiosk.cameraOff') : t('visits.kiosk.cameraOn') }}
          </button>
          <button v-if="closable" type="button" @click="$emit('close')" class="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 font-bold text-lg cursor-pointer">
            {{ t('visits.close') }}
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div v-if="cameraOn" class="rounded-3xl overflow-hidden">
          <CameraScanner continuous auto-start :dedupe-ms="4000" @detected="gotCard" />
        </div>
        <ul class="rounded-3xl bg-white/10 border border-white/15 p-6 space-y-3 text-lg">
          <li v-for="(s, i) in stepsHelp" :key="i" class="flex gap-3"><span class="font-black text-emerald-300">{{ i + 1 }}.</span>{{ s }}</li>
        </ul>
      </div>
    </section>

    <!-- 2. PIN -->
    <section v-else-if="step === 'pin'" class="flex-1 flex flex-col items-center justify-center gap-6">
      <h2 class="text-3xl font-black">{{ t('visits.self.enterPin') }}</h2>
      <div class="flex gap-4">
        <span v-for="i in 4" :key="i" class="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-4xl font-black"
          :class="pin.length >= i ? 'border-emerald-300 bg-white/15' : 'border-white/25'">{{ pin.length >= i ? '•' : '' }}</span>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <button v-for="k in keys" :key="k" type="button" :disabled="busy" @click="press(k)"
          class="w-24 h-20 rounded-2xl text-3xl font-black cursor-pointer active:scale-95 transition disabled:opacity-40"
          :class="k === 'del' || k === 'cancel' ? 'bg-white/5 border border-white/15 text-xl' : 'bg-white/15 border border-white/20'">
          {{ k === 'del' ? '⌫' : k === 'cancel' ? t('visits.cancel') : k }}
        </button>
      </div>
    </section>

    <!-- 3. Scan books -->
    <section v-else-if="step === 'books'" class="flex-1 grid lg:grid-cols-2 gap-6">
      <div class="flex flex-col gap-4">
        <div class="rounded-3xl bg-white/10 border border-white/15 p-5 flex items-center gap-4">
          <img v-if="person.avatar" :src="coverUrl(person.avatar)" alt="" class="w-16 h-16 rounded-2xl object-cover" />
          <div class="min-w-0 flex-1">
            <p class="text-2xl font-black truncate">{{ person.name }}</p>
            <p class="text-emerald-100/70">{{ person.membership_no }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-emerald-200/80">{{ t('visits.self.canBorrow') }}</p>
            <p class="text-4xl font-black tabular-nums">{{ summary.can_borrow }}</p>
          </div>
        </div>
        <div class="rounded-3xl bg-white/10 border border-white/15 p-6 text-center">
          <QrCodeIcon class="w-16 h-16 mx-auto text-emerald-300" />
          <p class="mt-3 text-2xl font-black">{{ summary.can_borrow > 0 ? t('visits.self.scanBook') : t('visits.self.limitReached') }}</p>
          <p class="mt-1 text-emerald-100/70">{{ t('visits.self.loanDays', { days: summary.loan_days }) }}</p>
          <form class="mt-4 flex gap-2" @submit.prevent="typed && gotBook(typed)">
            <input v-model.trim="typed" :placeholder="t('visits.self.typeBarcode')"
              class="flex-1 h-12 rounded-xl bg-white/90 text-slate-900 px-4 text-lg outline-none" />
            <button type="submit" :disabled="!typed || busy" class="px-5 h-12 rounded-xl bg-emerald-500 font-black disabled:opacity-40 cursor-pointer">OK</button>
          </form>
        </div>
        <div v-if="cameraOn" class="rounded-3xl overflow-hidden">
          <CameraScanner continuous auto-start :dedupe-ms="4000" @detected="gotBook" />
        </div>
        <button type="button" @click="cameraOn = !cameraOn" class="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 font-bold cursor-pointer self-start">
          {{ cameraOn ? t('visits.kiosk.cameraOff') : t('visits.kiosk.cameraOn') }}
        </button>
      </div>

      <div class="flex flex-col gap-4">
        <div class="rounded-3xl bg-white text-slate-900 p-5 flex-1">
          <p class="text-lg font-black mb-3">{{ t('visits.self.borrowedNow', { n: borrowed.length }) }}</p>
          <p v-if="!borrowed.length" class="text-slate-400 py-8 text-center">{{ t('visits.self.noneYet') }}</p>
          <ul v-else class="divide-y divide-slate-100 max-h-[45vh] overflow-y-auto">
            <li v-for="b in borrowed" :key="b.borrow_id" class="py-3 flex items-center gap-3">
              <img v-if="b.cover_image" :src="coverUrl(b.cover_image)" alt="" class="w-10 h-14 rounded object-cover" />
              <div class="min-w-0 flex-1">
                <p class="font-bold truncate">{{ b.title }}</p>
                <p class="text-sm text-slate-500">{{ t('visits.kiosk.dueOn', { date: dm(b.due_date) }) }}</p>
              </div>
              <CheckCircleIcon class="w-6 h-6 text-emerald-600" />
            </li>
          </ul>
        </div>
        <button type="button" :disabled="busy" @click="finish"
          class="h-16 rounded-2xl bg-white text-emerald-900 text-xl font-black cursor-pointer active:scale-95 transition disabled:opacity-50">
          {{ t('visits.self.finish') }}
        </button>
        <p class="text-center text-sm text-emerald-100/60">{{ t('visits.self.autoEnd', { s: idleLeft }) }}</p>
      </div>
    </section>

    <!-- 4. Receipt -->
    <section v-else class="flex-1 flex flex-col items-center justify-center text-center gap-5">
      <CheckCircleIcon class="w-24 h-24 text-emerald-300" />
      <h2 class="text-3xl sm:text-4xl font-black">{{ doneMessage }}</h2>
      <ul v-if="receipt.length" class="w-full max-w-xl rounded-3xl bg-white text-slate-900 p-5 divide-y divide-slate-100 text-left">
        <li v-for="b in receipt" :key="b.borrow_id" class="py-3 flex justify-between gap-4">
          <span class="font-bold truncate">{{ b.title }}</span>
          <span class="whitespace-nowrap text-slate-600">{{ t('visits.kiosk.dueOn', { date: dm(b.due_date) }) }}</span>
        </li>
      </ul>
      <p class="text-emerald-100/70 text-lg">{{ t('visits.self.receiptHint') }}</p>
      <button type="button" @click="reset" class="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 font-bold text-lg cursor-pointer">{{ t('visits.self.next') }}</button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { BookOpenIcon, CheckCircleIcon, ExclamationTriangleIcon, QrCodeIcon } from '@heroicons/vue/24/outline'
import CameraScanner from '@/features/scanner/components/CameraScanner.vue'
import { soundService } from '@/features/scanner/services/soundService'
import { coverUrl } from '@/utils/coverUrl'
import { visitService } from '../services/visitService'

defineProps({ closable: { type: Boolean, default: false } })
defineEmits(['close'])

const { t } = useI18n()

const IDLE_SECONDS = 60 // a forgotten session ends by itself, so the next person can't use it

const step = ref('card')
const busy = ref(false)
const cameraOn = ref(false)
const code = ref('')
const pin = ref('')
const token = ref('')
const person = ref({})
const summary = ref({})
const borrowed = ref([])
const receipt = ref([])
const doneMessage = ref('')
const typed = ref('')
const banner = ref({ text: '', type: 'err' })
const idleLeft = ref(IDLE_SECONDS)

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'cancel', '0', 'del']
const stepsHelp = computed(() => [t('visits.self.help1'), t('visits.self.help2'), t('visits.self.help3'), t('visits.self.help4')])
const dm = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '')

let bannerTimer = null
function say(text, type = 'err', ms = 5000) {
  banner.value = { text, type }
  clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => (banner.value = { text: '', type }), ms)
}

function errorText(e) {
  return e?.response?.data?.message || t('visits.kiosk.offline')
}

// ---- 1. card ----
function gotCard(value) {
  if (step.value !== 'card' || busy.value || !value) return
  code.value = value
  pin.value = ''
  cameraOn.value = false
  step.value = 'pin'
  soundService.success()
  touch()
}

// ---- 2. PIN ----
function press(k) {
  touch()
  if (k === 'cancel') return reset()
  if (k === 'del') { pin.value = pin.value.slice(0, -1); return }
  if (pin.value.length >= 4) return
  pin.value += k
  if (pin.value.length === 4) start()
}

async function start() {
  busy.value = true
  try {
    const { data } = await visitService.selfStart(code.value, pin.value)
    token.value = data.token
    person.value = data.person || {}
    summary.value = data.summary || {}
    borrowed.value = []
    banner.value = { text: '', type: 'ok' }
    step.value = 'books'
    soundService.success()
  } catch (e) {
    soundService.error()
    say(errorText(e))
    const c = e?.response?.data?.code
    pin.value = ''
    // Wrong PIN: stay and try again. Anything else (no PIN, not allowed, fines…): back to start.
    if (c !== 'SELF_PIN_WRONG') step.value = 'card'
  } finally {
    busy.value = false
  }
}

// ---- 3. books ----
async function gotBook(barcode) {
  if (step.value !== 'books' || busy.value || !barcode) return
  touch()
  busy.value = true
  try {
    const { data } = await visitService.selfBorrow(token.value, barcode)
    borrowed.value.unshift(data.item)
    summary.value = data.summary || summary.value
    typed.value = ''
    soundService.success()
    say(data.message, 'ok', 3000)
  } catch (e) {
    soundService.error()
    say(errorText(e))
    if (e?.response?.status === 410) reset(false)
  } finally {
    busy.value = false
  }
}

async function finish() {
  busy.value = true
  try {
    const { data } = await visitService.selfFinish(token.value)
    receipt.value = data.borrowed || borrowed.value
    doneMessage.value = data.message
  } catch {
    // Session already gone (timed out): the loans are saved anyway.
    receipt.value = borrowed.value
    doneMessage.value = borrowed.value.length ? t('visits.self.doneCount', { n: borrowed.value.length }) : t('visits.self.doneNone')
  } finally {
    busy.value = false
    token.value = ''
    step.value = 'done'
    idleLeft.value = 15
  }
}

function reset(clearBanner = true) {
  step.value = 'card'
  code.value = ''
  pin.value = ''
  token.value = ''
  person.value = {}
  summary.value = {}
  borrowed.value = []
  receipt.value = []
  typed.value = ''
  if (clearBanner) banner.value = { text: '', type: 'err' }
}

// ---- idle timer: a person who walks away is signed out ----
function touch() {
  idleLeft.value = IDLE_SECONDS
}
let idleTimer = null
function tick() {
  if (step.value === 'card') return
  idleLeft.value -= 1
  if (idleLeft.value > 0) return
  if (step.value === 'books') finish()
  else reset()
}

// ---- USB / Bluetooth scanner: fast keys + Enter ----
let buffer = ''
let lastKey = 0
function onKey(e) {
  if (e.target?.tagName === 'INPUT') return // typing in the barcode box
  if (step.value === 'pin') {
    if (/^\d$/.test(e.key)) press(e.key)
    else if (e.key === 'Backspace') press('del')
    return
  }
  const now = Date.now()
  if (now - lastKey > 80) buffer = ''
  lastKey = now
  if (e.key === 'Enter') {
    if (buffer.length >= 4) step.value === 'card' ? gotCard(buffer) : gotBook(buffer)
    buffer = ''
    return
  }
  if (e.key.length === 1) buffer += e.key
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  idleTimer = setInterval(tick, 1000)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearInterval(idleTimer)
  clearTimeout(bannerTimer)
  if (token.value) visitService.selfFinish(token.value).catch(() => {})
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

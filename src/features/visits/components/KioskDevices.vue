<template>
  <!-- Admin: tablets at the door and the door controller next to each -->
  <div>
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('visits.devices.title') }}</h2>
        <p class="text-sm text-gray-400 dark:text-slate-400">{{ t('visits.devices.subtitle') }}</p>
      </div>
      <button type="button" @click="startCreate" class="shrink-0 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold cursor-pointer">+ {{ t('visits.devices.add') }}</button>
    </div>

    <!-- One-time secret -->
    <div v-if="secret" class="mb-4 rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-4 text-sm text-amber-900 dark:text-amber-100 space-y-1">
      <p class="font-bold">{{ t('visits.devices.onceOnly') }}</p>
      <p v-for="(v, k) in secret" :key="k" class="break-all"><span class="font-semibold">{{ t('visits.devices.secret.' + k) }}:</span> <code class="tabular-nums">{{ v }}</code></p>
      <button type="button" @click="secret = null" class="mt-2 text-xs underline cursor-pointer">{{ t('visits.devices.saved') }}</button>
    </div>

    <p v-if="!devices.length" class="text-sm text-gray-400 py-4">{{ t('visits.devices.none') }}</p>
    <div v-else class="space-y-3">
      <div v-for="d in devices" :key="d.id" class="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="font-bold text-gray-800 dark:text-white">{{ d.name }} <span class="text-xs font-normal text-gray-400">· {{ t('visits.devices.mode.' + d.mode) }}</span></p>
            <p class="text-xs text-gray-400">{{ d.location }} · {{ d.user?.email }}</p>
          </div>
          <div class="flex gap-2 text-xs">
            <span class="px-2 py-1 rounded-lg" :class="d.online ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'">{{ d.online ? t('visits.devices.online') : t('visits.devices.offline') }}</span>
            <span v-if="d.door_enabled" class="px-2 py-1 rounded-lg" :class="d.door_online ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">🚪 {{ d.door_online ? t('visits.devices.doorOnline') : t('visits.devices.doorOffline') }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <button type="button" @click="startEdit(d)" class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer">{{ t('visits.devices.edit') }}</button>
          <button type="button" @click="resetPassword(d)" class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer">{{ t('visits.devices.resetPassword') }}</button>
          <button type="button" @click="doorKey(d)" class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer">{{ d.has_door_key ? t('visits.devices.newDoorKey') : t('visits.devices.doorKey') }}</button>
          <button v-if="d.door_enabled" type="button" @click="testDoor(d)" class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer">{{ t('visits.devices.testDoor') }}</button>
          <button type="button" @click="remove(d)" class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer text-rose-600!">{{ t('visits.devices.delete') }}</button>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form v-if="form" @submit.prevent="save" class="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 p-4 space-y-3">
      <div class="grid sm:grid-cols-2 gap-3">
        <label class="text-xs font-semibold text-gray-500">{{ t('visits.devices.name') }}
          <input v-model.trim="form.name" required maxlength="100" class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600" />
        </label>
        <label class="text-xs font-semibold text-gray-500">{{ t('visits.devices.location') }}
          <input v-model.trim="form.location" maxlength="150" class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600" />
        </label>
        <label class="text-xs font-semibold text-gray-500">{{ t('visits.devices.modeLabel') }}
          <select v-model="form.mode" class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600">
            <option v-for="m in ['both', 'entrance', 'exit']" :key="m" :value="m">{{ t('visits.devices.mode.' + m) }}</option>
          </select>
        </label>
        <label class="text-xs font-semibold text-gray-500">{{ t('visits.devices.pulse') }}
          <input v-model.number="form.door_pulse_ms" type="number" min="500" max="15000" step="500" class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600" />
        </label>
      </div>
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
        <input v-model="form.door_enabled" type="checkbox" class="w-4 h-4" /> {{ t('visits.devices.doorEnabled') }}
      </label>
      <p class="text-xs text-gray-400">{{ t('visits.devices.doorHint') }}</p>
      <div class="flex gap-2 justify-end">
        <button type="button" @click="form = null" class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-slate-200 cursor-pointer">{{ t('visits.cancel') }}</button>
        <button type="submit" class="px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-semibold cursor-pointer">{{ t('auth.settings.save') }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { visitService } from '../services/visitService'

const { t } = useI18n()
const toast = useToast()
const devices = ref([])
const form = ref(null)
const secret = ref(null)

const blank = () => ({ id: null, name: '', location: '', mode: 'both', door_enabled: false, door_pulse_ms: 3000 })

async function load() {
  devices.value = (await visitService.devices()).data
}
function startCreate() { form.value = blank() }
function startEdit(d) { form.value = { ...blank(), ...d } }

async function save() {
  const { id, name, location, mode, door_enabled, door_pulse_ms } = form.value
  const payload = { name, location, mode, door_enabled, door_pulse_ms }
  try {
    if (id) {
      await visitService.updateDevice(id, payload)
    } else {
      const { data } = await visitService.createDevice(payload)
      secret.value = { login: data.login, password: data.password }
    }
    form.value = null
    await load()
    toast.success(t('visits.devices.savedOk'))
  } catch (e) {
    toast.error(e.response?.data?.message || t('visits.error'))
  }
}

async function resetPassword(d) {
  if (!window.confirm(t('visits.devices.resetConfirm'))) return
  const { data } = await visitService.resetDevicePassword(d.id)
  secret.value = { login: data.login, password: data.password }
}

async function doorKey(d) {
  if (d.has_door_key && !window.confirm(t('visits.devices.doorKeyConfirm'))) return
  const { data } = await visitService.doorKey(d.id)
  secret.value = { device_id: data.device_id, door_key: data.door_key, poll_url: data.poll_url }
  await load()
}

async function testDoor(d) {
  const { data } = await visitService.testDoor(d.id)
  data.queued ? toast.success(t('visits.devices.testSent')) : toast.warning(t('visits.devices.testNotSent'))
}

async function remove(d) {
  if (!window.confirm(t('visits.devices.deleteConfirm', { name: d.name }))) return
  await visitService.deleteDevice(d.id)
  await load()
}

onMounted(load)
</script>


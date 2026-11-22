<template>
  <!-- One click from the member list: activate an imported student and hand over a one-time password -->
  <span class="inline-flex">
    <button type="button" :disabled="busy" @click.stop="activate"
      class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300 cursor-pointer disabled:opacity-50"
      :title="t('members.activate.tip')">
      {{ busy ? '…' : t('members.activate.button') }}
    </button>

    <Teleport to="body">
      <div v-if="result" class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" @click.self="close">
        <div class="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
          <div>
            <p class="text-lg font-black text-slate-900 dark:text-white">✓ {{ t('members.activate.done', { name: member.user?.name }) }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ t('members.activate.onceOnly') }}</p>
          </div>

          <div class="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-400/30 p-4 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="text-[11px] font-bold text-slate-500">{{ t('members.activate.login') }}</p>
                <code class="text-lg font-black text-slate-900 dark:text-white select-all">{{ result.login }}</code>
              </div>
              <button type="button" @click="copy(result.login)" class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 text-xs font-bold cursor-pointer">{{ t('members.activate.copy') }}</button>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="text-[11px] font-bold text-slate-500">{{ t('members.activate.password') }}</p>
                <code class="text-2xl font-black tracking-wider text-slate-900 dark:text-white select-all">{{ result.temporary_password }}</code>
              </div>
              <button type="button" @click="copy(result.temporary_password)" class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 text-xs font-bold cursor-pointer">{{ t('members.activate.copy') }}</button>
            </div>
          </div>

          <ol class="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-decimal pl-4">
            <li>{{ t('members.activate.step1') }}</li>
            <li>{{ t('members.activate.step2') }}</li>
            <li>{{ t('members.activate.step3') }}</li>
          </ol>

          <div class="flex gap-2">
            <button type="button" @click="printSlip" class="flex-1 h-11 rounded-xl border border-slate-300 dark:border-white/15 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">🖨 {{ t('members.activate.print') }}</button>
            <button type="button" @click="close" class="flex-1 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black cursor-pointer">{{ t('members.activate.close') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </span>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { authService } from '@/features/auth/services/authService'
import { esc } from '@/utils/membershipCardMarkup'

const props = defineProps({ member: { type: Object, required: true } })
const emit = defineEmits(['activated'])

const { t } = useI18n()
const toast = useToast()
const busy = ref(false)
const result = ref(null)

async function activate() {
  if (!props.member.user?.id) return
  if (!window.confirm(t('members.activate.confirm', { name: props.member.user.name }))) return
  busy.value = true
  try {
    const { data } = await authService.resetCredentials(props.member.user.id)
    result.value = { login: data.login, temporary_password: data.temporary_password }
    // The list shows "active" right away, without a reload
    if (props.member.user) props.member.user.status = 'active'
    emit('activated', props.member)
  } catch (e) {
    toast.error(e.response?.data?.message || t('common.messages.unexpectedError'))
  } finally {
    busy.value = false
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(String(text))
    toast.success(t('members.activate.copied'))
  } catch {
    toast.error(t('common.messages.unexpectedError'))
  }
}

// A small paper slip to hand to the student (the password is shown only once)
function printSlip() {
  const w = window.open('', '_blank', 'width=420,height=560')
  if (!w) return
  const name = esc(props.member.user?.name || '')
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Login</title>
<style>body{font-family:'Kantumruy Pro','Noto Sans Khmer',system-ui,sans-serif;padding:24px;color:#0f172a}
.box{border:2px dashed #94a3b8;border-radius:12px;padding:18px}h2{margin:0 0 4px}p{margin:6px 0;font-size:14px}
code{font-size:22px;font-weight:800;letter-spacing:2px}small{color:#64748b}</style></head><body>
<div class="box"><h2>${esc(t('members.activate.slipTitle'))}</h2><p><b>${name}</b></p>
<p>${esc(t('members.activate.login'))}:<br><code>${esc(result.value.login)}</code></p>
<p>${esc(t('members.activate.password'))}:<br><code>${esc(result.value.temporary_password)}</code></p>
<p><small>${esc(t('members.activate.step1'))}<br>${esc(t('members.activate.step2'))}<br>${esc(t('members.activate.step3'))}</small></p></div>
<script>window.onload=()=>{window.print()}<\/script></body></html>`)
  w.document.close()
}

function close() {
  result.value = null
}
</script>

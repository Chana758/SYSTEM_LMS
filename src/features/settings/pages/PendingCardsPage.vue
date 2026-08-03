paddingeCardpage.vue


<template>
  <div class="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
    
    <!-- Modern Admin Header Section -->
    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/80 flex-shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-gray-900 tracking-tight">Card Approvals Queue</h1>
            <span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
              Admin Area
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1 font-normal">Manage and issue digital/physical QR membership cards for pending accounts.</p>
        </div>
      </div>

      <button
        @click="loadPending"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
      >
        <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Refresh Queue</span>
      </button>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Pending Requests Table Section -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-gray-800">Pending Requests</h2>
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-md">
              {{ users.length }}
            </span>
          </div>
          <span class="text-xs text-gray-400 font-medium">Auto-updated</span>
        </div>

        <div class="flex-1 overflow-x-auto min-h-[320px]">
          <div v-if="loading" class="flex flex-col items-center justify-center h-52 text-gray-400">
            <svg class="w-8 h-8 animate-spin text-emerald-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p class="text-xs font-medium text-gray-500">Loading requests...</p>
          </div>

          <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center h-52 text-gray-400">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-xs font-semibold text-gray-500">No pending card requests found.</p>
          </div>

          <table v-else class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th class="py-3 px-6">User Details</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Identifier</th>
                <th class="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-xs">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50/60 transition-colors">
                <td class="py-3.5 px-6">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="buildAvatarUrl(user)"
                      :src="buildAvatarUrl(user)"
                      class="w-9 h-9 rounded-lg object-cover border border-gray-200 shadow-2xs flex-shrink-0"
                    />
                    <div
                      v-else
                      class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center border border-emerald-200 flex-shrink-0 text-xs"
                    >
                      {{ (user.name || '').slice(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 leading-snug">{{ user.name }}</p>
                      <p class="text-[11px] text-gray-400 mt-0.5">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    class="px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide"
                    :class="{
                      'bg-emerald-50 text-emerald-700 border border-emerald-100': user.role?.name === 'member',
                      'bg-blue-50 text-blue-700 border border-blue-100': user.role?.name === 'librarian',
                      'bg-amber-50 text-amber-700 border border-amber-100': user.role?.name === 'admin',
                    }"
                  >
                    {{ user.role?.name || 'User' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-mono text-gray-600">
                  {{ user.role?.name === 'librarian' ? (user.librarian?.employee_id || '—') : (user.member?.membership_no || '—') }}
                </td>
                <td class="py-3.5 px-6 text-right">
                  <button
                    @click="handleIssue(user)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Issue Card
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Preview & Print Panel Section -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <h2 class="text-sm font-bold text-gray-800">Card Preview</h2>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded">Live Output</span>
          </div>

          <div v-if="!issuedCard" class="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-2xs mb-2">
              <svg class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p class="text-xs font-bold text-gray-700">No Card Selected</p>
            <p class="text-[11px] text-gray-400 mt-1 max-w-[180px] leading-normal">Click "Issue Card" on any user to preview their ID card.</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Membership Card Component Container -->
            <div class="border border-gray-200 rounded-xl overflow-hidden shadow-md bg-white">
              <!-- Card Header Design -->
              <div
                class="p-4 text-white"
                :style="{
                  background: issuedCard.role === 'librarian'
                    ? 'linear-gradient(135deg, #1d4ed8, #3730a3)'
                    : issuedCard.role === 'admin'
                    ? 'linear-gradient(135deg, #d97706, #c2410c)'
                    : 'linear-gradient(135deg, #047857, #065f46)'
                }"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                      <span class="text-xs">📖</span>
                    </div>
                    <span class="text-xs font-bold tracking-wide">Library LMS</span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-white/20">
                    {{ issuedCard.role }}
                  </span>
                </div>
              </div>

              <!-- Card Body Info -->
              <div class="px-4 pt-3 pb-4">
                <div class="flex items-end gap-3 -mt-8 mb-3">
                  <img
                    v-if="issuedCard.avatarUrl"
                    :src="issuedCard.avatarUrl"
                    class="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0 bg-white"
                  />
                  <div
                    v-else
                    class="w-14 h-14 rounded-xl border-2 border-white shadow-sm flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    :style="{
                      background: issuedCard.role === 'librarian' ? '#1d4ed8' : '#047857'
                    }"
                  >
                    {{ (issuedCard.name || '').slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0 pb-0.5">
                    <h3 class="font-extrabold text-gray-900 truncate text-sm leading-tight">{{ issuedCard.name }}</h3>
                    <p class="text-[11px] font-semibold mt-0.5 truncate" :style="{ color: issuedCard.role === 'librarian' ? '#1d4ed8' : '#047857' }">
                      {{ issuedCard.subLabel }}
                    </p>
                  </div>
                </div>

                <div
                  class="rounded-lg p-2.5 mb-3"
                  :style="{
                    background: issuedCard.role === 'librarian' ? '#eff6ff' : '#ecfdf5'
                  }"
                >
                  <p class="text-[9px] font-extrabold uppercase tracking-wider" :style="{ color: issuedCard.role === 'librarian' ? '#1d4ed8' : '#047857' }">
                    {{ issuedCard.idLabel }}
                  </p>
                  <p class="text-sm font-mono font-black text-gray-800 mt-0.5">{{ issuedCard.idValue }}</p>
                </div>

                <div class="flex items-center gap-3">
                  <img :src="issuedCard.qrDataUrl" class="w-16 h-16 rounded-lg border border-gray-100 p-1 bg-white shadow-2xs flex-shrink-0" />
                  <div class="text-[10px] text-gray-500 leading-relaxed">
                    <p>Scan at kiosk for instant check-in.</p>
                    <p class="font-bold mt-1" :style="{ color: issuedCard.role === 'librarian' ? '#1d4ed8' : '#047857' }">
                      Valid until {{ formatDate(issuedCard.expiresAt) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="border-t border-dashed border-gray-200 py-1.5 text-center">
                <p class="text-[8px] font-extrabold uppercase tracking-widest" :style="{ color: issuedCard.role === 'librarian' ? '#1d4ed8' : '#047857' }">
                  Official Library ID Card
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="issuedCard" class="mt-5 pt-3 border-t border-gray-100">
          <button
            @click="handlePrint"
            class="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print ID Card
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { authService } from '@/features/auth/services/authService'

const users = ref([])
const loading = ref(false)
const issuedCard = ref(null)

function buildAvatarUrl(user) {
  if (!user?.avatar) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${user.avatar}`
}

async function loadPending() {
  loading.value = true
  try {
    const { data } = await authService.getPendingCards()
    users.value = data.data
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to load pending cards.')
  } finally {
    loading.value = false
  }
}

async function handleIssue(user) {
  try {
    const { data } = await authService.generateQrTokenFor(user.id)
    const qrDataUrl = await QRCode.toDataURL(data.qr_token, { width: 300, margin: 1 })

    const isLibrarian = user.role?.name === 'librarian'
    issuedCard.value = {
      qrDataUrl,
      name: user.name,
      avatarUrl: buildAvatarUrl(user),
      role: user.role?.name || 'member',
      idLabel: isLibrarian ? 'Employee ID' : 'Membership No.',
      idValue: isLibrarian ? user.librarian?.employee_id : user.member?.membership_no,
      subLabel: isLibrarian
        ? user.librarian?.department || ''
        : (user.member?.membership_type ? `${user.member.membership_type} membership` : ''),
      expiresAt: data.expires_at,
    }

    users.value = users.value.filter((u) => u.id !== user.id)
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to issue card.')
  }
}

function handlePrint() {
  if (!issuedCard.value) return
  const c = issuedCard.value

  const colorMap = {
    member:    { grad: '#047857, #065f46', accent: '#047857', box: '#ecfdf5' },
    librarian: { grad: '#1d4ed8, #3730a3', accent: '#1d4ed8', box: '#eff6ff' },
    admin:     { grad: '#d97706, #c2410c', accent: '#d97706', box: '#fffbeb' },
  }
  const colors = colorMap[c.role] || colorMap.member

  const initials = (c.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const avatarBlock = c.avatarUrl
    ? `<img src="${c.avatarUrl}" style="width:80px;height:80px;border-radius:16px;object-fit:cover;border:4px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.15);" />`
    : `<div style="width:80px;height:80px;border-radius:16px;border:4px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.15);background:linear-gradient(135deg, ${colors.grad});display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:900;">${initials}</div>`

  const win = window.open('', '_blank', 'width=500,height=750')
  win.document.write(`
    <html>
      <head>
        <title>Library Card</title>
        <style>
          * { box-sizing: border-box; }
          body { display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#f1f5f9; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; }
          @media print { body { background: #fff; } }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div style="width:360px;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.15);border:1px solid #e5e7eb;background:#fff;">
          <div style="background:linear-gradient(135deg, ${colors.grad});padding:16px 20px 40px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:16px;">📖</span>
              </div>
              <span style="color:#fff;font-size:14px;font-weight:700;">Library LMS</span>
              <span style="margin-left:auto;color:#fff;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:999px;">${c.role}</span>
            </div>
          </div>

          <div style="padding:0 20px;margin-top:-32px;">
            <div style="display:flex;align-items:flex-end;gap:16px;">
              ${avatarBlock}
              <div style="flex:1;padding-bottom:4px;">
                <p style="margin:0;font-size:16px;font-weight:900;color:#111827;">${c.name}</p>
                <p style="margin:2px 0 0;font-size:12px;font-weight:600;color:${colors.accent};">${c.subLabel || ''}</p>
              </div>
            </div>
          </div>

          <div style="padding:20px;padding-top:16px;">
            <div style="background:${colors.box};border-radius:12px;padding:14px;margin-bottom:16px;">
              <p style="margin:0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:${colors.accent};">${c.idLabel}</p>
              <p style="margin:2px 0 0;font-size:18px;font-weight:900;font-family:monospace;color:#1f2937;">${c.idValue}</p>
            </div>

            <div style="display:flex;align-items:center;gap:16px;">
              <img src="${c.qrDataUrl}" style="width:96px;height:96px;border:2px solid ${colors.box};border-radius:12px;padding:4px;background:#fff;" />
              <div style="flex:1;font-size:12px;color:#6b7280;line-height:1.5;">
                <p style="margin:0;">Scan at the library kiosk to log in instantly.</p>
                <p style="margin:4px 0 0;font-weight:700;color:${colors.accent};">Valid until ${formatDateStr(c.expiresAt)}</p>
              </div>
            </div>
          </div>

          <div style="border-top:1px dashed #e5e7eb;">
            <p style="text-align:center;font-size:10px;font-weight:800;color:${colors.accent};padding:8px 0;text-transform:uppercase;letter-spacing:.15em;margin:0;">
              Official Library Card
            </p>
          </div>
        </div>
      </body>
    </html>
  `)
  win.document.close()
}

function formatDateStr(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDate(d) {
  return formatDateStr(d)
}

onMounted(loadPending)
</script>

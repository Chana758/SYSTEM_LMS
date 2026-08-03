<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm space-y-6">

      <!-- Top Title & Action Buttons -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
            🔔
          </div>
          <div>
            <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
            <p class="text-xs font-medium text-slate-500 mt-1">Stay updated with alerts, announcements, and system messages.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Mark All Read Button (Matched with Send Notification Color) -->
          <button
            v-if="store.unreadCount > 0"
            @click="handleMarkAll"
            class="inline-flex items-center gap-2 bg-rose-600 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <SparklesIcon class="w-4 h-4 text-white" />
            <span>Mark all read ({{ store.unreadCount }})</span>
          </button>

          <!-- Send Notification Button -->
          <button
            v-if="canSend"
            @click="showCompose = true"
            class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span class="text-base leading-none">+</span>
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      <!-- 4 Stat Cards (Solid Background) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">

        <!-- Total -->
        <div class="bg-blue-600 rounded-2xl border border-blue-500 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <BellIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-blue-100 uppercase tracking-widest bg-blue-700/50 px-2.5 py-1 rounded-full border border-blue-400/30">Total</span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-bold text-blue-100 tracking-wide">All alerts</p>
          </div>
        </div>

        <!-- Unread -->
        <div class="bg-emerald-600 rounded-2xl border border-emerald-500 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <EnvelopeIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-emerald-100 uppercase tracking-widest bg-emerald-700/50 px-2.5 py-1 rounded-full border border-emerald-400/30">Unread</span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ store.unreadCount || 0 }}</p>
            <p class="text-[11px] font-bold text-emerald-100 tracking-wide">Pending review</p>
          </div>
        </div>

        <!-- Overdue -->
        <div class="bg-rose-600 rounded-2xl border border-rose-500 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <ExclamationTriangleIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-rose-100 uppercase tracking-widest bg-rose-700/50 px-2.5 py-1 rounded-full border border-rose-400/30">Overdue</span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ overdueCount }}</p>
            <p class="text-[11px] font-bold text-rose-100 tracking-wide">Overdue alerts</p>
          </div>
        </div>

        <!-- Reservation -->
        <div class="bg-sky-600 rounded-2xl border border-sky-500 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <CalendarDaysIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-sky-100 uppercase tracking-widest bg-sky-700/50 px-2.5 py-1 rounded-full border border-sky-400/30">Reservation</span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ reservationCount }}</p>
            <p class="text-[11px] font-bold text-sky-100 tracking-wide">Reservation updates</p>
          </div>
        </div>

      </div>
    </div>

    <!-- ============ TOOLBAR (filters) ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
      <NotificationFilter :model-value="filters" @change="handleFilterChange" />
    </div>

    <!-- ============ NOTIFICATIONS LIST ============ -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm">
      <div class="space-y-3 relative min-h-[120px]">
        <div
          v-if="store.loading && !store.notifications.length"
          class="py-20 flex flex-col items-center justify-center text-slate-400"
        >
          <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Loading notifications...</p>
        </div>

        <div
          v-else-if="store.loading"
          class="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-start justify-center pt-6 rounded-2xl transition-opacity"
        >
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white px-4 py-2 rounded-xl shadow-md border border-slate-300">
            Updating...
          </span>
        </div>

        <div
          v-if="!store.loading && !store.notifications.length"
          class="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300"
        >
          <div class="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center mb-3 text-xl shadow-2xs text-emerald-600">
            <BellIcon class="w-6 h-6" />
          </div>
          <p class="text-xs font-black uppercase tracking-wider text-slate-900">No notifications found</p>
          <p class="text-xs text-slate-400 mt-1">You're all caught up — new alerts will appear here.</p>
        </div>

        <NotificationCard
          v-for="n in store.notifications" :key="n.id"
          :notification="n"
          @click="goDetail(n)"
          @delete="handleDelete(n.id)"
        />
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-center gap-2 pt-6" v-if="store.pagination.last_page > 1">
        <button
          v-for="p in store.pagination.last_page" :key="p"
          @click="store.fetchNotifications(p, activeParams)"
          class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          :class="p === store.pagination.current_page ? 'bg-emerald-700 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- ============ COMPOSE MODAL ============ -->
    <div v-if="showCompose" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-600 mb-2">
              Broadcaster
            </span>
            <h2 class="font-serif text-lg font-black text-slate-900">Send Notification</h2>
            <p class="text-xs text-slate-500 mt-0.5">Compose an alert for one member or your entire membership.</p>
          </div>
          <button @click="showCompose = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleSend" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Recipient</label>
            <select v-model="compose.target" class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:outline-emerald-600 transition-all shadow-2xs cursor-pointer">
              <option value="broadcast">All Members</option>
              <option value="single">Specific Member</option>
            </select>
          </div>

          <div v-if="compose.target === 'single'" class="relative">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Member</label>
            <input
              v-model="memberQuery"
              type="text"
              placeholder="Search member..."
              class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:outline-emerald-600 transition-all shadow-2xs"
              @input="debouncedMemberSearch"
            />
            <p v-if="selectedMember" class="text-xs font-bold text-emerald-700 mt-1.5">✓ {{ selectedMember.name }}</p>
            <div v-if="memberResults.length" class="absolute z-10 mt-1.5 w-full bg-white border border-slate-300 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100">
              <button
                v-for="m in memberResults" :key="m.id" type="button"
                @click="selectMember(m)"
                class="block w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                {{ m.name }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Type</label>
            <select v-model="compose.type" class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:outline-emerald-600 transition-all shadow-2xs cursor-pointer">
              <option value="announcement">Announcement</option>
              <option value="system">System</option>
              <option value="overdue">Overdue</option>
              <option value="reservation">Reservation</option>
              <option value="fine">Fine</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Title</label>
            <input v-model="compose.title" type="text" class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:outline-emerald-600 transition-all shadow-2xs" required />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Message</label>
            <textarea v-model="compose.message" rows="3" class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:outline-emerald-600 transition-all shadow-2xs"></textarea>
          </div>

          <p v-if="composeError" class="text-rose-600 text-xs font-bold">{{ composeError }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCompose = false" class="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all shadow-2xs cursor-pointer">
              Cancel
            </button>
            <button type="submit" :disabled="sending" class="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all shadow-md active:scale-95 cursor-pointer">
              {{ sending ? 'Sending...' : 'Send' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BellIcon, EnvelopeIcon, ExclamationTriangleIcon, CalendarDaysIcon, SparklesIcon,
} from '@heroicons/vue/24/outline'
import apiClient from '@/api/axios'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import NotificationFilter from '../components/NotificationFilter.vue'
import NotificationCard from '../components/NotificationCard.vue'

const router = useRouter()
const store = useNotificationStore()
const authStore = useAuthStore()

const canSend = computed(() => ['admin', 'librarian'].includes(authStore.role))

const overdueCount = computed(() => store.notifications.filter((n) => n.type === 'overdue').length)
const reservationCount = computed(() => store.notifications.filter((n) => n.type === 'reservation').length)

const filters = reactive({ type: '', is_read: '' })
const activeParams = computed(() => ({
  type: filters.type || undefined,
  is_read: filters.is_read === '' ? undefined : filters.is_read,
}))

function handleFilterChange(newFilters) {
  Object.assign(filters, newFilters)
  store.fetchNotifications(1, activeParams.value)
}

function goDetail(n) {
  router.push({ name: 'notification-detail', params: { id: n.id } })
}

async function handleMarkAll() {
  await store.markAllRead()
}

async function handleDelete(id) {
  if (!confirm('Delete this notification?')) return
  await store.deleteNotification(id)
}

// Compose
const showCompose = ref(false)
const sending = ref(false)
const composeError = ref('')
const compose = reactive({ target: 'broadcast', type: 'announcement', title: '', message: '' })

const memberQuery = ref('')
const memberResults = ref([])
const selectedMember = ref(null)
let memberTimeout = null
function debouncedMemberSearch() {
  selectedMember.value = null
  clearTimeout(memberTimeout)
  memberTimeout = setTimeout(searchMembers, 350)
}
async function searchMembers() {
  if (!memberQuery.value.trim()) { memberResults.value = []; return }
  const { data } = await apiClient.get('/members', { params: { search: memberQuery.value, per_page: 5 } })
  memberResults.value = (data.data ?? data).map((m) => ({ id: m.user_id, name: m.user?.name || m.name }))
}
function selectMember(m) {
  selectedMember.value = m
  memberQuery.value = m.name
  memberResults.value = []
}

async function handleSend() {
  composeError.value = ''
  if (compose.target === 'single' && !selectedMember.value) {
    composeError.value = 'Please select a member.'
    return
  }
  sending.value = true
  const result = await store.sendNotification({
    title: compose.title,
    message: compose.message,
    type: compose.type,
    broadcast: compose.target === 'broadcast',
    user_id: compose.target === 'single' ? selectedMember.value.id : undefined,
  })
  sending.value = false
  if (result.success) {
    showCompose.value = false
    compose.title = ''
    compose.message = ''
    selectedMember.value = null
    memberQuery.value = ''
  } else {
    composeError.value = result.message
  }
}

onMounted(() => store.fetchNotifications(1, activeParams.value))
</script>
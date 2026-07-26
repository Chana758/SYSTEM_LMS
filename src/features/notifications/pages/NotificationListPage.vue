<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner - Redesigned matching Image 3 style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          🔔
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Stay updated with alerts, announcements, and system messages</p>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-if="store.unreadCount > 0"
          @click="handleMarkAll"
          class="inline-flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs"
        >
          <span>✨</span> Mark all read ({{ store.unreadCount }})
        </button>
        <button
          v-if="canSend"
          @click="showCompose = true"
          class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <span>+</span> Send Notification
        </button>
      </div>
    </div>

    <!-- Main Container matching Digital Library, Fines & Reservations Style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-6 border-dashed">
      
      <!-- Stat Cards Grid - Redesigned following Image 3 layout pattern -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm space-y-3 relative">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-2xs">
              <BellIcon class="w-5 h-5 text-slate-600" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</span>
          </div>
          <div>
            <p class="text-3xl font-black text-slate-900 tracking-tight">{{ store.pagination.total || 0 }}</p>
            <p class="text-xs font-bold text-slate-500 mt-0.5">All alerts</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm space-y-3 relative">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shadow-2xs">
              <EnvelopeIcon class="w-5 h-5 text-emerald-600" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Unread</span>
          </div>
          <div>
            <p class="text-3xl font-black text-slate-900 tracking-tight">{{ store.unreadCount || 0 }}</p>
            <p class="text-xs font-bold text-slate-500 mt-0.5">Pending review</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm space-y-3 relative">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center shadow-2xs">
              <ExclamationTriangleIcon class="w-5 h-5 text-rose-500" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Overdue</span>
          </div>
          <div>
            <p class="text-3xl font-black text-slate-900 tracking-tight">{{ overdueCount }}</p>
            <p class="text-xs font-bold text-slate-500 mt-0.5">Overdue alerts</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm space-y-3 relative">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center shadow-2xs">
              <CalendarDaysIcon class="w-5 h-5 text-sky-600" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Reservation</span>
          </div>
          <div>
            <p class="text-3xl font-black text-slate-900 tracking-tight">{{ reservationCount }}</p>
            <p class="text-xs font-bold text-slate-500 mt-0.5">Reservation updates</p>
          </div>
        </div>
      </div>

      <!-- Toolbar with filters -->
      <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-200 p-4 shadow-2xs">
        <NotificationFilter v-model="filters" @change="handleFilterChange" />
      </div>

      <!-- Notifications List or Loading / Empty States -->
      <div class="space-y-3">
        <div v-if="store.loading" class="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest">
          Loading notifications...
        </div>

        <div v-else-if="!store.notifications.length" class="bg-slate-50/50 rounded-2xl border-2 border-slate-200 p-16 text-center space-y-3 shadow-2xs">
          <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center mx-auto text-xl shadow-2xs text-emerald-600">
            <BellIcon class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm font-black text-slate-900 uppercase tracking-wider">No notifications found</p>
            <p class="text-xs font-bold text-slate-500 mt-0.5">You're all caught up — new alerts will appear here.</p>
          </div>
        </div>

        <NotificationCard
          v-for="n in store.notifications" :key="n.id"
          :notification="n"
          @click="goDetail(n)"
          @delete="handleDelete(n.id)"
        />
      </div>

      <!-- Pagination -->
      <div class="flex justify-center gap-2 pt-4" v-if="store.pagination.last_page > 1">
        <button
          v-for="p in store.pagination.last_page" :key="p"
          @click="store.fetchNotifications(p, activeParams)"
          class="w-9 h-9 rounded-xl text-xs font-black transition-all shadow-2xs"
          :class="p === store.pagination.current_page ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-md' : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'"
        >
          {{ p }}
        </button>
      </div>

    </div>

    <!-- Compose modal — admin/librarian only -->
    <div v-if="showCompose" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6">
        <div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border-2 border-emerald-200 mb-2 shadow-2xs">
            Broadcaster
          </span>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">Send Notification</h2>
        </div>

        <form @submit.prevent="handleSend" class="space-y-4">
          <div>
            <label class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Recipient</label>
            <select v-model="compose.target" class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all shadow-2xs">
              <option value="broadcast">All Members</option>
              <option value="single">Specific Member</option>
            </select>
          </div>

          <div v-if="compose.target === 'single'" class="relative">
            <label class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Member</label>
            <input
              v-model="memberQuery"
              type="text"
              placeholder="Search member..."
              class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all shadow-2xs"
              @input="debouncedMemberSearch"
            />
            <p v-if="selectedMember" class="text-xs font-black text-emerald-600 mt-1.5">✓ {{ selectedMember.name }}</p>
            <div v-if="memberResults.length" class="absolute z-10 mt-1.5 w-full bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100">
              <button
                v-for="m in memberResults" :key="m.id" type="button"
                @click="selectMember(m)"
                class="block w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                {{ m.name }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Type</label>
            <select v-model="compose.type" class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all shadow-2xs">
              <option value="announcement">Announcement</option>
              <option value="system">System</option>
              <option value="overdue">Overdue</option>
              <option value="reservation">Reservation</option>
              <option value="fine">Fine</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Title</label>
            <input v-model="compose.title" type="text" class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all shadow-2xs" required />
          </div>

          <div>
            <label class="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Message</label>
            <textarea v-model="compose.message" rows="3" class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all shadow-2xs"></textarea>
          </div>

          <p v-if="composeError" class="text-rose-500 text-xs font-bold">{{ composeError }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCompose = false" class="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs">
              Cancel
            </button>
            <button type="submit" :disabled="sending" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 transition-all shadow-md active:scale-95">
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
  BellIcon, EnvelopeIcon, ExclamationTriangleIcon, CalendarDaysIcon,
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

function handleFilterChange() {
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
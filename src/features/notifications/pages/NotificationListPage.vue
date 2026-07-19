<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
      <div class="flex gap-2">
        <button
          v-if="store.unreadCount > 0"
          @click="handleMarkAll"
          class="border border-green-200 text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Mark all read ({{ store.unreadCount }})
        </button>
        <button
          v-if="canSend"
          @click="showCompose = true"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Send Notification
        </button>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <BellIcon class="w-[18px] h-[18px] text-gray-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ store.pagination.total || 0 }}</p>
          <p class="text-xs text-gray-500">Total</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
          <EnvelopeIcon class="w-[18px] h-[18px] text-green-700" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ store.unreadCount || 0 }}</p>
          <p class="text-xs text-gray-500">Unread</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <ExclamationTriangleIcon class="w-[18px] h-[18px] text-red-500" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ overdueCount }}</p>
          <p class="text-xs text-gray-500">Overdue alerts</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <CalendarDaysIcon class="w-[18px] h-[18px] text-blue-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ reservationCount }}</p>
          <p class="text-xs text-gray-500">Reservation updates</p>
        </div>
      </div>
    </div>

    <!-- Toolbar with filters -->
    <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
      <NotificationFilter v-model="filters" @change="handleFilterChange" />
    </div>

    <div class="space-y-3">
      <div v-if="store.loading" class="text-center py-16 text-gray-400 text-sm">Loading...</div>

      <div v-else-if="!store.notifications.length" class="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <div class="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3">
          <BellIcon class="w-6 h-6 text-gray-300" />
        </div>
        <p class="text-gray-700 font-semibold">No notifications found</p>
        <p class="text-sm text-gray-400 mt-1">You're all caught up — new alerts will appear here.</p>
      </div>

      <NotificationCard
        v-for="n in store.notifications" :key="n.id"
        :notification="n"
        @click="goDetail(n)"
        @delete="handleDelete(n.id)"
      />
    </div>

    <div class="flex justify-center gap-2 mt-8" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page" :key="p"
        @click="store.fetchNotifications(p, activeParams)"
        class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
        :class="p === store.pagination.current_page ? 'bg-green-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200'"
      >
        {{ p }}
      </button>
    </div>

    <!-- Compose modal — admin/librarian only -->
    <div v-if="showCompose" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Send Notification</h2>
        <form @submit.prevent="handleSend" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
            <select v-model="compose.target" class="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="broadcast">All Members</option>
              <option value="single">Specific Member</option>
            </select>
          </div>

          <div v-if="compose.target === 'single'" class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Member</label>
            <input
              v-model="memberQuery"
              type="text"
              placeholder="Search member..."
              class="w-full border rounded-lg px-3 py-2 text-sm"
              @input="debouncedMemberSearch"
            />
            <p v-if="selectedMember" class="text-xs text-green-600 mt-1">✓ {{ selectedMember.name }}</p>
            <div v-if="memberResults.length" class="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
              <button
                v-for="m in memberResults" :key="m.id" type="button"
                @click="selectMember(m)"
                class="block w-full text-left px-3 py-2 text-sm hover:bg-green-50"
              >
                {{ m.name }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="compose.type" class="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="announcement">Announcement</option>
              <option value="system">System</option>
              <option value="overdue">Overdue</option>
              <option value="reservation">Reservation</option>
              <option value="fine">Fine</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input v-model="compose.title" type="text" class="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea v-model="compose.message" rows="3" class="w-full border rounded-lg px-3 py-2 text-sm"></textarea>
          </div>

          <p v-if="composeError" class="text-red-500 text-sm">{{ composeError }}</p>

          <div class="flex gap-2 pt-2">
            <button type="button" @click="showCompose = false" class="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" :disabled="sending" class="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors">
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
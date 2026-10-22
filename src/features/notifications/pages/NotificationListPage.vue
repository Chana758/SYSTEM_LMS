<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- Header + stats -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-none space-y-5 sm:space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
          <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-400/30 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-300 flex-shrink-0">
            <BellIcon class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('notifications.pageTitle') }}</h1>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ t('notifications.pageSubtitle') }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <router-link
            v-if="canSettings"
            to="/notifications/settings"
            class="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Cog6ToothIcon class="w-4 h-4" />
            <span>{{ t('notifications.settings') }}</span>
          </router-link>

          <button
            v-if="store.unreadCount > 0"
            @click="store.markAllRead()"
            class="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <SparklesIcon class="w-4 h-4" />
            <span>{{ t('notifications.markAllRead', { count: store.unreadCount }) }}</span>
          </button>

          <button
            v-if="canSend"
            @click="openCompose"
            class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span class="text-base leading-none">+</span>
            <span>{{ t('notifications.sendNotification') }}</span>
          </button>
        </div>
      </div>

      <!-- 2 columns on phones (instead of 4 stacked rows), 4 on desktop -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1 sm:pt-2">
        <div v-for="c in cards" :key="c.key" :class="['rounded-2xl border shadow-sm dark:shadow-none p-3.5 sm:p-5 flex flex-col justify-between text-white min-w-0', c.card]">
          <div class="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <component :is="c.icon" class="w-5 h-5" />
            </div>
            <span :class="['text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider sm:tracking-widest px-2 sm:px-2.5 py-1 rounded-full border truncate min-w-0', c.pill]">{{ c.badge }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-2xl font-black tracking-tight leading-none mb-1.5">{{ c.value }}</p>
            <p :class="['text-[11px] font-bold tracking-wide leading-snug', c.sub]">{{ c.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-3 sm:p-4 shadow-sm dark:shadow-none">
      <NotificationFilter :model-value="filters" @change="handleFilterChange" />
    </div>

    <!-- List -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-none">
      <div class="space-y-3 relative min-h-[120px]">
        <div v-if="store.loading && !store.notifications.length" class="py-20 flex flex-col items-center justify-center text-slate-400">
          <div class="w-7 h-7 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('notifications.loadingNotifications') }}</p>
        </div>

        <div v-else-if="!store.loading && !store.notifications.length" class="py-20 flex flex-col items-center justify-center text-slate-400 rounded-2xl border border-dashed border-slate-300 dark:border-white/15">
          <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-400/30 rounded-xl flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-300">
            <BellIcon class="w-6 h-6" />
          </div>
          <p class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">{{ t('notifications.noNotificationsFound') }}</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ t('notifications.allCaughtUp') }}</p>
        </div>

        <NotificationCard
          v-for="n in store.notifications" :key="n.id"
          :notification="n"
          @click="goDetail(n)"
          @read="store.markRead(n.id)"
          @delete="handleDelete(n.id)"
        />
      </div>

      <!-- Pagination -->
      <div v-if="store.pagination.last_page > 1" class="flex items-center justify-center gap-1.5 pt-6 flex-wrap">
        <button
          :disabled="store.pagination.current_page <= 1"
          @click="goPage(store.pagination.current_page - 1)"
          :class="[pageBtn, pageIdle, 'disabled:opacity-40 disabled:cursor-not-allowed']"
        >‹</button>
        <button
          v-for="p in pages" :key="p"
          @click="goPage(p)"
          :class="[pageBtn, p === store.pagination.current_page ? pageActive : pageIdle]"
        >{{ p }}</button>
        <button
          :disabled="store.pagination.current_page >= store.pagination.last_page"
          @click="goPage(store.pagination.current_page + 1)"
          :class="[pageBtn, pageIdle, 'disabled:opacity-40 disabled:cursor-not-allowed']"
        >›</button>
      </div>
    </div>

    <!-- Compose modal -->
    <div v-if="showCompose" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4" @click.self="showCompose = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-8 w-full max-w-md max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-300 dark:border-white/10 space-y-5">
        <div class="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
          <div class="min-w-0">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 mb-2">
              {{ t('notifications.composeModal.broadcaster') }}
            </span>
            <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ t('notifications.composeModal.title') }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('notifications.composeModal.subtitle') }}</p>
          </div>
          <button @click="showCompose = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold cursor-pointer p-1 -m-1 flex-shrink-0">✕</button>
        </div>

        <form @submit.prevent="handleSend" class="space-y-4">
          <div>
            <label :class="labelCls">{{ t('notifications.composeModal.recipient') }}</label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10">
              <button
                v-for="opt in targetOptions" :key="opt.value" type="button"
                @click="compose.target = opt.value"
                class="py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                :class="compose.target === opt.value
                  ? 'bg-white dark:bg-emerald-600 text-emerald-800 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div v-if="compose.target === 'single'" class="relative space-y-1">
            <label :class="labelCls">{{ t('notifications.composeModal.memberLabel') }}</label>
            <input v-model="memberQuery" type="text" :placeholder="t('notifications.composeModal.searchMember')" :class="inputCls" @input="debouncedMemberSearch" />
            <p v-if="selectedMember" class="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-1">
              <span>✓</span> <span>{{ selectedMember.name }}</span>
            </p>
            <div v-if="memberResults.length" class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              <button
                v-for="m in memberResults" :key="m.id" type="button" @click="selectMember(m)"
                class="block w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
              >
                {{ m.name }}
              </button>
            </div>
          </div>

          <div>
            <label :class="labelCls">{{ t('notifications.composeModal.typeLabel') }}</label>
            <select v-model="compose.type" :class="[inputCls, 'cursor-pointer font-bold']">
              <option value="announcement">{{ t('notifications.composeModal.typeAnnouncement') }}</option>
              <option value="system">{{ t('notifications.composeModal.typeSystem') }}</option>
              <option value="overdue">{{ t('notifications.composeModal.typeOverdue') }}</option>
              <option value="reservation">{{ t('notifications.composeModal.typeReservation') }}</option>
              <option value="fine">{{ t('notifications.composeModal.typeFine') }}</option>
            </select>
          </div>

          <div>
            <label :class="labelCls">{{ t('notifications.composeModal.titleLabel') }}</label>
            <input v-model="compose.title" type="text" maxlength="150" :placeholder="t('notifications.composeModal.titleLabel')" :class="inputCls" required />
          </div>

          <div>
            <label :class="labelCls">{{ t('notifications.composeModal.messageLabel') }}</label>
            <textarea v-model="compose.message" rows="3" maxlength="1000" :placeholder="t('notifications.composeModal.messageLabel')" :class="inputCls" required></textarea>
          </div>

          <p v-if="composeError" class="text-rose-600 dark:text-rose-300 text-xs font-bold bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-400/30 p-2.5 rounded-xl">{{ composeError }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCompose = false" class="flex-1 bg-white dark:bg-slate-700/60 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
              {{ t('notifications.composeModal.cancel') }}
            </button>
            <button type="submit" :disabled="sending" class="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all shadow-md active:scale-95 cursor-pointer">
              {{ sending ? t('notifications.composeModal.sending') : t('notifications.composeModal.send') }}
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
import { useI18n } from 'vue-i18n'
import {
  BellIcon, EnvelopeIcon, ExclamationTriangleIcon, CalendarDaysIcon, SparklesIcon, Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import apiClient from '@/api/axios'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import NotificationFilter from '../components/NotificationFilter.vue'
import NotificationCard from '../components/NotificationCard.vue'

const { t } = useI18n()
const router = useRouter()
const store = useNotificationStore()
const authStore = useAuthStore()

const canSend = computed(() => ['admin', 'librarian'].includes(authStore.role))

// Members cannot access notification settings
const canSettings = computed(() => authStore.role !== 'member')

/* ---- stat cards (unread counts come from the server, not the current page) ---- */
const cards = computed(() => [
  {
    key: 'total', icon: BellIcon, value: store.pagination.total || 0,
    badge: t('notifications.total'), label: t('notifications.allAlerts'),
    card: 'bg-blue-600 border-blue-500 dark:border-blue-400/30', pill: 'text-blue-100 bg-blue-700/50 border-blue-400/30', sub: 'text-blue-100',
  },
  {
    key: 'unread', icon: EnvelopeIcon, value: store.unreadCount || 0,
    badge: t('notifications.unread'), label: t('notifications.pendingReview'),
    card: 'bg-emerald-600 border-emerald-500 dark:border-emerald-400/30', pill: 'text-emerald-100 bg-emerald-700/50 border-emerald-400/30', sub: 'text-emerald-100',
  },
  {
    key: 'overdue', icon: ExclamationTriangleIcon, value: store.unreadByType.overdue || 0,
    badge: t('notifications.typeOverdue'), label: t('notifications.overdueAlerts'),
    card: 'bg-rose-600 border-rose-500 dark:border-rose-400/30', pill: 'text-rose-100 bg-rose-700/50 border-rose-400/30', sub: 'text-rose-100',
  },
  {
    key: 'reservation', icon: CalendarDaysIcon, value: store.unreadByType.reservation || 0,
    badge: t('notifications.typeReservation'), label: t('notifications.reservationUpdates'),
    card: 'bg-sky-600 border-sky-500 dark:border-sky-400/30', pill: 'text-sky-100 bg-sky-700/50 border-sky-400/30', sub: 'text-sky-100',
  },
])

/* ---- filters ---- */
const filters = reactive({ type: '', is_read: '', search: '' })
const activeParams = computed(() => ({
  type: filters.type || undefined,
  is_read: filters.is_read === '' ? undefined : filters.is_read,
  search: filters.search || undefined,
}))

function handleFilterChange(next) {
  Object.assign(filters, next)
  store.fetchNotifications(1, activeParams.value)
}

/* ---- pagination (max 7 numbers around current page) ---- */
const pageBtn = 'min-w-9 h-9 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer'
const pageActive = 'bg-emerald-700 text-white shadow-md'
const pageIdle = 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10'

const pages = computed(() => {
  const { current_page: cur, last_page: last } = store.pagination
  const start = Math.max(1, Math.min(cur - 3, last - 6))
  const end = Math.min(last, start + 6)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
const goPage = (p) => store.fetchNotifications(p, activeParams.value)

/* ---- actions ---- */
function goDetail(n) {
  router.push({ name: 'notification-detail', params: { id: n.id } })
}

async function handleDelete(id) {
  if (!confirm(t('notifications.confirmDelete'))) return
  await store.deleteNotification(id)
}

/* ---- compose ---- */
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5'
const inputCls =
  'w-full bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:[color-scheme:dark] outline-none focus:border-emerald-600 dark:focus:border-emerald-400 transition-all'

const targetOptions = computed(() => [
  { value: 'broadcast', label: `📢 ${t('notifications.composeModal.allMembers')}` },
  { value: 'single', label: `👤 ${t('notifications.composeModal.specificMember')}` },
])

const showCompose = ref(false)
const sending = ref(false)
const composeError = ref('')
const compose = reactive({ target: 'broadcast', type: 'announcement', title: '', message: '' })

const memberQuery = ref('')
const memberResults = ref([])
const selectedMember = ref(null)
let memberTimeout = null

function openCompose() {
  composeError.value = ''
  Object.assign(compose, { target: 'broadcast', type: 'announcement', title: '', message: '' })
  selectedMember.value = null
  memberQuery.value = ''
  memberResults.value = []
  showCompose.value = true
}

function debouncedMemberSearch() {
  selectedMember.value = null
  clearTimeout(memberTimeout)
  memberTimeout = setTimeout(searchMembers, 350)
}

async function searchMembers() {
  if (!memberQuery.value.trim()) { memberResults.value = []; return }
  try {
    const { data } = await apiClient.get('/members', { params: { search: memberQuery.value, per_page: 5 } })
    memberResults.value = (data.data ?? data).map((m) => ({ id: m.user_id || m.id, name: m.user?.name || m.name }))
  } catch {
    memberResults.value = []
  }
}

function selectMember(m) {
  selectedMember.value = m
  memberQuery.value = m.name
  memberResults.value = []
}

async function handleSend() {
  composeError.value = ''
  if (compose.target === 'single' && !selectedMember.value) {
    composeError.value = t('notifications.composeModal.searchMember')
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
    store.fetchNotifications(1, activeParams.value)
  } else {
    composeError.value = result.message
  }
}

onMounted(() => {
  store.fetchNotifications(1, activeParams.value)
  store.fetchUnreadCount()
})
</script>
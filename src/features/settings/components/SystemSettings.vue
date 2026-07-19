<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6">
    <div class="flex items-start justify-between mb-1">
      <div>
        <h2 class="text-lg font-bold text-gray-800">System Settings</h2>
        <p class="text-sm text-gray-400">Library-wide configuration values.</p>
      </div>
      <!-- FIX: was completely missing — backend already supports
           POST /settings but no UI existed to create a new key. -->
      <button
        v-if="authStore.role === 'admin'"
        @click="openCreateModal"
        class="flex items-center gap-1.5 px-3.5 py-2 bg-green-700 text-white text-xs font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] transition flex-shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Setting
      </button>
    </div>

    <p v-if="authStore.role === 'librarian'" class="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3 mb-2">
      You have read-only access. Contact an administrator to change these values.
    </p>

    <div v-for="group in groupedSettings" :key="group.name" class="mt-6">
      <div class="flex items-center gap-2 mb-2">
        <component :is="groupIcon(group.name)" class="w-4 h-4 text-gray-400" />
        <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">{{ formatGroupName(group.name) }}</p>
      </div>
      <div class="rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        <div v-for="item in group.items" :key="item.id" class="flex items-center justify-between px-4 py-3 group/row">
          <div class="pr-4 min-w-0">
            <p class="text-sm font-medium text-gray-800">{{ item.key }}</p>
            <p class="text-xs text-gray-400 truncate">{{ item.description }}</p>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- boolean -->
            <button
              v-if="item.type === 'boolean'" type="button"
              :disabled="authStore.role !== 'admin'"
              @click="toggleBoolean(item)"
              class="w-11 h-6 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50"
              :class="isTrue(item.value) ? 'bg-green-600' : 'bg-gray-300'"
            >
              <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform" :class="isTrue(item.value) ? 'translate-x-5' : 'translate-x-0.5'"></span>
            </button>

            <!-- number -->
            <input
              v-else-if="item.type === 'number'"
              v-model.number="item.value" type="number"
              :disabled="authStore.role !== 'admin'"
              @change="handleUpdate(item)"
              class="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm w-28 disabled:bg-gray-50 outline-none focus:ring-2 focus:ring-green-600/30"
            />

            <!-- json -->
            <textarea
              v-else-if="item.type === 'json'"
              v-model="item.value" rows="2"
              :disabled="authStore.role !== 'admin'"
              @change="handleUpdate(item)"
              class="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono w-56 disabled:bg-gray-50 outline-none focus:ring-2 focus:ring-green-600/30"
            />

            <!-- string (default) -->
            <input
              v-else
              v-model="item.value" type="text"
              :disabled="authStore.role !== 'admin'"
              @change="handleUpdate(item)"
              class="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm w-44 disabled:bg-gray-50 outline-none focus:ring-2 focus:ring-green-600/30"
            />

            <!-- FIX: delete button — was completely missing even though
                 backend already supports DELETE /settings/{setting}.
                 Only visible on row hover, admin-only. -->
            <button
              v-if="authStore.role === 'admin'"
              @click="handleDelete(item)"
              class="opacity-0 group-hover/row:opacity-100 transition-opacity p-1.5 text-gray-300 hover:text-red-500 flex-shrink-0"
              title="Delete setting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!groupedSettings.length && !loading" class="text-sm text-gray-400 mt-4">No settings found.</p>

    <transition name="fade">
      <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-4">{{ errorMessage }}</p>
    </transition>
    <transition name="fade">
      <p v-if="successMessage" class="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-4">{{ successMessage }}</p>
    </transition>

    <!-- Create Setting modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="closeCreateModal">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-base font-bold text-gray-800 mb-4">Add New Setting</h3>

        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Key</label>
            <input
              v-model="createForm.key" type="text" required
              placeholder="e.g. fine_per_day"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
            />
            <p v-if="createErrors.key" class="text-xs text-red-600 mt-1">{{ createErrors.key }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              v-model="createForm.type"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Value</label>
            <input
              v-model="createForm.value" type="text"
              placeholder="Initial value"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Group</label>
            <input
              v-model="createForm.group" type="text"
              placeholder="e.g. fine_settings, general, ai_config"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              v-model="createForm.description" rows="2"
              placeholder="What does this setting control?"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 resize-none"
            ></textarea>
          </div>

          <p v-if="createErrors.general" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ createErrors.general }}</p>

          <div class="flex justify-end gap-3 pt-1">
            <button type="button" @click="closeCreateModal" class="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" :disabled="isCreating" class="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition disabled:opacity-50">
              {{ isCreating ? 'Creating...' : 'Create Setting' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'
import { settingService } from '@/features/settings/services/settingsService'

const authStore = useAuthStore()
const settings = ref([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const showCreateModal = ref(false)
const isCreating = ref(false)
const createErrors = ref({})
const createForm = reactive({
  key: '',
  value: '',
  type: 'string',
  group: '',
  description: '',
})

const groupedSettings = computed(() => {
  const groups = {}
  settings.value.forEach((s) => {
    const g = s.group || 'general'
    if (!groups[g]) groups[g] = []
    groups[g].push(s)
  })
  return Object.entries(groups).map(([name, items]) => ({ name, items }))
})

// FIX: cosmetic touch — small icon per known group so the settings list
// reads less like a flat form and more like an organized panel.
const GROUP_ICONS = {
  general: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', 'stroke-width': 1.8, stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' }),
  ]),
  fine_settings: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', 'stroke-width': 1.8, stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }),
  ]),
  borrow_settings: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', 'stroke-width': 1.8, stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' }),
  ]),
  ai_config: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', 'stroke-width': 1.8, stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.696L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5' }),
  ]),
  security_settings: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', 'stroke-width': 1.8, stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12.75L11.25 15 15 9.75M21 12c0 4.556-3.03 8.408-7.183 9.65a12.02 12.02 0 01-1.634 0C7.03 20.408 4 16.556 4 12c0-4.556 3.03-8.408 7.183-9.65a12.02 12.02 0 011.634 0C16.97 3.592 20 7.444 20 12z' }),
  ]),
}

function groupIcon(name) {
  return GROUP_ICONS[name] || GROUP_ICONS.general
}

function formatGroupName(name) {
  return name.replace(/_/g, ' ')
}

function isTrue(value) {
  return value === true || value === 'true' || value === '1' || value === 1
}

async function loadSettings() {
  loading.value = true
  try {
    const { data } = await settingService.getSettings()
    settings.value = data
  } catch (e) {
    errorMessage.value = 'Failed to load settings.'
  } finally {
    loading.value = false
  }
}

onMounted(loadSettings)

async function toggleBoolean(item) {
  if (authStore.role !== 'admin') return
  item.value = isTrue(item.value) ? 'false' : 'true'
  await handleUpdate(item)
}

async function handleUpdate(item) {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await settingService.updateSetting(item.id, item.value)
    successMessage.value = `"${item.key}" updated.`
    setTimeout(() => (successMessage.value = ''), 2000)
  } catch (e) {
    errorMessage.value = e.response?.data?.message || 'Failed to update setting.'
  }
}

// FIX: was completely missing — DELETE /settings/{setting} existed on
// the backend with no way to trigger it from the UI.
async function handleDelete(item) {
  if (!confirm(`Delete setting "${item.key}"? This cannot be undone.`)) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await settingService.deleteSetting(item.id)
    settings.value = settings.value.filter((s) => s.id !== item.id)
    successMessage.value = `"${item.key}" deleted.`
    setTimeout(() => (successMessage.value = ''), 2000)
  } catch (e) {
    errorMessage.value = e.response?.data?.message || 'Failed to delete setting.'
  }
}

function openCreateModal() {
  createErrors.value = {}
  Object.assign(createForm, { key: '', value: '', type: 'string', group: '', description: '' })
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

// FIX: was completely missing — POST /settings existed on the backend
// with no way to trigger it from the UI at all.
async function handleCreate() {
  createErrors.value = {}
  isCreating.value = true
  try {
    const { data } = await settingService.createSetting({ ...createForm })
    settings.value.push(data.setting)
    showCreateModal.value = false
  } catch (e) {
    createErrors.value = e.response?.data?.errors
      ? Object.fromEntries(Object.entries(e.response.data.errors).map(([k, v]) => [k, v[0]]))
      : { general: e.response?.data?.message || 'Failed to create setting.' }
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
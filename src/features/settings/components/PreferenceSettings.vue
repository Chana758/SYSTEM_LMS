<template>
  <!-- No outer card: SettingsCard already provides the surface -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-bold text-gray-800 dark:text-slate-100 mb-1">{{ t('settings.preferences.title') }}</h2>
      <p class="text-sm text-gray-400 dark:text-slate-400">{{ t('settings.preferences.subtitle') }}</p>
    </div>

    <ThemeSettings :model-value="themeStore.theme" @update:model-value="onThemeChange" />
    <hr class="border-gray-100 dark:border-slate-700" />

    <LanguageSettings />
    <hr class="border-gray-100 dark:border-slate-700" />

    <ToggleSwitch
      :label="t('settings.preferences.darkMode')"
      :hint="t('settings.preferences.darkModeHint')"
      :model-value="themeStore.isDark"
      @update:model-value="onDarkToggle"
    />
    <hr class="border-gray-100 dark:border-slate-700" />

    <div>
      <p class="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">{{ t('settings.preferences.notificationChannels') }}</p>
      <div class="space-y-3">
        <ToggleSwitch
          v-for="item in channelToggles"
          :key="item.key"
          :label="t(item.labelKey)"
          :model-value="form[item.key]"
          @update:model-value="setToggle(item.key, $event)"
        />
      </div>
    </div>
    <hr class="border-gray-100 dark:border-slate-700" />

    <div>
      <p class="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">{{ t('settings.preferences.alertTypes') }}</p>
      <div class="space-y-3">
        <ToggleSwitch
          v-for="item in alertToggles"
          :key="item.key"
          :label="t(item.labelKey)"
          :model-value="form[item.key]"
          @update:model-value="setToggle(item.key, $event)"
        />
      </div>
    </div>

    <transition name="fade">
      <p v-if="successMessage" class="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 rounded-lg px-3 py-2">{{ successMessage }}</p>
    </transition>
    <transition name="fade">
      <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">{{ errorMessage }}</p>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { preferenceService } from '@/features/settings/services/preferenceService'
import { useThemeStore } from '@/stores/themeStore'
import { useLanguageStore } from '@/stores/languageStore'
import ThemeSettings from './ThemeSettings.vue'
import LanguageSettings from './LanguageSettings.vue'
import ToggleSwitch from './ToggleSwitch.vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const languageStore = useLanguageStore()

const form = reactive({
  dark_mode: themeStore.theme === 'dark',
  theme: themeStore.theme,
  language: languageStore.locale,
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  overdue_alerts: true,
  reservation_alerts: true,
  promotional_alerts: false,
})

const KEYS = Object.keys(form)
const SKIP_ON_LOAD = ['theme', 'language', 'dark_mode']

const successMessage = ref('')
const errorMessage = ref('')
const loaded = ref(false)

const channelToggles = [
  { key: 'email_notifications', labelKey: 'settings.preferences.emailNotifications' },
  { key: 'sms_notifications', labelKey: 'settings.preferences.smsNotifications' },
  { key: 'push_notifications', labelKey: 'settings.preferences.pushNotifications' },
]

const alertToggles = [
  { key: 'overdue_alerts', labelKey: 'settings.preferences.overdueReminders' },
  { key: 'reservation_alerts', labelKey: 'settings.preferences.reservationReadyAlerts' },
  { key: 'promotional_alerts', labelKey: 'settings.preferences.promotionsAnnouncements' },
]

function onThemeChange(value) {
  themeStore.setTheme(value)
}

function onDarkToggle(isDark) {
  themeStore.setTheme(isDark ? 'dark' : 'light')
}

function setToggle(key, value) {
  form[key] = value
  save()
}

// Theme store -> form payload (the Navbar button can change it too)
watch(
  () => themeStore.theme,
  (value) => {
    form.theme = value
    form.dark_mode = value === 'dark'
    if (loaded.value) save()
  }
)

// Language store -> form payload
watch(
  () => languageStore.locale,
  (value) => {
    form.language = value
    if (loaded.value) save()
  }
)

onMounted(async () => {
  try {
    const { data } = await preferenceService.getPreferences()
    KEYS.forEach((k) => {
      if (SKIP_ON_LOAD.includes(k)) return
      if (data?.[k] !== undefined && data?.[k] !== null) form[k] = data[k]
    })
  } catch (e) {
    errorMessage.value = t('settings.preferences.loadFailed')
  } finally {
    loaded.value = true
  }
})

let saveTimeout = null
let messageTimeout = null

function save() {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    try {
      const payload = Object.fromEntries(KEYS.map((k) => [k, form[k]]))
      await preferenceService.updatePreferences(payload)
      successMessage.value = t('settings.preferences.saved')
      errorMessage.value = ''
      clearTimeout(messageTimeout)
      messageTimeout = setTimeout(() => (successMessage.value = ''), 2000)
    } catch (e) {
      errorMessage.value = t('settings.preferences.saveFailed')
    }
  }, 400)
}

onBeforeUnmount(() => {
  clearTimeout(saveTimeout)
  clearTimeout(messageTimeout)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
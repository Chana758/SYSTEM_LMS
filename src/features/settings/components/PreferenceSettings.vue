<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl space-y-6">
    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-1">{{ t('settings.preferences.title') }}</h2>
      <p class="text-sm text-gray-400">{{ t('settings.preferences.subtitle') }}</p>
    </div>

    <ThemeSettings v-model="form.theme" @update:model-value="save" />
    <hr class="border-gray-100" />
    <LanguageSettings v-model="form.language" @update:model-value="save" />

    <hr class="border-gray-100" />

    <ToggleSwitch
      :label="t('settings.preferences.darkMode')"
      :hint="t('settings.preferences.darkModeHint')"
      v-model="form.dark_mode"
      @change="save"
    />

    <hr class="border-gray-100" />

    <div>
      <p class="text-sm font-semibold text-gray-800 mb-3">{{ t('settings.preferences.notificationChannels') }}</p>
      <div class="space-y-3">
        <ToggleSwitch
          v-for="item in channelToggles" :key="item.key"
          :label="t(item.labelKey)"
          v-model="form[item.key]"
          @change="save"
        />
      </div>
    </div>

    <hr class="border-gray-100" />

    <div>
      <p class="text-sm font-semibold text-gray-800 mb-3">{{ t('settings.preferences.alertTypes') }}</p>
      <div class="space-y-3">
        <ToggleSwitch
          v-for="item in alertToggles" :key="item.key"
          :label="t(item.labelKey)"
          v-model="form[item.key]"
          @change="save"
        />
      </div>
    </div>

    <transition name="fade">
      <p v-if="successMessage" class="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{{ successMessage }}</p>
    </transition>
    <transition name="fade">
      <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ errorMessage }}</p>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { preferenceService } from '@/features/settings/services/preferenceService'
import ThemeSettings from './ThemeSettings.vue'
import LanguageSettings from './LanguageSettings.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const form = reactive({
  dark_mode: false,
  theme: 'system',
  language: 'en',
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  overdue_alerts: true,
  reservation_alerts: true,
  promotional_alerts: false,
})

const successMessage = ref('')
const errorMessage = ref('')

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

onMounted(async () => {
  try {
    const { data } = await preferenceService.getPreferences()
    Object.assign(form, data)
    applyThemeToDom(form.theme, form.dark_mode)
  } catch (e) {
    errorMessage.value = t('settings.preferences.loadFailed')
  }
})

function applyThemeToDom(theme, darkMode) {
  const root = document.documentElement
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) || darkMode
  root.classList.toggle('dark', isDark)
}

watch(() => [form.theme, form.dark_mode], () => applyThemeToDom(form.theme, form.dark_mode))

let saveTimeout = null
function save() {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    try {
      await preferenceService.updatePreferences({ ...form })
      successMessage.value = t('settings.preferences.saved')
      errorMessage.value = ''
      setTimeout(() => (successMessage.value = ''), 2000)
    } catch (e) {
      errorMessage.value = t('settings.preferences.saveFailed')
    }
  }, 400)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
import { createApp } from 'vue'
import App from './App.vue'

import './assets/css/main.css'

import router from './router'
import pinia from './plugins/pinia'
import i18n from './plugins/i18n'
import toast from './plugins/toast'
import { setupInterceptors } from '@/api/interceptors'
import { vClickOutside } from '@/directives/clickOutside'

setupInterceptors()

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(toast)

app.directive('click-outside', vClickOutside)

app.mount('#app')
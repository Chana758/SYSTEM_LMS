import { createApp } from 'vue'
import App from './App.vue'

import './assets/css/main.css';

import router from './router'
import pinia from './plugins/pinia'
import i18n from './plugins/i18n'
import toast from './plugins/toast'
import { setupInterceptors } from '@/api/interceptors'  

setupInterceptors()   

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(i18n)
app.use(toast)

app.mount('#app')
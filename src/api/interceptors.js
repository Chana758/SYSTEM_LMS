import apiClient from './axios'
import router from '@/router'

export function setupInterceptors() {
  // Request: attach the Bearer token and locale to every request
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Laravel's SetLocale middleware reads this header to localize responses
      config.headers['X-Locale'] = localStorage.getItem('locale') || 'km'

      // Let the browser set the multipart boundary for file uploads
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response: handle 401 (expired session) and 403 DEMO_RESTRICTED (blocked write)
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status

      if (status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        router.push({ name: 'login' })
      }

      // Demo mode: the backend blocked a write. Notify the UI via an event.
      if (status === 403 && error.response.data?.code === 'DEMO_RESTRICTED') {
        error.isDemoRestricted = true
        window.dispatchEvent(
          new CustomEvent('demo-restricted', { detail: error.response.data.message })
        )
      }

      return Promise.reject(error)
    }
  )
}
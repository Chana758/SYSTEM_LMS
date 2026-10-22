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

  // Response: on 401, clear the session and redirect to login
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        router.push({ name: 'login' })
      }
      return Promise.reject(error)
    }
  )
}
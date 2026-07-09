import apiClient from './axios'
import router from '@/router'

export function setupInterceptors() {
  // Request interceptor — attach Bearer token to every request
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor — handle global errors
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
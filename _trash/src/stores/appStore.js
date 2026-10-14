import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(true)
  const loading = ref(false)

  const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }
  const setLoading = (v) => { loading.value = v }

  return { sidebarOpen, loading, toggleSidebar, setLoading }
})
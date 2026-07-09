import { ref } from 'vue'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const request = async (fn) => {
    loading.value = true
    try { return await fn() } 
    catch (e) { error.value = e } 
    finally { loading.value = false }
  }

  return { loading, error, request }
}
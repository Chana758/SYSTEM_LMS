import { ref, computed } from 'vue'

export function usePagination(perPage = 15) {
  const page = ref(1)
  const total = ref(0)
  const lastPage = computed(() => Math.max(1, Math.ceil(total.value / perPage)))
  const goTo = (p) => { page.value = Math.min(Math.max(1, p), lastPage.value) }
  const next = () => goTo(page.value + 1)
  const prev = () => goTo(page.value - 1)
  return { page, total, perPage, lastPage, goTo, next, prev }
}
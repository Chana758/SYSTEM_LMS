import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { memberService } from '../services/memberService'

export const useMemberStore = defineStore('member', () => {
  // ---- State ----
  const members = ref([])
  const currentMember = ref(null)
  const loading = ref(false)
  const errors = ref({})

  const pagination = reactive({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const filters = reactive({
    search: '',
    status: '',
    membership_type: '',
  })

  // ---- Actions ----

  /**
   * GET /members — admin/librarian paginated + filtered list.
   */
  async function fetchList(page = 1) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await memberService.getAll({
        page,
        search: filters.search || undefined,
        status: filters.status || undefined,
        membership_type: filters.membership_type || undefined,
      })
      members.value = data.data
      pagination.current_page = data.current_page
      pagination.last_page = data.last_page
      pagination.total = data.total
      pagination.per_page = data.per_page
    } catch (e) {
      errors.value = { general: 'Failed to load members.' }
      members.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * GET /members/{id} — admin/librarian single member detail/edit view.
   */
  async function fetchOne(id) {
    loading.value = true
    errors.value = {}
    currentMember.value = null
    try {
      const { data } = await memberService.getOne(id)
      currentMember.value = data
    } catch (e) {
      errors.value = { general: 'Failed to load member.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * GET /member/profile — self-service, logged-in member's own profile.
   * FIX: was missing entirely — this is the piece MyProfilePage.vue
   * depends on via onMounted(() => store.fetchMyProfile()).
   */
  async function fetchMyProfile() {
    loading.value = true
    errors.value = {}
    currentMember.value = null
    try {
      const { data } = await memberService.getMyProfile()
      currentMember.value = data
    } catch (e) {
      if (e.response?.status === 404) {
        errors.value = { general: 'No membership profile is linked to your account.' }
      } else {
        errors.value = { general: 'Failed to load your profile.' }
      }
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    loading.value = true
    errors.value = {}
    try {
      await memberService.create(payload)
      return true
    } catch (e) {
      errors.value = e.response?.data?.errors || { general: e.response?.data?.message || 'Failed to create member.' }
      return false
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await memberService.update(id, payload)
      currentMember.value = data.member
      return true
    } catch (e) {
      errors.value = e.response?.data?.errors || { general: e.response?.data?.message || 'Failed to update member.' }
      return false
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    errors.value = {}
    try {
      await memberService.delete(id)
      return true
    } catch (e) {
      errors.value = { general: e.response?.data?.message || 'Failed to delete member.' }
      return false
    } finally {
      loading.value = false
    }
  }

  async function restore(id) {
    loading.value = true
    errors.value = {}
    try {
      await memberService.restore(id)
      return true
    } catch (e) {
      errors.value = { general: e.response?.data?.message || 'Failed to restore member.' }
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    members,
    currentMember,
    loading,
    errors,
    pagination,
    filters,
    // actions
    fetchList,
    fetchOne,
    fetchMyProfile,
    create,
    update,
    remove,
    restore,
  }
})
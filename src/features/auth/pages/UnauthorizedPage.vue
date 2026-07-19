<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center max-w-md px-6">
      <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
        <LockClosedIcon class="w-7 h-7 text-red-500" />
      </div>

      <h1 class="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p class="text-gray-500 text-sm mb-6">
        You do not have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>

      <button
        @click="goHome"
        class="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
      >
        {{ homeLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { LockClosedIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isStaff = computed(() => ['admin', 'librarian'].includes(authStore.role))
const homeLabel = computed(() => (isStaff.value ? 'Return to Dashboard' : 'Return to My Borrows'))

function goHome() {
  if (isStaff.value) {
    router.push({ name: 'dashboard' })
  } else {
    router.push({ name: 'my-borrows-page' })
  }
}
</script>
<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
    <!-- Section title -->
    <h2 class="text-lg font-bold text-gray-800 mb-6">
      Profile Picture
    </h2>

    <div class="flex items-center gap-6">
      <!-- Avatar preview -->
      <div class="relative">
        <!-- Display the current avatar -->
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Profile Avatar"
          class="w-24 h-24 rounded-full object-cover border border-gray-200"
        />

        <!-- Display user initials if no avatar exists -->
        <div
          v-else
          class="w-24 h-24 rounded-full bg-green-700 text-white text-2xl font-extrabold flex items-center justify-center"
        >
          {{ initials }}
        </div>

        <!-- Loading overlay while uploading/removing -->
        <div
          v-if="authStore.loading"
          class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center"
        >
          <span class="text-white text-xs">...</span>
        </div>
      </div>

      <!-- Avatar actions -->
      <div class="flex flex-col gap-2">
        <!-- Upload button -->
        <label
          class="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition"
          :class="{ 'opacity-50 pointer-events-none': authStore.loading }"
        >
          Upload New Photo

          <!-- Hidden file input -->
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            class="hidden"
            :disabled="authStore.loading"
            @change="handleFileSelect"
          />
        </label>

        <!-- Remove avatar button -->
        <button
          v-if="authStore.user?.avatar"
          @click="handleRemove"
          :disabled="authStore.loading"
          class="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-50"
        >
          Remove Photo
        </button>

        <!-- Upload requirements -->
        <p class="text-xs text-gray-500">
          JPG, PNG or WEBP. Maximum file size: 2 MB.
        </p>
      </div>
    </div>

    <!-- Error message -->
    <p
      v-if="errorMessage"
      class="text-sm text-red-600 mt-4"
    >
      {{ errorMessage }}
    </p>

    <!-- Success message -->
    <p
      v-if="successMessage"
      class="text-sm text-green-600 mt-4"
    >
      {{ successMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/features/auth/store/authStore'

// Access the authentication store
const authStore = useAuthStore()

// Store success message
const successMessage = ref('')

// Store client-side validation errors
const localError = ref('')

/**
 * Generate the full avatar URL.
 *
 * Backend returns only:
 * avatars/example.jpg
 *
 * This computed property converts it to:
 * http://localhost:8000/storage/avatars/example.jpg
 */
const previewUrl = computed(() => {
  if (!authStore.user?.avatar) {
    return null
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')

  return `${baseUrl}/storage/${authStore.user.avatar}`
})

/**
 * Generate the user's initials.
 *
 * Example:
 * John Doe -> JD
 * San Channa -> SC
 */
const initials = computed(() => {
  const name = authStore.user?.name || ''

  return (
    name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  )
})

/**
 * Display validation errors.
 *
 * Priority:
 * 1. Client-side validation
 * 2. Backend avatar validation
 * 3. General backend error
 */
const errorMessage = computed(() => {
  return (
    localError.value ||
    authStore.errors?.avatar ||
    authStore.errors?.general ||
    ''
  )
})

/**
 * Reset all success and error messages.
 */
const resetMessages = () => {
  localError.value = ''
  successMessage.value = ''
  authStore.errors = {}
}

/**
 * Handle avatar file selection.
 */
const handleFileSelect = async (event) => {
  // Get the selected file
  const file = event.target.files[0]

  if (!file) return

  // Clear previous messages
  resetMessages()

  /**
   * Validate file size.
   * Maximum allowed size: 2 MB.
   */
  if (file.size > 2 * 1024 * 1024) {
    localError.value = 'File size must be under 2 MB.'

    // Reset the input
    event.target.value = ''

    return
  }

  // Upload the avatar
  const success = await authStore.uploadAvatar(file)

  if (success) {
    successMessage.value = 'Avatar updated successfully.'
  }

  /**
   * Reset the input so the same file
   * can be selected again.
   */
  event.target.value = ''
}

/**
 * Remove the current avatar.
 */
const handleRemove = async () => {
  // Clear previous messages
  resetMessages()

  // Remove avatar
  const success = await authStore.removeAvatar()

  if (success) {
    successMessage.value = 'Avatar removed successfully.'
  }
}
</script>
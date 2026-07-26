<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

      <!-- STEP 1: Registration form -->
      <template v-if="!registered">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">Library LMS</h1>
          <p class="text-gray-500 text-sm mt-1">Create a new member account</p>
        </div>

        <RegisterForm
          :loading="authStore.loading"
          :errors="authStore.errors"
          @submit="handleRegister"
        />

        <p class="text-center text-sm text-gray-500 mt-6">
          Already have an account?
          <router-link :to="{ name: 'login' }" class="text-green-700 font-medium">Sign in</router-link>
        </p>
      </template>

      <!-- STEP 2: Pending approval —
           FIX: no longer auto-generates a QR card here. Card issuance
           now ALWAYS goes through a librarian/admin approving the
           request via PendingCardsPage.vue, regardless of whether the
           account was self-registered (here) or created directly by
           staff (CreateMemberModal.vue). This makes the "admin approves
           first" rule apply uniformly to both paths. -->
      <template v-else>
        <div class="text-center">
          <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-800 mb-1">Registration Received!</h1>
          <p class="text-sm text-gray-400 mb-5">
            Your account is active — you can already log in with your email and password.
            A librarian will issue your library QR card shortly; you can check its status
            anytime from <span class="font-medium text-gray-600">Settings → Security</span>.
          </p>

          <button @click="finishAndEnter"
            class="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2.5 font-medium">
            Continue to Library LMS
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import RegisterForm from '../components/RegisterForm.vue'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const registered = ref(false)

async function handleRegister(formData) {
  const success = await authStore.register(formData)
  if (success) registered.value = true
}

function finishAndEnter() {
  router.push({ name: 'book-list' })
}
</script>
<template>
  <div v-if="store.currentLibrarian" class="space-y-6 pb-12">
    <!-- Back button -->
    <div class="flex items-center justify-between">
      <button @click="router.back()" class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs">
        <ArrowLeftIcon class="w-4 h-4" /> Back to Librarians
      </button>
    </div>

    <div class="space-y-6">
      <LibrarianCard :librarian="store.currentLibrarian" />

      <!-- QR Login Card — lets an admin (re)issue this librarian's QR
           card at any time, e.g. after they report a card lost.
           Admin-only surface: this page is already gated to role:admin
           in staff.routes.js, matching the backend rule that only an
           admin (not a librarian) may issue staff cards
           (see AuthController::generateQrTokenFor()). -->
      <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8">
        <QrLoginCardAdmin
          :user-id="store.currentLibrarian.user?.id"
          :user-name="store.currentLibrarian.user?.name"
          role="librarian"
        />
      </div>

      <!-- Edit form container matching the clean card styling -->
      <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-6">
        <h2 class="text-lg font-black text-slate-900 tracking-tight pb-4 border-b border-slate-200">Edit Librarian Details</h2>
        <LibrarianForm
          :initial-data="store.currentLibrarian"
          :is-edit="true"
          :loading="store.loading"
          :errors="store.errors"
          @submit="handleUpdate"
          @cancel="router.back()"
        />
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20 text-slate-400 font-medium text-sm">Loading...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useStaffStore } from '../store/staffStore'
import LibrarianForm from '../components/LibrarianForm.vue'
import LibrarianCard from '../components/LibrarianCard.vue'
import QrLoginCardAdmin from '@/features/settings/components/QrLoginCardAdmin.vue'

const route = useRoute()
const router = useRouter()
const store = useStaffStore()

async function handleUpdate(formData) {
  const success = await store.update(route.params.id, formData)
  if (success) router.back()
}

onMounted(() => store.fetchOne(route.params.id))
</script>
<template>
  <div v-if="store.currentLibrarian" class="space-y-4 sm:space-y-6 pb-12">
    <!-- Back button -->
    <div class="flex items-center justify-between">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-4 py-3 sm:py-2 rounded-xl border border-slate-300 dark:border-white/10 shadow-2xs cursor-pointer"
      >
        <ArrowLeftIcon class="w-4 h-4" /> {{ $t('staff.detail.backToLibrarians') }}
      </button>
    </div>

    <div class="space-y-4 sm:space-y-6">
      <LibrarianCard :librarian="store.currentLibrarian" />

      <!-- QR Login Card -->
      <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8">
        <QrLoginCardAdmin
          :user-id="store.currentLibrarian.user?.id"
          :user-name="store.currentLibrarian.user?.name"
          :id-value="store.currentLibrarian.employee_id"
          :sub-label="store.currentLibrarian.department"
          :has-card="!!store.currentLibrarian.user?.has_qr_card"
          role="librarian"
        />
      </div>

      <!-- Promote / demote (admin only — the card hides itself for other roles) -->
      <ChangeRoleCard
        :user-id="store.currentLibrarian.user?.id"
        :user-name="store.currentLibrarian.user?.name"
        :current-role="store.currentLibrarian.user?.role?.name"
        @changed="store.fetchOne(route.params.id)"
      />

      <!-- Edit form container -->
      <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight pb-4 border-b border-slate-200 dark:border-white/10">
          {{ $t('staff.detail.editDetails') }}
        </h2>
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

  <!-- Loading State -->
  <div v-else class="text-center py-20 text-slate-400 dark:text-slate-500 font-medium text-sm">
    <div class="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ $t('staff.detail.loading') }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useStaffStore } from '../store/staffStore'
import LibrarianForm from '../components/LibrarianForm.vue'
import LibrarianCard from '../components/LibrarianCard.vue'
import QrLoginCardAdmin from '@/features/settings/components/QrLoginCardAdmin.vue'
import ChangeRoleCard from '@/features/settings/components/ChangeRoleCard.vue'

const route = useRoute()
const router = useRouter()
const store = useStaffStore()

async function handleUpdate(formData) {
  const success = await store.update(route.params.id, formData)
  if (success) router.back()
}

onMounted(() => store.fetchOne(route.params.id))
</script>
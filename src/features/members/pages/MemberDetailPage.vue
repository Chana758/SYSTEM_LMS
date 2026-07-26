<template>
  <div v-if="store.currentMember" class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="flex items-center justify-between">
      <button 
        @click="router.back()" 
        class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer"
      >
        <ArrowLeftIcon class="w-4 h-4" /> 
        <span>Back to Members</span>
      </button>
    </div>

    <div class="space-y-6">
      <MemberCard :member="store.currentMember" />

      <!-- QR Login Card — lets an admin/librarian (re)issue this member's
           QR card at any time, e.g. after they report a card lost.
           QrLoginCardAdmin.vue already existed (used by
           CreateMemberModal.vue's step 2) but had nowhere to be reused
           for an EXISTING member until now. -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs">
        <QrLoginCardAdmin
          :user-id="store.currentMember.user?.id"
          :user-name="store.currentMember.user?.name"
          role="member"
        />
      </div>

      <!-- Edit Form Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs space-y-6">
        <div class="pb-4 border-b border-slate-100">
          <h2 class="font-serif text-lg font-black text-slate-900">Edit Member Details</h2>
          <p class="text-xs text-slate-500 mt-0.5">Update user credentials, maximum borrow limits, and active status.</p>
        </div>

        <MemberForm
          :initial-data="store.currentMember"
          :is-edit="true"
          :loading="store.loading"
          :errors="store.errors"
          @submit="handleUpdate"
          @cancel="router.back()"
        />
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20 text-slate-400">
    <div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Loading member details...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import MemberForm from '../components/MemberForm.vue'
import MemberCard from '../components/MemberCard.vue'
import QrLoginCardAdmin from '@/features/settings/components/QrLoginCardAdmin.vue'

const route = useRoute()
const router = useRouter()
const store = useMemberStore()

async function handleUpdate(formData) {
  const success = await store.update(route.params.id, formData)
  if (success) router.push({ name: 'member-list' })
}

onMounted(() => store.fetchOne(route.params.id))
</script>
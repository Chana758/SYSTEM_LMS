<template>
  <div v-if="store.currentMember">
    <div class="flex items-center justify-between mb-6">
      <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <ArrowLeftIcon class="w-4 h-4" /> Back to Members
      </button>
    </div>

    <div class="space-y-6">
      <MemberCard :member="store.currentMember" />

      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-base font-bold text-gray-800 mb-5">Edit Member Details</h2>
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
  <div v-else class="text-center py-16 text-gray-400 text-sm">Loading...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import MemberForm from '../components/MemberForm.vue'
import MemberCard from '../components/MemberCard.vue'

const route = useRoute()
const router = useRouter()
const store = useMemberStore()

async function handleUpdate(formData) {
  const success = await store.update(route.params.id, formData)
  if (success) router.push({ name: 'member-list' })
}

onMounted(() => store.fetchOne(route.params.id))
</script>
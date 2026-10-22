<template>
  <div v-if="store.currentMember" class="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
    <!-- ============ HEADER SECTION ============ -->
    <div class="flex items-center justify-between">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-4 py-3 sm:py-2.5 rounded-xl border border-slate-300 dark:border-white/10 shadow-2xs cursor-pointer"
      >
        <ArrowLeftIcon class="w-4 h-4" />
        <span>{{ t('members.detail.backToMembers') }}</span>
      </button>
    </div>

    <!-- Main Content Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">

      <!-- Left Column: Member Card & QR Admin Card -->
      <div class="lg:col-span-1 space-y-4 sm:space-y-6">
        <MemberCard :member="store.currentMember" />

        <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-2xs">
          <QrLoginCardAdmin
            :user-id="store.currentMember.user?.id"
            :user-name="store.currentMember.user?.name"
            :id-value="store.currentMember.membership_no"
            :sub-label="subLabel"
            :has-card="!!store.currentMember.user?.has_qr_card"
            role="member"
          />
        </div>

        <!-- Promote / demote (admin only — the card hides itself for other roles) -->
        <ChangeRoleCard
          :user-id="store.currentMember.user?.id"
          :user-name="store.currentMember.user?.name"
          :current-role="store.currentMember.user?.role?.name"
          @changed="store.fetchOne(route.params.id)"
        />
      </div>

      <!-- Right Column: Edit Form Card (first on phones, so the main task is at the top) -->
      <div class="order-first lg:order-none lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-2xs space-y-5 sm:space-y-6">
        <div class="pb-4 border-b border-slate-200 dark:border-white/10">
          <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ t('members.detail.editDetails') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('members.detail.editDetailsSubtitle') }}</p>
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

  <!-- Loading State -->
  <div v-else class="text-center py-20 text-slate-400">
    <div class="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('members.detail.loading') }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import MemberForm from '../components/MemberForm.vue'
import MemberCard from '../components/MemberCard.vue'
import QrLoginCardAdmin from '@/features/settings/components/QrLoginCardAdmin.vue'
import ChangeRoleCard from '@/features/settings/components/ChangeRoleCard.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useMemberStore()

const subLabel = computed(() =>
  store.currentMember?.membership_type
    ? `${store.currentMember.membership_type} ${t('members.card.membershipSuffix')}`
    : ''
)

async function handleUpdate(formData) {
  const success = await store.update(route.params.id, formData)
  if (success) router.push({ name: 'member-list' })
}

onMounted(() => store.fetchOne(route.params.id))
</script>
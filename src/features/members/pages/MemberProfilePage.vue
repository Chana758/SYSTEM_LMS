 <template>
  <div v-if="store.currentMember">
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight mb-6">My Profile</h1>

    <div class="space-y-6">
      <MemberCard :member="store.currentMember" />

      <!-- Quick stats — self-service links, no edit rights here -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <router-link
          :to="{ name: 'my-borrows-page' }"
          class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 flex items-center gap-3 hover:border-green-300 transition-colors"
        >
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <ClockIcon class="w-5 h-5 text-green-700" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800">My Borrows</p>
            <p class="text-xs text-gray-400">View active checkouts</p>
          </div>
        </router-link>

        <router-link
          :to="{ name: 'my-reservations' }"
          class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 flex items-center gap-3 hover:border-green-300 transition-colors"
        >
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <CalendarDaysIcon class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800">My Reservations</p>
            <p class="text-xs text-gray-400">Track your queue position</p>
          </div>
        </router-link>

        <router-link
          to="/fines"
          class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 flex items-center gap-3 hover:border-green-300 transition-colors"
        >
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <BanknotesIcon class="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800">My Fines</p>
            <p class="text-xs text-gray-400">Check outstanding balance</p>
          </div>
        </router-link>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-base font-bold text-gray-800 mb-4">Contact Details</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Phone Number</p>
            <p class="text-gray-700">{{ store.currentMember.user?.phone || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Identity Card No.</p>
            <p class="text-gray-700">{{ store.currentMember.identity_card_no || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Emergency Contact</p>
            <p class="text-gray-700">{{ store.currentMember.emergency_contact || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Address</p>
            <p class="text-gray-700">{{ store.currentMember.address || '—' }}</p>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-5">
          To update your contact details, please visit the library desk or contact a librarian.
        </p>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16 text-gray-400 text-sm">Loading...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ClockIcon, CalendarDaysIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import MemberCard from '../components/MemberCard.vue'

const store = useMemberStore()

onMounted(() => store.fetchMyProfile())
</script>
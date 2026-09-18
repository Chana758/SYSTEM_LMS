<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          💳
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('fines.myFines.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('fines.myFines.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- Main Large Container with Dashed Inner Border matching Reservations Style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-6 border-dashed">
      
      <!-- Balance Card with Original Green Theme -->
      <div class="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl border-2 border-green-800 p-6 sm:p-8 shadow-lg text-white relative overflow-hidden flex flex-col justify-between">
        <div class="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="space-y-1 relative z-10">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-900/80 text-white border border-green-500/40">
            <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
            {{ t('fines.myFines.balanceOverview') }}
          </span>
          <p class="text-xs font-bold text-emerald-100 uppercase tracking-widest pt-2">{{ t('fines.myFines.totalOutstanding') }}</p>
          <p class="text-4xl sm:text-5xl font-black tracking-tight">${{ Number(store.myTotalUnpaid || 0).toFixed(2) }}</p>
        </div>
        <div class="mt-4 pt-4 border-t border-green-600/50 relative z-10 flex items-center gap-2">
          <span class="text-base">ℹ️</span>
          <p class="text-xs font-bold text-emerald-100" v-if="store.myTotalUnpaid > 0">
            {{ t('fines.myFines.settleHint') }}
          </p>
          <p class="text-xs font-bold text-emerald-100" v-else>
            {{ t('fines.myFines.allClearHint') }}
          </p>
        </div>
      </div>

      <!-- Fine Records List Section -->
      <div class="space-y-4 pt-2">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">{{ t('fines.myFines.fineRecords') }}</h3>
          <span class="text-xs font-bold text-slate-400">{{ store.myFines.length }} {{ t('fines.myFines.recordsFound') }}</span>
        </div>

        <div v-if="store.loading" class="text-center py-16 text-slate-400 font-bold text-xs uppercase tracking-widest">
          {{ t('fines.myFines.loading') }}
        </div>
        
        <div v-else-if="!store.myFines.length" class="text-center py-16 space-y-3">
          <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center mx-auto text-xl shadow-2xs text-emerald-600">
            ✨
          </div>
          <div>
            <p class="text-sm font-black text-slate-900 uppercase tracking-wider">{{ t('fines.myFines.noRecords') }}</p>
            <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('fines.myFines.noRecordsHint') }}</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="fine in store.myFines" :key="fine.id" class="bg-slate-50/70 rounded-2xl border-2 border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-all shadow-2xs">
            <div class="flex justify-between items-start gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                  :class="fine.status === 'unpaid' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'">
                  <BookOpenIcon class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-xs font-black text-slate-900 tracking-tight line-clamp-1">{{ fine.borrow?.book_copy?.book?.title || 'Unknown Book' }}</p>
                  <p class="text-[11px] font-bold text-slate-500 capitalize">{{ t('fines.reason') }}: {{ fine.reason }}</p>
                </div>
              </div>
              <FineStatusBadge :status="fine.status" />
            </div>

            <div class="flex justify-between items-center pt-3 border-t border-slate-200/80">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ formatDate(fine.created_at) }}</span>
              <span class="text-base font-black" :class="fine.status === 'unpaid' ? 'text-rose-600' : 'text-slate-900'">
                ${{ Number(fine.amount).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { useFineStore } from '../store/fineStore'
import FineStatusBadge from '../components/FineStatusBadge.vue'

const { t } = useI18n()
const store = useFineStore()

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB') : '—'
}

onMounted(() => store.fetchMyFines())
</script>
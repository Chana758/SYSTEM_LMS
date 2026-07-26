<template>
  <div class="space-y-6 pb-12">
    <!-- ============ MAIN CONTAINER WRAPPER ============ -->
    <div class="bg-white rounded-3xl border border-slate-300/80 shadow-sm p-6 md:p-8 space-y-8">

      <!-- HEADER SECTION -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p class="text-xs font-semibold text-slate-500 mt-0.5">Welcome back! Here is what's happening in your library today.</p>
        </div>
        <div class="flex items-center gap-3 self-start sm:self-auto">
          <span class="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-300 flex items-center gap-2 shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online
          </span>
        </div>
      </div>

      <!-- Real Stats (4 Distinct Color Themes matching Book Management) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Card 1: Total Books (Blue) -->
        <div class="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-300 group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <BookOpenIcon class="w-5 h-5"/>
            </div>
            <span class="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">Total</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{{ store.stats.total_books }}</p>
            <p class="text-[11px] font-bold text-blue-700 tracking-wide">Total Books</p>
          </div>
        </div>

        <!-- Card 2: Available Books (Emerald / Success) -->
        <div class="bg-gradient-to-br from-emerald-50/70 via-white to-white rounded-2xl border border-emerald-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-300 group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <CheckCircleIcon class="w-5 h-5"/>
            </div>
            <span class="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">Stock</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{{ store.stats.available_books }}</p>
            <p class="text-[11px] font-bold text-emerald-700 tracking-wide">Available Books</p>
          </div>
        </div>

        <!-- Card 3: Active Members (Amber / Live) -->
        <div class="bg-gradient-to-br from-amber-50/70 via-white to-white rounded-2xl border border-amber-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-amber-300 group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <UsersIcon class="w-5 h-5"/>
            </div>
            <span class="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">Users</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{{ store.stats.total_members }}</p>
            <p class="text-[11px] font-bold text-amber-700 tracking-wide">Active Members</p>
          </div>
        </div>

        <!-- Card 4: Borrowed Today (Purple) -->
        <div class="bg-gradient-to-br from-purple-50/70 via-white to-white rounded-2xl border border-purple-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-purple-300 group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ArrowsRightLeftIcon class="w-5 h-5"/>
            </div>
            <span class="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/60">Today</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{{ store.stats.borrowed_today }}</p>
            <p class="text-[11px] font-bold text-purple-700 tracking-wide">Borrowed Today</p>
          </div>
        </div>

      </div>

      <!-- Quick Actions -->
      <QuickActions />

      <!-- Circulation Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Circulation Overview Card -->
        <div class="bg-gradient-to-br from-slate-50/50 via-white to-white rounded-2xl border border-slate-300 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div>
                <h3 class="text-base font-black text-slate-900 tracking-tight">Circulation Overview</h3>
                <p class="text-xs font-semibold text-slate-500 mt-0.5">Current borrowing activity and financial status.</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-300 shadow-2xs flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Data
              </span>
            </div>

            <div class="space-y-3.5">
              <!-- Currently Borrowed -->
              <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <BookOpenIcon class="w-4 h-4" />
                  </div>
                  <span class="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Currently Borrowed</span>
                </div>
                <span class="font-black text-slate-900 font-mono text-base px-3 py-0.5 rounded-lg bg-slate-50 border border-slate-200">{{ store.stats.currently_borrowed }}</span>
              </div>

              <!-- Overdue Books -->
              <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <ExclamationTriangleIcon class="w-4 h-4" />
                  </div>
                  <span class="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Overdue Books</span>
                </div>
                <span class="font-black text-rose-600 font-mono text-base px-3 py-0.5 rounded-lg bg-rose-50/60 border border-rose-200">{{ store.stats.overdue_count }}</span>
              </div>

              <!-- Unpaid Fines -->
              <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <BanknotesIcon class="w-4 h-4" />
                  </div>
                  <span class="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Unpaid Fines</span>
                </div>
                <span class="font-black text-rose-600 font-mono text-base px-3 py-0.5 rounded-lg bg-rose-50/60 border border-rose-200">${{ store.stats.unpaid_fines_total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Warning Card -->
        <div class="bg-gradient-to-br from-rose-50/30 via-white to-white rounded-2xl border border-slate-300 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div>
                <h3 class="text-base font-black text-slate-900 tracking-tight">Stock Warning</h3>
                <p class="text-xs font-semibold text-slate-500 mt-0.5">Books running low on available quantity.</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider border border-rose-300 shadow-2xs flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                Inventory Alert
              </span>
            </div>

            <div v-if="!store.stats.low_stock_books.length" class="text-slate-500 text-xs font-bold py-14 text-center bg-white rounded-xl border border-dashed border-slate-300 shadow-2xs">
              🎉 Awesome! No books are low on stock.
            </div>
            <div v-else class="space-y-3 overflow-y-auto max-h-[240px] pr-1">
              <div v-for="b in store.stats.low_stock_books" :key="b.id" class="flex justify-between items-center text-sm bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-rose-200 transition">
                <div class="flex items-center gap-3 min-w-0 pr-2">
                  <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                    <ExclamationCircleIcon class="w-4 h-4" />
                  </div>
                  <span class="font-bold text-slate-800 text-xs truncate">{{ b.title }}</span>
                </div>
                <span class="text-rose-600 font-black text-xs font-mono bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 flex-shrink-0">{{ b.available_qty }}/{{ b.total_qty }} left</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Revenue Trend + Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart :data="store.revenueChart" :loading="store.revenueLoading" />
        <RecentActivities :items="store.recentActivities" :loading="store.activitiesLoading" />
      </div>

      <!-- Smart Features Showcase -->
      <div class="pt-2">
        <div class="mb-4">
          <h3 class="text-lg font-black text-slate-900 tracking-tight">Smart Tools</h3>
          <p class="text-xs font-semibold text-slate-500 mt-0.5">Quick access to AI-powered modules and hardware integrations.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SmartFeatureCard
            title="AI Chatbot"
            description="Ask the assistant to find books, check due dates, or get help."
            :icon="CpuChipIcon"
            to="/chatbot"
          />
          <SmartFeatureCard
            title="AI Recommendations"
            description="Personalized book suggestions based on borrowing history."
            :icon="SparklesIcon"
            to="/ai-recommendation"
          />
          <SmartFeatureCard
            title="Barcode Scanner"
            description="Scan book barcodes for instant borrow/return."
            :icon="QrCodeIcon"
            to="/scanner"
          />
          <SmartFeatureCard
            title="Digital Library"
            description="Browse and read e-books directly online."
            :icon="DocumentTextIcon"
            to="/digital-library"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '../store/dashboardStore'
import QuickActions from '../components/QuickActions.vue'
import RecentActivities from '../components/RecentActivities.vue'
import RevenueChart from '../components/RevenueChart.vue'
import SmartFeatureCard from '../components/SmartFeatureCard.vue'
import {
  BookOpenIcon,
  CheckCircleIcon,
  UsersIcon,
  ArrowsRightLeftIcon,
  CpuChipIcon,
  SparklesIcon,
  QrCodeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline'

const store = useDashboardStore()

onMounted(() => {
  store.fetchAll()
})
</script>
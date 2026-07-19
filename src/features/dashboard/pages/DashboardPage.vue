<template>
  <div class="space-y-6">
    <!-- Real Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      <StatsCard title="Total Books" :value="stats.total_books" :icon="BookOpenIcon" />
      <StatsCard title="Available Books" :value="stats.available_books" :icon="CheckCircleIcon" />
      <StatsCard title="Active Members" :value="stats.total_members" :icon="UsersIcon" />
      <StatsCard title="Borrowed Today" :value="stats.borrowed_today" :icon="ArrowsRightLeftIcon" />
    </div>

    <!-- Circulation Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 class="font-bold text-slate-700 mb-4">Circulation Overview</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between items-center">
            <span class="text-gray-500">Currently Borrowed</span>
            <span class="font-semibold text-gray-800">{{ stats.currently_borrowed }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">Overdue Books</span>
            <span class="font-semibold text-red-600">{{ stats.overdue_count }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">Unpaid Fines</span>
            <span class="font-semibold text-red-600">${{ stats.unpaid_fines_total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 class="font-bold text-slate-700 mb-4">Stock Warning</h3>
        <div v-if="!stats.low_stock_books.length" class="text-gray-400 text-sm py-6 text-center">
          No books are low on stock
        </div>
        <div v-for="b in stats.low_stock_books" :key="b.id" class="flex justify-between items-center text-sm border-b border-gray-100 py-2 last:border-0">
          <span class="text-gray-700">{{ b.title }}</span>
          <span class="text-red-500 font-medium">{{ b.available_qty }}/{{ b.total_qty }} left</span>
        </div>
      </div>
    </div>

    <!-- Smart Features Showcase -->
    <div>
      <h3 class="font-bold text-slate-700 mb-4">Smart Tools</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import apiClient from '@/api/axios'
import StatsCard from '../components/StatsCard.vue'
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
} from '@heroicons/vue/24/outline'

const stats = reactive({
  total_books: 0,
  available_books: 0,
  total_members: 0,
  borrowed_today: 0,
  currently_borrowed: 0,
  overdue_count: 0,
  unpaid_fines_total: 0,
  low_stock_books: [],
})

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/dashboard')
    Object.assign(stats, data)
  } catch (e) {
    console.error('Failed to load dashboard stats', e)
  }
})
</script>
<template>
  <div class="flex h-screen bg-slate-100">
    <Sidebar 
      :is-collapsed="isSidebarCollapsed" 
      :class="isSidebarCollapsed ? 'w-20' : 'w-64'" 
      class="transition-all duration-300 ease-in-out" 
    />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />
      
      <main class="flex-1 overflow-y-auto p-6 bg-slate-100">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'

/**
 * NOTES:
 * 1. 'isSidebarCollapsed': A reactive reference (ref) that holds the state of the sidebar.
 * 2. 'ref(false)': Initially, the sidebar is set to expanded (false).
 * 3. Event Handling: The Navbar emits an event that flips the boolean value, 
 * which immediately updates the CSS class on the Sidebar component.
 */
const isSidebarCollapsed = ref(false)
</script>
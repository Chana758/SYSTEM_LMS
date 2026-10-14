 <template>
  <div class="flex h-screen bg-slate-100">
    <Sidebar
      :is-collapsed="isSidebarCollapsed"
      :class="isSidebarCollapsed ? 'w-20' : 'w-64'"
      class="transition-all duration-300 ease-in-out flex-shrink-0"
    />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />

      <main class="flex-1 overflow-y-auto p-6 bg-slate-100">
        <router-view />
      </main>

      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

const isSidebarCollapsed = ref(false)
</script>
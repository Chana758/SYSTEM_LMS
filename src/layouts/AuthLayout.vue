<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <aside class="w-64 bg-[#16a34a] text-white flex flex-col shadow-lg">
      <div class="p-5 text-2xl font-bold flex items-center border-b border-green-600">
        <span class="mr-2">📁</span> BillPosware
      </div>
      <nav class="flex-1 overflow-y-auto p-4 space-y-1">
        <router-link to="/dashboard" class="flex items-center px-4 py-3 rounded hover:bg-green-600 transition">
          <span class="mr-3">🏠</span> Dashboard
        </router-link>
        <router-link to="/products" class="flex items-center px-4 py-3 rounded hover:bg-green-600 transition">
          <span class="mr-3">📦</span> Products
        </router-link>
        <router-link to="/sell" class="flex items-center px-4 py-3 rounded hover:bg-green-600 transition">
          <span class="mr-3">💰</span> Sell
        </router-link>
      </nav>
    </aside>

    <main class="flex-1 flex flex-col">
      <header class="bg-white shadow-sm h-16 flex items-center justify-between px-8">
        <h2 class="text-xl font-bold text-gray-700">Financial Dashboard</h2>
        <input type="text" placeholder="Search..." class="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none" />
      </header>
      <div class="p-8 overflow-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>
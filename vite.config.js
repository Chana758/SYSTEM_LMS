import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,         
    allowedHosts: true,  
    proxy: {
      '/api':               { target: 'http://localhost:8000', changeOrigin: true },
      '/broadcasting/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/app':                { target: 'ws://localhost:8080', ws: true, changeOrigin: true },
      '/storage':            { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
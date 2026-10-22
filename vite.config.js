import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Library System',
        short_name: 'Library',
        description: 'Smart library for members',
        lang: 'en',
        start_url: '/books',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#14532d',
        theme_color: '#14532d',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Never answer API, uploads or websocket auth with the app shell
        navigateFallbackDenylist: [/^\/api/, /^\/storage/, /^\/broadcasting/],
        runtimeCaching: [
          {
            // Book covers: open the catalog fast on mobile data
            urlPattern: ({ url }) => url.pathname.startsWith('/storage/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'book-covers',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Kantumruy Pro CSS
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            // Kantumruy Pro font files (Khmer text renders correctly offline too)
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
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
      '/app':               { target: 'ws://localhost:8080', ws: true, changeOrigin: true },
      '/storage':           { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
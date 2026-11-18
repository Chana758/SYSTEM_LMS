import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import os from 'node:os'

// First LAN IPv4 of this computer (e.g. 192.168.1.20), so a phone on the same Wi-Fi can open the app.
function lanIp() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list ?? []) {
      if (a.family === 'IPv4' && !a.internal) return a.address
    }
  }
  return ''
}

export default defineConfig(async ({ mode, command }) => {
  // BACKEND_URL (shell or .env) picks the backend the dev server proxies to.
  // Default = real backend on 8000; use http://localhost:8001 for the demo backend.
  const env = loadEnv(mode, process.cwd(), '')
  const backend = process.env.BACKEND_URL || env.BACKEND_URL || 'http://localhost:8000'

  // `npm run dev:phone` = HTTPS dev server. Phones only allow the camera on HTTPS pages,
  // so the Remote scan page needs it. Needs: npm i -D @vitejs/plugin-basic-ssl
  const devHttps = command === 'serve' && (process.env.DEV_HTTPS || env.DEV_HTTPS) === '1'
  const sslPlugins = devHttps ? [(await import('@vitejs/plugin-basic-ssl')).default()] : []

  return {
    define: {
      // Used by the Remote scan QR when the laptop opened the app on "localhost".
      __DEV_LAN_IP__: JSON.stringify(command === 'serve' ? lanIp() : ''),
    },
    plugins: [
      ...sslPlugins,
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
        '/api':               { target: backend, changeOrigin: true },
        '/broadcasting/auth': { target: backend, changeOrigin: true },
        '/app':               { target: 'ws://localhost:8080', ws: true, changeOrigin: true },
        '/storage':           { target: backend, changeOrigin: true },
      },
    },
  }
})
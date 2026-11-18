import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

export function createEcho() {
  const isSecure = window.location.protocol === 'https:'
  // Same host + port as the page: in dev the Vite server proxies /app to Reverb,
  // over http (5173) or https (npm run dev:phone). In production: 443 / 80.
  const port = Number(window.location.port) || (isSecure ? 443 : 80)

  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: window.location.hostname,
    wsPort: port,
    wssPort: port,
    forceTLS: isSecure,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${window.location.origin}/broadcasting/auth`,
    auth: {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    },
  })
}
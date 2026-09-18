import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

export function createEcho() {
  const isSecure = window.location.protocol === 'https:'

  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: window.location.hostname,
    wsPort: isSecure ? 443 : 5173,
    wssPort: 443,
    forceTLS: isSecure,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${window.location.origin}/broadcasting/auth`,
    auth: {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    },
  })
}
// Voice for the kiosk at the door (Sam).
//
// 1. A recorded Khmer clip, if the school put one in public/sounds/kiosk/<key>.mp3
//    (works the same on every tablet).
// 2. Otherwise the browser's text-to-speech, only when the tablet has a voice for the language
//    (Android tablets usually have Khmer; desktop Chrome often has not).
// 3. Otherwise nothing: the screen and the beep still say what happened.

const PHRASES = {
  km: {
    welcome: 'សូមស្វាគមន៍',
    goodbye: 'លាហើយ សូមអរគុណ',
    already_in: 'អ្នកបានចូលរួចហើយ',
    not_in: 'ទ្វារបើកឲ្យចេញ',
    denied: 'សូមទាក់ទងបណ្ណារក្ស',
    guest: 'សូមស្វាគមន៍ភ្ញៀវ',
    reminder: 'អ្នកមានសៀវភៅត្រូវសងឆាប់ៗនេះ',
  },
  en: {
    welcome: 'Welcome',
    goodbye: 'Goodbye, thank you',
    already_in: 'You are already checked in',
    not_in: 'The door is open',
    denied: 'Please see the librarian',
    guest: 'Welcome, guest',
    reminder: 'You have books due soon',
  },
}

const clipCache = {}      // key -> true (exists) | false (missing)
let settings = { enabled: true, name: true, volume: 0.8 }

export function configureVoice({ enabled = true, name = true, volume = 80 } = {}) {
  settings = { enabled, name, volume: Math.min(1, Math.max(0, volume / 100)) }
}

function pickVoice(lang) {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang?.toLowerCase().startsWith(lang)) || null
}

function speak(text, lang) {
  const voice = pickVoice(lang)
  if (!voice) return false
  const u = new SpeechSynthesisUtterance(text)
  u.voice = voice
  u.lang = voice.lang
  u.volume = settings.volume
  u.rate = 0.95
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
  return true
}

function playClip(key) {
  if (clipCache[key] === false) return Promise.resolve(false)
  return new Promise((resolve) => {
    const audio = new Audio(`/sounds/kiosk/${key}.mp3`)
    audio.volume = settings.volume
    audio.onended = () => resolve(true)
    audio.onerror = () => {
      clipCache[key] = false
      resolve(false)
    }
    audio.play().then(() => (clipCache[key] = true)).catch(() => {
      clipCache[key] = false
      resolve(false)
    })
  })
}

/**
 * Say what happened. `key` is welcome | goodbye | already_in | not_in | denied | guest,
 * `name` is optional, `lang` is 'km' or 'en'.
 */
export async function announce(key, { name = '', lang = 'km', reminder = false } = {}) {
  if (!settings.enabled) return
  const phrases = PHRASES[lang] || PHRASES.km
  const withName = settings.name && name && key !== 'denied'

  // Recorded clip first; the name (if any) follows by text-to-speech
  const played = await playClip(key)
  if (played) {
    if (withName) speak(name, lang)
    if (reminder) await playClip('reminder')
    return
  }

  const text = [phrases[key], withName ? name : '', reminder ? phrases.reminder : ''].filter(Boolean).join(' ')
  speak(text, lang)
}

// Some browsers load the voice list late
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
}

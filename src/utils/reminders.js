// Daily workout reminders — no server, so this uses the browser's own
// notification machinery. On installed Chrome/Android PWAs, Periodic
// Background Sync lets the service worker fire a reminder once a day even
// with the app closed. Elsewhere (notably iOS) there is no background
// path without a push server, so the toggle is honest about that.

const SYNC_TAG = 'daily-workout'

export function notificationsSupported() {
  return typeof Notification !== 'undefined' && 'serviceWorker' in navigator
}

export async function enableReminders() {
  if (!notificationsSupported()) {
    return { ok: false, mode: 'unsupported' }
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { ok: false, mode: 'denied' }
  }

  let mode = 'foreground'
  try {
    const registration = await navigator.serviceWorker.ready
    if ('periodicSync' in registration) {
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync'
      })
      if (status.state === 'granted') {
        await registration.periodicSync.register(SYNC_TAG, {
          minInterval: 20 * 60 * 60 * 1000
        })
        mode = 'background'
      }
    }
  } catch {
    // Periodic sync unavailable — permission itself is still granted.
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification('MYFITNESS', {
      body: 'Daily reminders are on. See you at the next workout!',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png'
    })
  } catch {
    // A failed test notification is not a failure of enabling.
  }

  return { ok: true, mode }
}

export async function disableReminders() {
  try {
    const registration = await navigator.serviceWorker.ready
    if ('periodicSync' in registration) {
      await registration.periodicSync.unregister(SYNC_TAG)
    }
  } catch {
    // Nothing to clean up.
  }
}

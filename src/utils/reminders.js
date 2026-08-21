// Daily workout reminders — no server, so this uses the browser's own
// notification machinery. The user picks a reminder time; the app checks
// it every minute while running (exact), and on installed Chrome/Android
// PWAs the service worker's periodic background sync applies the same
// time gate so the closed-app reminder arrives at or shortly after the
// chosen time. Elsewhere (notably iOS) there is no background path
// without a push server, so the toggle is honest about that.

import { getMeta, saveMeta } from '../storage/database.js'
import { getScheduleForDay, getWorkout } from '../data/workouts.js'
import { toDateKey } from './dates.js'

const SYNC_TAG = 'daily-workout'
export const DEFAULT_REMINDER_TIME = '08:00'

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
        // Shorter interval = more chances to land close to the chosen
        // time; the handler itself makes sure only one fires per day.
        await registration.periodicSync.register(SYNC_TAG, {
          minInterval: 4 * 60 * 60 * 1000
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

// Called by the app every minute while it runs: fires the daily reminder
// exactly once, at or after the chosen time. The same once-per-day state
// (meta 'reminderState') is shared with the service worker so the user
// never gets the reminder twice.
export async function maybeShowDueReminder(settings) {
  if (!settings?.reminders) return
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (!('serviceWorker' in navigator)) return

  const now = new Date()
  const [h, m] = (settings.reminderTime || DEFAULT_REMINDER_TIME).split(':').map(Number)
  const target = new Date(now)
  target.setHours(h || 0, m || 0, 0, 0)
  if (now < target) return

  const todayKey = toDateKey(now)
  try {
    const state = await getMeta('reminderState')
    if (state?.lastShownDate === todayKey) return

    const entry = getScheduleForDay(now.getDay())
    const body =
      entry.kind === 'workout'
        ? `${getWorkout(entry.workoutId).name} today. Time to train!`
        : entry.kind === 'recovery'
          ? 'Recovery day — full rest or light movement.'
          : 'Rest day — recover, meal prep, and get ready for next week.'

    const registration = await navigator.serviceWorker.ready
    await registration.showNotification('MYFITNESS', {
      body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'daily-workout'
    })
    await saveMeta('reminderState', { lastShownDate: todayKey })
  } catch {
    // No service worker in dev, or storage hiccup — try again next tick.
  }
}

/* MYFITNESS service worker.
   App shell is precached on install; everything else same-origin is cached
   at runtime (stale-while-revalidate), so the app keeps working offline
   after the first visit. Workout data lives in IndexedDB, not here. */

const CACHE_NAME = 'myfitness-v3';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network first so updates land, cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() =>
          caches.match('./index.html').then((cached) => cached || caches.match('./'))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

/* ---------- Daily workout reminders ---------- */
/* Fired by Periodic Background Sync where the platform supports it
   (installed Chrome/Android PWAs). The sync may run several times a day;
   this handler gates it to the user's chosen reminder time and shows at
   most one notification per day. Settings and the once-per-day state are
   shared with the app through the same IndexedDB meta store. */

const DAY_MESSAGES = {
  0: 'Rest day — recover, meal prep, and get ready for next week.',
  1: 'Upper Body A today. Time to train!',
  2: 'Lower Body & Core A today. Time to train!',
  3: 'Recovery day — full rest or a light walk.',
  4: 'Recovery day — light stretching or mobility.',
  5: 'Upper Body B today. Time to train!',
  6: 'Lower Body & Core B today. Time to train!'
};

function metaGet(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open('femurfit-db');
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('meta')) {
        db.close();
        resolve(null);
        return;
      }
      const get = db.transaction('meta', 'readonly').objectStore('meta').get(key);
      get.onsuccess = () => {
        resolve(get.result ? get.result.value : null);
        db.close();
      };
      get.onerror = () => {
        resolve(null);
        db.close();
      };
    };
    request.onerror = () => resolve(null);
  });
}

function metaPut(key, value) {
  return new Promise((resolve) => {
    const request = indexedDB.open('femurfit-db');
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('meta')) {
        db.close();
        resolve();
        return;
      }
      const put = db.transaction('meta', 'readwrite').objectStore('meta').put({ key, value });
      put.onsuccess = put.onerror = () => {
        resolve();
        db.close();
      };
    };
    request.onerror = () => resolve();
  });
}

function todayKey(now) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function maybeShowDailyReminder() {
  const settings = await metaGet('settings');
  if (!settings || !settings.reminders) return;

  const now = new Date();
  const [h, m] = String(settings.reminderTime || '08:00').split(':').map(Number);
  const target = new Date(now);
  target.setHours(h || 0, m || 0, 0, 0);
  if (now < target) return; // not yet time today

  const key = todayKey(now);
  const state = await metaGet('reminderState');
  if (state && state.lastShownDate === key) return; // already reminded today

  await self.registration.showNotification('MYFITNESS', {
    body: DAY_MESSAGES[now.getDay()],
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: 'daily-workout'
  });
  await metaPut('reminderState', { lastShownDate: key });
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-workout') {
    event.waitUntil(maybeShowDailyReminder());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('./');
    })
  );
});

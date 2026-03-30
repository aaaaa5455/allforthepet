// ── All For The Pet — Service Worker ──────────────────────────────────────────
const CACHE = 'aftp-v2';

const PRECACHE = [
  './',
  './index.html',
  './login.html',
  './dashboard.html',
  './chat.html',
  './appointments.html',
  './trends.html',
  './nutrition.html',
  './records.html',
  './pricing.html',
  './pitch.html',
  './auth.js',
  './pwa.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

// ── Install: precache all local assets ────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls — always go to network
  if (url.hostname.includes('supabase.co')) return;

  // Skip Overpass / OpenStreetMap API calls — always network
  if (url.hostname.includes('overpass-api.de') || url.hostname.includes('openstreetmap.org')) return;

  // External CDN (fonts, leaflet, supabase-js): network first, cache fallback
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Local assets: cache first, network fallback
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: serve dashboard for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('./dashboard.html');
        }
      });
    })
  );
});

// ── Notification click → open the relevant page ───────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const tag = event.notification.tag;

  // Map alert tags to destination pages
  const dest = tag === 'hr-high'    ? './appointments.html'
             : tag === 'hr-low'     ? './appointments.html'
             : tag === 'steps-low'  ? './chat.html'
             : './dashboard.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Focus existing tab if already open
      for (const c of list) {
        if (c.url.includes(dest.replace('./', '')) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(dest);
    })
  );
});

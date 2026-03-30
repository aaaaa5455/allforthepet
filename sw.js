// ── All For The Pet — Service Worker ──────────────────────────────────────────
const CACHE = 'aftp-v1';

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

// Perry's Hairline Service Worker — caches static assets for offline browsing
const CACHE = 'perrys-v1';
const STATIC = [
  '/',
  '/src/main.jsx',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC).catch(() => {}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests for same-origin or CDN assets
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Don't intercept Supabase API, Paystack, or external services
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('fonts.googleapis.com')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

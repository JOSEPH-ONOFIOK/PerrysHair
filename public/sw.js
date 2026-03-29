// Perry's Hairline Service Worker
const CACHE_STATIC = 'perrys-static-v2';
const CACHE_IMAGES = 'perrys-images-v2';

const PRECACHE = ['/', '/manifest.json'];

// Install — precache shell
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_STATIC).then((c) => c.addAll(PRECACHE).catch(() => {}))
  );
});

// Activate — clear old caches
self.addEventListener('activate', (e) => {
  const keep = [CACHE_STATIC, CACHE_IMAGES];
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Skip Supabase, Paystack, exchange-rate API — always network
  const skipHosts = ['supabase.co', 'paystack.co', 'open.er-api.com', 'vercel.live'];
  if (skipHosts.some((h) => url.hostname.includes(h))) return;

  // Images — cache-first, long lived
  const isImage =
    e.request.destination === 'image' ||
    /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/.test(url.pathname);

  if (isImage) {
    e.respondWith(
      caches.open(CACHE_IMAGES).then((cache) =>
        cache.match(e.request).then((cached) => {
          if (cached) return cached;
          return fetch(e.request).then((res) => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // JS/CSS assets (hashed filenames) — cache-first
  const isAsset = /\/assets\//.test(url.pathname);
  if (isAsset) {
    e.respondWith(
      caches.open(CACHE_STATIC).then((cache) =>
        cache.match(e.request).then((cached) => {
          if (cached) return cached;
          return fetch(e.request).then((res) => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // HTML / navigation — network-first, fallback to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_STATIC).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('/'))
    );
  }
});

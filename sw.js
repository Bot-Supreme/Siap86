// Gang Joker Digital — Service Worker
// Caching dasar agar shell aplikasi bisa diakses offline.

const CACHE_NAME = 'gang-joker-digital-v1';

const ASSETS = [
  './index.html',
  './manifest.json',
  './lumbung-pangan/index.html',
  './lumbung-pangan/LP-Ultima.html',
  './lumbung-pangan/logo-lumbung-pangan.png',
  './kas-gang/index.html',
  './kas-gang/Kas.html',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// Gang Joker Digital — Service Worker
// Dashboard offline, modul Kas & LP selalu online

const CACHE_NAME = 'gang-joker-digital-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );

  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ====================================
  // KAS GANG & LUMBUNG PANGAN
  // SELALU AMBIL VERSI TERBARU
  // ====================================

  if (
    url.pathname.includes('/kas-gang/') ||
    url.pathname.includes('/lumbung-pangan/')
  ) {

    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );

    return;
  }

  // ====================================
  // DASHBOARD PWA
  // CACHE FIRST
  // ====================================

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {

          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }

          return networkResponse;
        });

    })
  );

});

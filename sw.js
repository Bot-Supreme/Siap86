// Gang Joker Digital — Service Worker
// v2: network-first untuk HTML/JSON (biar update selalu kebaca),
//     cache-first hanya untuk aset statis (ikon) yang jarang berubah.

const CACHE_NAME = 'gang-joker-digital-v2'; // ADDITIF: versi dinaikkan agar cache lama (v1) otomatis dihapus

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

// File yang SERING diubah (HTML & JSON) -> selalu coba jaringan dulu,
// supaya begitu di-push ke GitHub, pengguna langsung lihat versi terbaru.
// Cache cuma dipakai sebagai cadangan kalau lagi offline.
function isFreshContent(url) {
  return url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname.endsWith('/');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (isFreshContent(url)) {
    // ── NETWORK-FIRST ──
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ── CACHE-FIRST (ikon, aset statis) ──
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

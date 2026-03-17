/* Filmingtopia Service Worker — network-first */
const CACHE = 'filmingtopia-v3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // External APIs: always network only
  if (url.includes('themoviedb.org') || url.includes('upcitemdb.com') ||
      url.includes('script.google.com') || url.includes('fonts.g') ||
      url.includes('unpkg.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }

  // App shell: network-first, cache as fallback
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'})
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

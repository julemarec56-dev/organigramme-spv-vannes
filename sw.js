const CACHE = 'spv-vannes-v7';
const ASSETS = [
  '/organigramme-spv-vannes/icons/icon-192.png',
  '/organigramme-spv-vannes/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // HTML et Firebase : toujours réseau, jamais de cache
  if (url.includes('firebasedatabase') ||
      url.includes('firebase') ||
      url.endsWith('.html') ||
      url.endsWith('/') ||
      url.includes('?')) {
    e.respondWith(fetch(e.request, {cache: 'no-store'}).catch(() => caches.match(e.request)));
    return;
  }
  // Icônes uniquement : cache
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

const CACHE = 'spv-vannes-v6';
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
  // HTML, Firebase : toujours réseau
  if (e.request.url.includes('firebasedatabase') ||
      e.request.url.includes('firebase') ||
      e.request.url.endsWith('.html') ||
      e.request.url.endsWith('/')) {
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

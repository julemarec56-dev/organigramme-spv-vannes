const CACHE = 'spv-vannes-v3';
const ASSETS = [
  '/organigramme-spv-vannes/',
  '/organigramme-spv-vannes/index.html',
  '/organigramme-spv-vannes/admin.html',
  '/organigramme-spv-vannes/nouveau.html',
  '/organigramme-spv-vannes/manifest.json',
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
  // Firebase et ressources externes : réseau uniquement
  if (e.request.url.includes('firebasedatabase') || e.request.url.includes('firebase')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/organigramme-spv-vannes/index.html'));
    })
  );
});

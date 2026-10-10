// NEW ERA v95 — hors ligne
const CACHE = 'new-era-v95';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if(r.method !== 'GET') return;
  const u = new URL(r.url);
  // la page : le réseau d'abord (les mises à jour arrivent), le cache si l'on est hors ligne
  if(r.mode === 'navigate' || (u.origin === location.origin && /\/(index\.html)?$/.test(u.pathname))){
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put('index.html', c)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // le reste (icônes, polices) : le cache d'abord, rempli au passage
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if(res && (res.ok || res.type === 'opaque')){ const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); }
    return res;
  }).catch(() => m)));
});

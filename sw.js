// ESE DB — service worker minimal, pour rendre l'application installable
// (icône + fenêtre autonome sur Windows et Android). L'application reste
// en ligne : on privilégie toujours le réseau, le cache ne sert que de
// secours en cas de coupure très brève, jamais pour les données.
const CACHE = 'ese-db-shell-v1';
const SHELL = ['./', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(e.request))
  );
});

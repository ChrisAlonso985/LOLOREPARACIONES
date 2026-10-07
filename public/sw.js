const CACHE='lolo-real-v70';
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/manifest.webmanifest','/icon.svg','/icon-192.svg?v=2','/icon-512.svg?v=2','/logo-lolo.svg','/lolo/listening.svg'])));
});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);

  // Avatar 3D y JS/CSS estáticos: caché primero para que las siguientes aperturas sean rápidas.
  if(url.origin===self.location.origin && (url.pathname==='/api/lolo-avatar' || url.pathname.startsWith('/_next/static/'))){
    e.respondWith(
      caches.match(e.request).then(hit=>{
        if(hit) return hit;
        return fetch(e.request).then(r=>{
          const copy=r.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request,copy));
          return r;
        });
      })
    );
    return;
  }

  // Resto de la app: red primero con respaldo en caché.
  e.respondWith(fetch(e.request).then(r=>{
    const copy=r.clone();
    caches.open(CACHE).then(cache=>cache.put(e.request,copy));
    return r;
  }).catch(()=>caches.match(e.request)));
});

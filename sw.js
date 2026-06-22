const CACHE = "rastro-v3";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Red primero: siempre trae la versión más nueva si hay conexión;
// solo usa la copia en caché cuando estás sin internet.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((net) => {
        if (net && net.ok) {
          const copy = net.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return net;
      })
      .catch(() => caches.match(e.request))
  );
});

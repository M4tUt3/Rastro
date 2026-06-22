const CACHE = "rastro-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add("./")));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Red primero: siempre intenta traer la versión más nueva; si no hay
// conexión, recurre a lo último que se guardó en caché.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((net) => {
        if (net.ok) {
          const copy = net.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return net;
      })
      .catch(() => caches.match(e.request))
  );
});

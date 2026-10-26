const CACHE = "memento-pwa-v21-20261026-knowledge-v1";
const CORE = ["./assets/memento-fitness-core.js?v=20261026-muscle-v4", "./assets/memento-fitness.js?v=20261026-muscle-v4", "./assets/memento-fitness.css?v=20261026-fitness-v3", "./assets/memento-knowledge.css?v=20261026-kc-v1", "./assets/memento-knowledge-core.js?v=20261026-kc-v1", "./assets/memento-knowledge-store.js?v=20261026-kc-v1", "./assets/memento-backup.js?v=20261026-kc-v1", "./assets/memento-knowledge.js?v=20261026-kc-v1", "./", "./index.html", "./manifest.json", "./assets/memento-icon.png", "./assets/memento-logo-gold.png", "./assets/memento-cozy-background.png", "./assets/memento-avatar.png", "./assets/memento-forest-art.js", "./assets/memento-forest-lock.css", "./assets/memento-forest-lock.js"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("memento-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const isAppDocument = event.request.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/");
  if (isAppDocument) {
    event.respondWith(fetch(event.request).then(response => {
      if (response && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});



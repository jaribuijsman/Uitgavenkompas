const CACHE = "memento-pwa-v26-20261027-design-v1";
const CORE = ["./assets/memento-ui.css?v=20261027-design-v1", "./assets/memento-ui.js?v=20261027-design-v1", "./assets/memento-storage-guard.js?v=20261027-safety-v1", "./assets/memento-fitness-core.js?v=20261026-muscle-v4", "./assets/memento-fitness.js?v=20261026-muscle-v4", "./assets/memento-fitness.css?v=20261027-design-v1", "./assets/memento-knowledge.css?v=20261027-design-v1", "./assets/memento-knowledge-core.js?v=20261026-kc-v1", "./assets/memento-trash-core.js?v=20261026-purge-v2", "./assets/memento-knowledge-store.js?v=20261027-safety-v1", "./assets/memento-backup.js?v=20261026-kc-v1", "./assets/memento-knowledge.js?v=20261027-design-v1", "./", "./index.html", "./manifest.json", "./assets/memento-icon.png", "./assets/memento-logo-gold.png", "./assets/memento-cozy-background.png", "./assets/memento-avatar.png", "./assets/memento-forest-art.js", "./assets/memento-forest-lock.css", "./assets/memento-forest-lock.js"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("memento-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Retire the historical writer even when an old HTML response was cached offline.
  // This cannot stop JavaScript already running in a pre-update document.
  if (url.pathname.endsWith("/uitgavenkompas-v20-pincode-vergrendeling-1.html")) {
    event.respondWith(Promise.resolve(Response.redirect(new URL("./", self.location.href).href, 302)));
    return;
  }
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



const CACHE = "memento-pwa-v90-20261031-global-search-v1";
const CORE = ["./assets/memento-tokens.css?v=20261029-scroll-v1","./assets/memento-base-app.css?v=20261031-base-extract-v1","./assets/memento-disclosure.js?v=20261029-recovery-v2","./assets/memento-layout.css?v=20261031-finance-cascade-clean-v1","./assets/memento-layout.js?v=20261030-agenda-month-v1","./assets/memento-unified-nav.js?v=20261031-extract-v1","./assets/memento-tab-layout.js?v=20261031-extract-v1","./assets/memento-finance-app.js?v=20261031-global-search-v1","./assets/memento-life-app.js?v=20261031-global-search-v1","./assets/memento-glass.css?v=20261030-notes-c-v1","./assets/memento-glass.js?v=20261030-agenda-month-v1","./assets/memento-review-core.js?v=20261029-app-glass-v1","./assets/memento-start.css?v=20261030-feature-carousel-v1","./assets/memento-global-search.css?v=20261031-global-search-v1","./assets/memento-global-search-core.js?v=20261031-global-search-v1","./assets/memento-global-search.js?v=20261031-global-search-v1","./assets/memento-start.js?v=20261030-feature-carousel-fix-v2","./assets/memento-start-agenda.svg","./assets/memento-start-tasks.svg","./assets/memento-assistant-core.js?v=20261030-life-assistant-v1","./assets/memento-assistant.js?v=20261030-life-assistant-v1","./assets/memento-assistant.css?v=20261030-life-assistant-v1","./assets/memento-category-integrity.js?v=20261028-v1","./assets/memento-finance-dashboard-v9.js?v=20261029-scroll-v1","./assets/memento-ui.css?v=20261030-calendar-header-v2","./assets/memento-ui.js?v=20261029-visual-repair-v1","./assets/memento-storage-guard.js?v=20261030-assistant-guard-v1","./assets/memento-fitness-core.js?v=20261028-master-p4","./assets/memento-dictation.js?v=20261029-unified-dictation-v1","./assets/memento-dictation.css?v=20261029-unified-dictation-v1","./assets/memento-fitness.js?v=20261029-app-glass-v1","./assets/memento-fitness.css?v=20261028-master-p4","./assets/memento-knowledge.css?v=20261031-mobile-filter-v1","./assets/memento-knowledge-core.js?v=20261031-knowledge-filters-v1","./assets/memento-trash-core.js?v=20261026-purge-v2","./assets/memento-knowledge-store.js?v=20261027-journal-v1","./assets/memento-backup.js?v=20261027-covers-v1","./assets/memento-knowledge-art.js?v=20261027-covers-v1","./assets/memento-knowledge-cover-ui.js?v=20261027-covers-v1","./assets/memento-illustrative-icons.js?v=20261027-iconset-v2","./assets/memento-illustrative-icons.css?v=20261027-iconset-v2","./assets/memento-knowledge.js?v=20261031-direct-search-events-v1","./","./index.html","./manifest.json","./assets/memento-icon.png","./assets/memento-logo-gold.png","./assets/memento-cozy-background.png","./assets/memento-avatar.png","./assets/memento-forest-art.js?v=20261027-pixelforest-v1","./assets/memento-forest-lock.css?v=20261027-pixelforest-v1","./assets/memento-forest-lock.js?v=20261027-pin-disabled-v1","./assets/pin-forests/ochtendmist.webp","./assets/pin-forests/zonnestralen.webp","./assets/pin-forests/schemermeer.webp","./assets/pin-forests/bosruines.webp","./assets/pin-forests/maanmeer.webp","./assets/pin-forests/herfstbrug.webp","./manifest.json?v=20261030-new-icon-v1","./assets/memento-icon-192.png?v=20261030-new-icon-v1","./assets/memento-icon-512.png?v=20261030-new-icon-v1","./assets/memento-maskable-512.png?v=20261030-new-icon-v1"];
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
    }).catch(() => caches.open(CACHE).then(cache => cache.match(event.request).then(cached => cached || cache.match("./index.html")))));
    return;
  }
  // A previous worker can still finish an in-flight write after activation.
  // Read only this release's cache, even if an obsolete cache reappears.
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request)).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});



/* eslint-env serviceworker */
/* eslint no-restricted-globals: 0 */

const CACHE_NAME = "oms-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/manifest.json",
  "/service-worker.js",
  // Do NOT hardcode static asset names if they are hashed by the build system!
  // Instead, use a catch-all strategy for static assets:
];

// Install: cache app shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Cache the app shell and root files
      await cache.addAll(ASSETS);
      // Dynamically cache all static assets under /static/ (JS, CSS, media) on first fetch
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network, and cache new static assets dynamically
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  // If request is for a static asset (JS, CSS, media), cache it on first fetch
  if (url.pathname.startsWith("/static/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const resp = await fetch(event.request);
          if (resp.status === 200) {
            cache.put(event.request, resp.clone());
          }
          return resp;
        } catch (err) {
          // If offline and not cached, fail
          return new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })
    );
    return;
  }
  // Otherwise, default cache-first for shell
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
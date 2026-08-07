const CACHE_PREFIX = "slowcarb-randomizer";
const VERSION = "dev";
const PRECACHE_URLS = [];

const CACHE_NAME = `${CACHE_PREFIX}-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => {})),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(event));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(staticHandler(event));
    return;
  }

  event.respondWith(genericHandler(event));
});

async function navigationHandler(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const copy = response.clone();
      event.waitUntil(cache.put(request, copy));
    }
    return response;
  } catch {
    const { pathname } = new URL(request.url);
    const fallback =
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match(`${pathname}.html`, { ignoreSearch: true })) ||
      (await cache.match("/", { ignoreSearch: true }));
    return fallback || Response.error();
  }
}

async function staticHandler(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const copy = response.clone();
    event.waitUntil(cache.put(request, copy));
  }
  return response;
}

async function genericHandler(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const copy = response.clone();
    event.waitUntil(cache.put(request, copy));
  }
  return response;
}

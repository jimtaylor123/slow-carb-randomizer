const CACHE_PREFIX = "slowcarb-randomizer";
const VERSION = "2";
const SHELL_URLS = ["/", "/saved", "/settings", "/diet"];

const CACHE_NAME = `${CACHE_PREFIX}-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(SHELL_URLS.map((url) => cache.add(url).catch(() => {}))),
      )
      .then(() => self.skipWaiting()),
  );
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

  event.respondWith(cacheFirstHandler(event));
});

async function navigationHandler(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const copy = response.clone();
      const url = new URL(request.url);
      url.search = "";
      event.waitUntil(cache.put(url.toString(), copy));
    }
    return response;
  } catch {
    const { pathname } = new URL(request.url);
    const normalized = pathname.replace(/\/+$/, "") || "/";
    const fallback =
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match(`${normalized}.html`, { ignoreSearch: true })) ||
      (await cache.match(normalized, { ignoreSearch: true })) ||
      (await cache.match("/", { ignoreSearch: true }));
    return fallback || Response.error();
  }
}

async function cacheFirstHandler(event) {
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

const CACHE = "aikos-v1";
const ASSETS = ["/", "/manifest.webmanifest", "/favicon-192.png", "/logo-512.png"];

self.addEventListener("install", (e) => {
  // @ts-ignore
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(()=>{})));
  // @ts-ignore
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // @ts-ignore
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k)=>k!==CACHE).map((k)=>caches.delete(k)))));
  // @ts-ignore
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // jangan cache API / auth
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/dashboard/")) return;
  if (req.method !== "GET") return;
  // @ts-ignore
  e.respondWith(
    caches.match(req).then((hit) => {
      const fetchPromise = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=>hit);
      return hit || fetchPromise;
    })
  );
});

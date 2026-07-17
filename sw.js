/**
 * sw.js — 完全オフライン対応のための Service Worker
 * data/*.json も含めてすべてキャッシュします。
 * ファイルを修正したら CACHE_NAME の数字を1つ上げてください。
 */
const CACHE_NAME = "machikaigi-wm-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./js/worldmodel.js",
  "./js/graph.js",
  "./js/app.js",
  "./data/nodes.json",
  "./data/edges.json",
  "./data/citizens.json",
  "./data/events.json",
  "./data/policies.json",
  "./data/scenario.json",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
